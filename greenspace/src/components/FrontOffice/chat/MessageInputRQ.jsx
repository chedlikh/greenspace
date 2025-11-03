import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useSendTextMessage } from '../../../services/messageHooks';
import { useStartTyping, useStopTyping } from '../../../services/typingIndicatorHooks';
import { useSelector } from 'react-redux';

function MessageInputRQ({ conversationId }) {
  const [message, setMessage] = useState('');
  const sendTextMessageMutation = useSendTextMessage();
  const startTypingMutation = useStartTyping();
  const stopTypingMutation = useStopTyping();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const { user } = useSelector((state) => state.auth);

  console.log('[MessageInputRQ] Rendered', {
    conversationId,
    userId: user?.id,
    username: user?.username,
  });

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    if (!user || !e.target.value.trim()) {
      console.log('[MessageInputRQ] Skipping typing event', {
        hasUser: !!user,
        hasInput: !!e.target.value.trim(),
      });
      return;
    }

    if (!isTypingRef.current) {
      console.log('[MessageInputRQ] Sending typing start', { userId: user.id, username: user.username });
      startTypingMutation.mutate(conversationId, {
        onError: (error) => {
          console.error('[MessageInputRQ] Error sending typing start via REST', error);
        },
      });
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        console.log('[MessageInputRQ] Sending typing stop', { userId: user.id, username: user.username });
        stopTypingMutation.mutate(conversationId, {
          onError: (error) => {
            console.error('[MessageInputRQ] Error sending typing stop via REST', error);
          },
        });
        isTypingRef.current = false;
      }
    }, 6000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || sendTextMessageMutation.isPending) {
      console.log('[MessageInputRQ] Skipping message send', {
        hasMessage: !!message.trim(),
        isSending: sendTextMessageMutation.isPending,
      });
      return;
    }

    console.log('[MessageInputRQ] Sending message', { conversationId, content: message });
    sendTextMessageMutation.mutate(
      { conversationId, content: message },
      {
        onSuccess: (data) => {
          console.log('[MessageInputRQ] Message sent successfully', data);
          setMessage('');
          if (isTypingRef.current) {
            console.log('[MessageInputRQ] Sending typing stop after message send');
            stopTypingMutation.mutate(conversationId, {
              onError: (error) => {
                console.error('[MessageInputRQ] Error sending typing stop after message', error);
              },
            });
            isTypingRef.current = false;
            clearTimeout(typingTimeoutRef.current);
          }
        },
        onError: (error) => {
          console.error('[MessageInputRQ] Failed to send message', {
            error: error.message,
            response: error.response?.data,
          });
        },
      }
    );
  };

  useEffect(() => {
    return () => {
      console.log('[MessageInputRQ] Cleaning up');
      if (isTypingRef.current && user) {
        console.log('[MessageInputRQ] Sending typing stop on unmount');
        stopTypingMutation.mutate(conversationId, {
          onError: (error) => {
            console.error('[MessageInputRQ] Error sending typing stop via REST on unmount', error);
          },
        });
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, user, stopTypingMutation]);

  return (
    <form onSubmit={handleSubmit} className="message-input flex items-center p-3 border-t border-gray-200 bg-gray-50">
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        placeholder="Type a message..."
        className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={sendTextMessageMutation.isPending}
      />
      <button
        type="submit"
        className={`p-2 rounded-full text-white transition ml-2 ${
          sendTextMessageMutation.isPending || !message.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        disabled={sendTextMessageMutation.isPending || !message.trim()}
      >
        <PaperAirplaneIcon className="h-5 w-5" />
      </button>
    </form>
  );
}

MessageInputRQ.propTypes = {
  conversationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default MessageInputRQ;