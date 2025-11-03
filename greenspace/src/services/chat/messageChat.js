// src/services/chat/messageChat.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089';

// Generic fetch utility with token authentication
const fetchData = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Authentication token not found. Please log in.');

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use default message
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content responses
    if (response.status === 204) return null;

    return response.json();
  } catch (error) {
    throw new Error(`Fetch error: ${error.message}`);
  }
};

// Generic fetch utility for file uploads (multipart/form-data)
const fetchFileData = async (url, file, additionalParams = {}) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Authentication token not found. Please log in.');

  const formData = new FormData();
  formData.append('file', file);
  Object.keys(additionalParams).forEach((key) => {
    formData.append(key, additionalParams[key]);
  });

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use default message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    throw new Error(`Fetch error: ${error.message}`);
  }
};

// --- Message Endpoints ---
export const sendMessage = (data) =>
  fetchData('/api/messages', { method: 'POST', body: JSON.stringify(data) });

export const sendTextMessage = (conversationId, content) =>
  fetchData(`/api/messages/text/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify(content),
  });

export const sendMediaMessage = (conversationId, file, type) =>
  fetchFileData(`/api/messages/media/${conversationId}`, file, { type });

export const sendVoiceMessage = (conversationId, voiceFile) =>
  fetchFileData(`/api/messages/voice/${conversationId}`, voiceFile);

export const sendLocationMessage = (conversationId, location) =>
  fetchData(`/api/messages/location/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify(location),
  });

export const fetchMessageById = (messageId) =>
  fetchData(`/api/messages/${messageId}`);

export const fetchConversationMessages = (conversationId, pageable = { page: 0, size: 20 }) =>
  fetchData(`/api/messages/conversation/${conversationId}?page=${pageable.page}&size=${pageable.size}`);

export const fetchRecentMessages = (conversationId, limit) =>
  fetchData(`/api/messages/recent/${conversationId}?limit=${limit}`);

export const markMessageAsDelivered = (messageId) =>
  fetchData(`/api/messages/${messageId}/delivered`, { method: 'PUT' });

export const markMessageAsRead = (messageId) =>
  fetchData(`/api/messages/${messageId}/read`, { method: 'PUT' });

export const markConversationMessagesAsRead = (conversationId) =>
  fetchData(`/api/messages/conversation/${conversationId}/read`, { method: 'PUT' });

export const fetchUnreadMessages = () =>
  fetchData('/api/messages/unread');

export const fetchUnreadMessagesCount = (conversationId) =>
  fetchData(`/api/messages/unread/count/${conversationId}`);

export const editMessage = (messageId, newContent) =>
  fetchData(`/api/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify(newContent),
  });

export const deleteMessage = (messageId) =>
  fetchData(`/api/messages/${messageId}`, { method: 'DELETE' });

export const deleteMessageForEveryone = (messageId) =>
  fetchData(`/api/messages/${messageId}/everyone`, { method: 'DELETE' });

export const replyToMessage = (originalMessageId, content) =>
  fetchData(`/api/messages/reply/${originalMessageId}`, {
    method: 'POST',
    body: JSON.stringify(content),
  });

export const fetchMessageReplies = (messageId) =>
  fetchData(`/api/messages/${messageId}/replies`);

export const forwardMessages = (messageIds, targetConversationId) =>
  fetchData(`/api/messages/forward?targetConversationId=${targetConversationId}`, {
    method: 'POST',
    body: JSON.stringify(messageIds),
  });

export const searchMessages = (searchDTO) =>
  fetchData('/api/messages/search', { method: 'POST', body: JSON.stringify(searchDTO) });

export const searchMessagesInConversation = (conversationId, query, pageable = { page: 0, size: 20 }) =>
  fetchData(`/api/messages/search/conversation/${conversationId}?query=${encodeURIComponent(query)}&page=${pageable.page}&size=${pageable.size}`);

export const uploadAttachment = (messageId, file) =>
  fetchFileData(`/api/messages/${messageId}/attachments`, file);

export const fetchMessageAttachments = (messageId) =>
  fetchData(`/api/messages/${messageId}/attachments`);

export const deleteAttachment = (attachmentId) =>
  fetchData(`/api/messages/attachments/${attachmentId}`, { method: 'DELETE' });

export const addReaction = (messageId, emoji) =>
  fetchData(`/api/messages/${messageId}/reactions`, {
    method: 'POST',
    body: JSON.stringify(emoji),
  });

export const removeReaction = (messageId, emoji) =>
  fetchData(`/api/messages/${messageId}/reactions?emoji=${encodeURIComponent(emoji)}`, {
    method: 'DELETE',
  });

export const fetchMessageReactions = (messageId) =>
  fetchData(`/api/messages/${messageId}/reactions`);

export const sendSystemMessage = (conversationId, content) =>
  fetchData(`/api/messages/system/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify(content),
  });

