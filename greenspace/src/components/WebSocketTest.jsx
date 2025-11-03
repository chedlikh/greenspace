import React, { useState, useEffect } from 'react';
import { useWebSocketContext } from '../features/WebSocketProvider';
import { useSelector } from 'react-redux';
import axios from 'axios';

const WebSocketTest = () => {
  const { stompClient, isConnected } = useWebSocketContext();
  const { token } = useSelector((state) => state.auth);
  const [otherUserId, setOtherUserId] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  // Start or get a test conversation with another user
  const startTestConversation = async () => {
    console.log("chedli says: Starting test conversation attempt with user ID:", otherUserId);
    if (!otherUserId) {
      console.log("chedli says: No user ID provided, please enter a valid ID");
      return;
    }
    if (!token) {
      console.log("chedli says: No auth token found, please check login status");
      return;
    }
    if (!isConnected || !stompClient) {
      console.log("chedli says: WebSocket is not connected, cannot proceed");
      return;
    }
    try {
      console.log("chedli says: Making API call to get or create conversation");
      const response = await axios.get(
        `/api/conversations/direct/get-or-create?otherUserId=${otherUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("chedli says: API call successful, response:", response.data);
      setConversationId(response.data.id);
      console.log("chedli says: Conversation ID updated to:", response.data.id);
    } catch (error) {
      console.error("chedli says: Failed to start test conversation, error:", error.message);
    }
  };

  // Subscribe to WebSocket topic when conversationId changes
  useEffect(() => {
    if (!stompClient) {
      console.log("chedli says: No stompClient available, skipping subscription");
      return;
    }
    if (!conversationId) {
      console.log("chedli says: No conversation ID yet, subscription not started");
      return;
    }
    console.log("chedli says: Setting up WebSocket subscription for conversation ID:", conversationId);
    const subscription = stompClient.subscribe(
      `/topic/conversation/${conversationId}`,
      (message) => {
        console.log("chedli says: New message received from WebSocket:", message.body);
        const receivedMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, receivedMessage]);
      }
    );
    return () => {
      console.log("chedli says: Cleaning up subscription for conversation ID:", conversationId);
      subscription.unsubscribe();
    };
  }, [stompClient, conversationId]);

  // Send a message via WebSocket
  const sendMessage = () => {
    console.log("chedli says: Attempting to send message, checking conditions");
    if (!stompClient) {
      console.log("chedli says: No stompClient, cannot send message");
      return;
    }
    if (!conversationId) {
      console.log("chedli says: No conversation ID, cannot send message");
      return;
    }
    if (!inputMessage) {
      console.log("chedli says: No message content entered, cannot send");
      return;
    }
    const messagePayload = {
      conversationId,
      content: inputMessage,
      type: 'TEXT',
    };
    console.log("chedli says: Sending message payload:", messagePayload);
    stompClient.publish({
      destination: '/app/send',
      body: JSON.stringify(messagePayload),
    });
    setInputMessage('');
    console.log("chedli says: Message sent and input cleared");
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>WebSocket Test</h2>
      {!conversationId ? (
        <div>
          <input
            type="text"
            placeholder="Other User ID"
            value={otherUserId}
            onChange={(e) => {
              setOtherUserId(e.target.value);
              console.log("chedli says: User ID input updated to:", e.target.value);
            }}
            style={{ marginRight: '10px' }}
          />
          <button onClick={startTestConversation}>Start Test Conversation</button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '10px' }}>
            {messages.map((msg, index) => (
              <div key={index}>{msg.content}</div>
            ))}
          </div>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              console.log("chedli says: Message input updated to:", e.target.value);
            }}
            style={{ marginRight: '10px' }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default WebSocketTest;