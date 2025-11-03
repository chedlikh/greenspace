import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useChatSubscription } from '../services/websocket';

const ChatManager = () => {
  const { id: conversationId } = useParams();
  const { token, user } = useSelector((state) => state.auth);
  const isLoggedIn = !!token && !!user;

  useChatSubscription(conversationId);

  return null;
};

export default ChatManager;