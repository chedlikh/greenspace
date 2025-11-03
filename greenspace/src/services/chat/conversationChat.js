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

// --- Conversation Endpoints ---
export const createConversation = (data) =>
  fetchData('/api/conversations', { method: 'POST', body: JSON.stringify(data) });

export const createDirectConversation = (otherUserId) =>
  fetchData(`/api/conversations/direct?otherUserId=${otherUserId}`, { method: 'POST' });

export const createGroupConversation = ({ name, description, participantIds }) =>
  fetchData(`/api/conversations/group?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description || '')}&participantIds=${participantIds.join(',')}`, {
    method: 'POST',
  });

export const fetchConversationById = (conversationId) =>
  fetchData(`/api/conversations/${conversationId}`);

export const fetchUserConversations = async () => {
  const response = await fetchData('/api/conversations');
  return Array.isArray(response) ? response : response.content || [];
};

export const fetchUserConversationsPaginated = async (page = 0, size = 10) => {
  const response = await fetchData(`/api/conversations/paged?page=${page}&size=${size}`);
  return response.content || [];
};

export const updateConversation = (conversationId, data) =>
  fetchData(`/api/conversations/${conversationId}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteConversation = (conversationId) =>
  fetchData(`/api/conversations/${conversationId}`, { method: 'DELETE' });

export const addParticipant = (conversationId, userId, role) =>
  fetchData(`/api/conversations/${conversationId}/participants?userId=${userId}&role=${role}`, {
    method: 'POST',
  });

export const addMultipleParticipants = (conversationId, userIds) =>
  fetchData(`/api/conversations/${conversationId}/participants/bulk`, {
    method: 'POST',
    body: JSON.stringify(userIds),
  });

export const removeParticipant = (conversationId, userId) =>
  fetchData(`/api/conversations/${conversationId}/participants/${userId}`, { method: 'DELETE' });

export const leaveConversation = (conversationId) =>
  fetchData(`/api/conversations/${conversationId}/leave`, { method: 'POST' });

export const updateParticipantRole = (conversationId, userId, role) =>
  fetchData(`/api/conversations/${conversationId}/participants/${userId}/role?role=${role}`, {
    method: 'PUT',
  });

export const fetchConversationParticipants = (conversationId) =>
  fetchData(`/api/conversations/${conversationId}/participants`);

export const isUserParticipant = (conversationId, userId) =>
  fetchData(`/api/conversations/${conversationId}/participants/${userId}/exists`);

export const isUserAdmin = (conversationId, userId) =>
  fetchData(`/api/conversations/${conversationId}/participants/${userId}/admin`);

export const searchConversations = (query) =>
  fetchData(`/api/conversations/search?query=${encodeURIComponent(query)}`);

export const fetchActiveConversations = () =>
  fetchData('/api/conversations/active');

export const fetchArchivedConversations = () =>
  fetchData('/api/conversations/archived');

export const updateGroupDetails = (conversationId, { name, description, groupImage }) =>
  fetchData(`/api/conversations/${conversationId}/group?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description || '')}&groupImage=${encodeURIComponent(groupImage || '')}`, {
    method: 'PUT',
  });

export const updateGroupImage = (conversationId, imagePath) =>
  fetchData(`/api/conversations/${conversationId}/group/image?imagePath=${encodeURIComponent(imagePath)}`, {
    method: 'PUT',
  });

export const updateNotificationSettings = (conversationId, enabled) =>
  fetchData(`/api/conversations/${conversationId}/notifications?enabled=${enabled}`, {
    method: 'PUT',
  });

export const updateLastSeen = (conversationId) =>
  fetchData(`/api/conversations/${conversationId}/last-seen`, { method: 'PUT' });

export const fetchOnlineParticipants = (conversationId) =>
  fetchData(`/api/conversations/${conversationId}/participants/online`);

export const fetchExistingDirectConversation = (otherUserId) =>
  fetchData(`/api/conversations/direct/existing?otherUserId=${otherUserId}`);

export const getOrCreateDirectConversation = (otherUserId) =>
  fetchData(`/api/conversations/direct/get-or-create?otherUserId=${otherUserId}`);

// --- Conversation React Query Hooks ---
export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
};

export const useCreateDirectConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDirectConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
};

export const useCreateGroupConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroupConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
};

export const useConversationById = (conversationId) =>
  useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: () => fetchConversationById(conversationId),
    enabled: !!conversationId,
  });

export const useUserConversations = () =>
  useQuery({
    queryKey: ['conversations'],
    queryFn: () => fetchUserConversations(),
  });

export const useUserConversationsPaginated = (page = 0, size = 10) =>
  useQuery({
    queryKey: ['conversations', page, size],
    queryFn: () => fetchUserConversationsPaginated(page, size),
    keepPreviousData: true,
  });

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, data }) => updateConversation(conversationId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
};

export const useAddParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, userId, role }) => addParticipant(conversationId, userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations', 'participants'] }),
  });
};

export const useAddMultipleParticipants = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, userIds }) => addMultipleParticipants(conversationId, userIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations', 'participants'] }),
  });
};

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, userId }) => removeParticipant(conversationId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations', 'participants'] }),
  });
};

export const useLeaveConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations', 'participants'] }),
  });
};

export const useUpdateParticipantRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, userId, role }) => updateParticipantRole(conversationId, userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations', 'participants'] }),
  });
};

export const useConversationParticipants = (conversationId) =>
  useQuery({
    queryKey: ['conversations', conversationId, 'participants'],
    queryFn: () => fetchConversationParticipants(conversationId),
    enabled: !!conversationId,
  });

export const useIsUserParticipant = (conversationId, userId) =>
  useQuery({
    queryKey: ['conversations', conversationId, 'participants', userId, 'exists'],
    queryFn: () => isUserParticipant(conversationId, userId),
    enabled: !!(conversationId && userId),
  });

export const useIsUserAdmin = (conversationId, userId) =>
  useQuery({
    queryKey: ['conversations', conversationId, 'participants', userId, 'admin'],
    queryFn: () => isUserAdmin(conversationId, userId),
    enabled: !!(conversationId && userId),
  });

export const useSearchConversations = (query) =>
  useQuery({
    queryKey: ['conversations', 'search', query],
    queryFn: () => searchConversations(query),
    enabled: !!query,
  });

export const useActiveConversations = () =>
  useQuery({
    queryKey: ['conversations', 'active'],
    queryFn: () => fetchActiveConversations(),
  });

export const useArchivedConversations = () =>
  useQuery({
    queryKey: ['conversations', 'archived'],
    queryFn: () => fetchArchivedConversations(),
  });

export const useUpdateGroupDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, data }) => updateGroupDetails(conversationId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
};

export const useUpdateGroupImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, imagePath }) => updateGroupImage(conversationId, imagePath),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, enabled }) => updateNotificationSettings(conversationId, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations', 'participants'] }),
  });
};

export const useUpdateLastSeen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLastSeen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations', 'participants'] }),
  });
};

export const useOnlineParticipants = (conversationId) =>
  useQuery({
    queryKey: ['conversations', conversationId, 'participants', 'online'],
    queryFn: () => fetchOnlineParticipants(conversationId),
    enabled: !!conversationId,
  });

export const useExistingDirectConversation = (otherUserId) =>
  useQuery({
    queryKey: ['conversations', 'direct', otherUserId],
    queryFn: () => fetchExistingDirectConversation(otherUserId),
    enabled: !!otherUserId,
  });

export const useGetOrCreateDirectConversation = (otherUserId) =>
  useQuery({
    queryKey: ['conversations', 'direct', 'get-or-create', otherUserId],
    queryFn: () => getOrCreateDirectConversation(otherUserId),
    enabled: !!otherUserId,
  });