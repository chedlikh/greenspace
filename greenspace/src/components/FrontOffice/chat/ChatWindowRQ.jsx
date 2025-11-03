// components/Chat/ChatWindowRQ.jsx
import React, { useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import ChatHeaderRQ from "./ChatHeaderRQ";
import MessageListRQ from "./MessageListRQ";
import MessageInputRQ from "./MessageInputRQ";
import TypingIndicatorRQ from "./TypingIndicatorRQ"; // Import TypingIndicatorRQ
import { useConversationById } from "../../../services/conversationHooks";
import { useConversationMessages } from "../../../services/messageHooks";
import { useChatSubscription } from "../../../services/websocketChat";

function ChatWindowRQ({ conversationId }) {
  const messagesEndRef = useRef(null);

  const { data: conversation, isLoading: isLoadingConversation, isError: isErrorConversation, error: errorConversation } = useConversationById(conversationId);
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages,
    isError: isErrorMessages,
    error: errorMessages,
  } = useConversationMessages(conversationId);
  const { typingUsers } = useChatSubscription(conversationId);

  const messages = useMemo(() => {
    if (!messagesData?.pages) return [];
    const allMessagesRaw = messagesData.pages.flatMap(page => page.content);
    const uniqueMessagesMap = new Map();
    allMessagesRaw.forEach(msg => {
      if (msg && msg.id != null && !uniqueMessagesMap.has(msg.id)) {
        uniqueMessagesMap.set(msg.id, msg);
      }
    });
    return Array.from(uniqueMessagesMap.values()).reverse();
  }, [messagesData]);

  useEffect(() => {
    if (!isFetchingNextPage) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isFetchingNextPage]);

  if (!conversationId) {
    return <div className="flex items-center justify-center h-full text-gray-500">Sélectionnez une conversation pour commencer.</div>;
  }

  if (isLoadingConversation) {
    return <div className="flex items-center justify-center h-full text-gray-500">Chargement de la conversation...</div>;
  }

  if (isErrorConversation) {
    return <div className="flex items-center justify-center h-full text-red-500">Erreur conversation: {errorConversation?.message || 'Erreur inconnue'}</div>;
  }

  if (!conversation) {
    return <div className="flex items-center justify-center h-full text-gray-500">Conversation non trouvée.</div>;
  }

  return (
    <div className="chat-window flex flex-col h-full bg-white">
      <ChatHeaderRQ conversation={conversation} />
      <TypingIndicatorRQ typingUsers={typingUsers} />
      <MessageListRQ
        messages={messages}
        isLoading={isLoadingMessages}
        isError={isErrorMessages}
        error={errorMessages}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        messagesEndRef={messagesEndRef}
      />
      <MessageInputRQ conversationId={conversationId} />
    </div>
  );
}

ChatWindowRQ.propTypes = {
  conversationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ChatWindowRQ;