// --- Message React Query Hooks ---
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useSendTextMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content }) => sendTextMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useSendMediaMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, file, type }) => sendMediaMessage(conversationId, file, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useSendVoiceMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, voiceFile }) => sendVoiceMessage(conversationId, voiceFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useSendLocationMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, location }) => sendLocationMessage(conversationId, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMessageById = (messageId) =>
  useQuery({
    queryKey: ['messages', messageId],
    queryFn: () => fetchMessageById(messageId),
    enabled: !!messageId,
  });

export const useConversationMessages = (conversationId, pageable = { page: 0, size: 20 }) =>
  useQuery({
    queryKey: ['messages', conversationId, pageable.page, pageable.size],
    queryFn: () => fetchConversationMessages(conversationId, pageable),
    enabled: !!conversationId,
    keepPreviousData: true,
  });

export const useRecentMessages = (conversationId, limit = 10) =>
  useQuery({
    queryKey: ['messages', conversationId, 'recent', limit],
    queryFn: () => fetchRecentMessages(conversationId, limit),
    enabled: !!conversationId,
  });

export const useMarkMessageAsDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markMessageAsDelivered,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markMessageAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMarkConversationMessagesAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markConversationMessagesAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useUnreadMessages = () =>
  useQuery({
    queryKey: ['messages', 'unread'],
    queryFn: fetchUnreadMessages,
  });

export const useUnreadMessagesCount = (conversationId) =>
  useQuery({
    queryKey: ['messages', conversationId, 'unread', 'count'],
    queryFn: () => fetchUnreadMessagesCount(conversationId),
    enabled: !!conversationId,
  });

export const useEditMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, newContent }) => editMessage(messageId, newContent),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });
};

export const useDeleteMessageForEveryone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMessageForEveryone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });
};

export const useReplyToMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ originalMessageId, content }) => replyToMessage(originalMessageId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMessageReplies = (messageId) =>
  useQuery({
    queryKey: ['messages', messageId, 'replies'],
    queryFn: () => fetchMessageReplies(messageId),
    enabled: !!messageId,
  });

export const useForwardMessages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageIds, targetConversationId }) => forwardMessages(messageIds, targetConversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useSearchMessages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: searchMessages,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', 'search'] }),
  });
};

export const useSearchMessagesInConversation = (conversationId, query, pageable = { page: 0, size: 20 }) =>
  useQuery({
    queryKey: ['messages', conversationId, 'search', query, pageable.page, pageable.size],
    queryFn: () => searchMessagesInConversation(conversationId, query, pageable),
    enabled: !!(conversationId && query),
    keepPreviousData: true,
  });

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, file }) => uploadAttachment(messageId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', 'attachments'] }),
  });
};

export const useMessageAttachments = (messageId) =>
  useQuery({
    queryKey: ['messages', messageId, 'attachments'],
    queryFn: () => fetchMessageAttachments(messageId),
    enabled: !!messageId,
  });

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', 'attachments'] }),
  });
};

export const useAddReaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }) => addReaction(messageId, emoji),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', 'reactions'] }),
  });
};

export const useRemoveReaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }) => removeReaction(messageId, emoji),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', 'reactions'] }),
  });
};

export const useMessageReactions = (messageId) =>
  useQuery({
    queryKey: ['messages', messageId, 'reactions'],
    queryFn: () => fetchMessageReactions(messageId),
    enabled: !!messageId,
  });

export const useSendSystemMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content }) => sendSystemMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
