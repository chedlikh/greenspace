// hooks/conversationHooks.js
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";

// --- API Client Logic (Merged) ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

const getToken = () => localStorage.getItem("token");

const apiClient = async (endpoint, { body, method = "GET", params, headers = {}, ...customConfig } = {}) => {
  const token = getToken();
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  if (body) {
    if (body instanceof FormData) {
      delete config.headers["Content-Type"];
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const queryParams = new URLSearchParams(params);
    url += `?${queryParams.toString()}`;
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) { /* Ignore */ }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    } else {
        return await response.text();
    }

  } catch (error) {
    console.error("API Client Error:", error);
    throw error;
  }
};

// --- Conversation Query Keys ---
export const conversationKeys = {
  all: ["conversations"],
  lists: () => [...conversationKeys.all, "list"],
  list: (filters) => [...conversationKeys.lists(), { filters }],
  details: () => [...conversationKeys.all, "detail"],
  detail: (id) => [...conversationKeys.details(), id],
  participants: (id) => [...conversationKeys.detail(id), "participants"],
  onlineParticipants: (id) => [...conversationKeys.detail(id), "onlineParticipants"],
  search: (query) => [...conversationKeys.all, "search", query],
  active: () => [...conversationKeys.all, "active"],
  archived: () => [...conversationKeys.all, "archived"],
  directExists: (otherUserId) => [...conversationKeys.all, "direct", "exists", otherUserId],
};

// --- Conversation Queries ---

// GET /api/conversations
export const useUserConversations = (options = {}) => {
  return useQuery({
    queryKey: conversationKeys.lists(),
    queryFn: () => apiClient("/api/conversations"),
    ...options,
  });
};

// GET /api/conversations/paged
export const useUserConversationsPaginated = (page = 0, size = 20, options = {}) => {
  return useQuery({
    queryKey: conversationKeys.list({ page, size }),
    queryFn: () => apiClient("/api/conversations/paged", { params: { page, size } }),
    keepPreviousData: true,
    ...options,
  });
};

// GET /api/conversations/{conversationId}
export const useConversationById = (conversationId, options = {}) => {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId),
    queryFn: () => apiClient(`/api/conversations/${conversationId}`),
    enabled: !!conversationId,
    ...options,
  });
};

// GET /api/conversations/{conversationId}/participants
export const useConversationParticipants = (conversationId, options = {}) => {
  return useQuery({
    queryKey: conversationKeys.participants(conversationId),
    queryFn: () => apiClient(`/api/conversations/${conversationId}/participants`),
    enabled: !!conversationId,
    ...options,
  });
};

// GET /api/conversations/{conversationId}/participants/{userId}/exists
export const useIsUserParticipant = (conversationId, userId, options = {}) => {
  return useQuery({
    queryKey: [...conversationKeys.participants(conversationId), userId, "exists"],
    queryFn: () => apiClient(`/api/conversations/${conversationId}/participants/${userId}/exists`),
    enabled: !!conversationId && !!userId,
    ...options,
  });
};

// GET /api/conversations/{conversationId}/participants/{userId}/admin
export const useIsUserAdmin = (conversationId, userId, options = {}) => {
  return useQuery({
    queryKey: [...conversationKeys.participants(conversationId), userId, "admin"],
    queryFn: () => apiClient(`/api/conversations/${conversationId}/participants/${userId}/admin`),
    enabled: !!conversationId && !!userId,
    ...options,
  });
};

// GET /api/conversations/search
export const useSearchConversations = (query, options = {}) => {
  return useQuery({
    queryKey: conversationKeys.search(query),
    queryFn: () => apiClient("/api/conversations/search", { params: { query } }),
    enabled: !!query,
    ...options,
  });
};

// GET /api/conversations/active
export const useActiveConversations = (options = {}) => {
  return useQuery({
    queryKey: conversationKeys.active(),
    queryFn: () => apiClient("/api/conversations/active"),
    ...options,
  });
};

// GET /api/conversations/archived
export const useArchivedConversations = (options = {}) => {
  return useQuery({
    queryKey: conversationKeys.archived(),
    queryFn: () => apiClient("/api/conversations/archived"),
    ...options,
  });
};

// GET /api/conversations/{conversationId}/participants/online
export const useOnlineParticipants = (conversationId, options = {}) => {
  return useQuery({
    queryKey: conversationKeys.onlineParticipants(conversationId),
    queryFn: () => apiClient(`/api/conversations/${conversationId}/participants/online`),
    enabled: !!conversationId,
    refetchInterval: 30000,
    ...options,
  });
};

// GET /api/conversations/direct/existing
export const useExistingDirectConversation = (otherUserId, options = {}) => {
  return useQuery({
    queryKey: conversationKeys.directExists(otherUserId),
    queryFn: () => apiClient("/api/conversations/direct/existing", { params: { otherUserId } }),
    enabled: !!otherUserId,
    retry: false,
    ...options,
  });
};

// GET /api/conversations/direct/get-or-create
export const useGetOrCreateDirectConversation = (otherUserId, options = {}) => {
    return useQuery({
      queryKey: [...conversationKeys.all, "direct", "get-or-create", otherUserId],
      queryFn: () => apiClient("/api/conversations/direct/get-or-create", { params: { otherUserId } }),
      enabled: !!otherUserId,
      ...options,
    });
  };

// --- Conversation Mutations ---

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/conversations
    mutationFn: (createDTO) => apiClient("/api/conversations", { method: "POST", body: createDTO }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.setQueryData(conversationKeys.detail(data.id), data);
    },
  });
};

export const useCreateDirectConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/conversations/direct
    mutationFn: (otherUserId) => apiClient("/api/conversations/direct", { method: "POST", params: { otherUserId } }),
    onSuccess: (data, otherUserId) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.directExists(otherUserId) });
    },
  });
};

export const useCreateGroupConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/conversations/group
    mutationFn: ({ name, description, participantIds }) => apiClient("/api/conversations/group", { method: "POST", params: { name, description, participantIds: participantIds.join(",") } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/conversations/{conversationId}
    mutationFn: ({ conversationId, conversationDTO }) => apiClient(`/api/conversations/${conversationId}`, { method: "PUT", body: conversationDTO }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.setQueryData(conversationKeys.detail(variables.conversationId), data);
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({ // DELETE /api/conversations/{conversationId}
    mutationFn: (conversationId) => apiClient(`/api/conversations/${conversationId}`, { method: "DELETE" }),
    onSuccess: (data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.removeQueries({ queryKey: conversationKeys.detail(conversationId) });
      // Invalidate messages too
      queryClient.invalidateQueries({ queryKey: ["messages", "list", conversationId] }); // Use messageKeys if imported
    },
  });
};

export const useAddParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/conversations/{conversationId}/participants
    mutationFn: ({ conversationId, userId, role }) => apiClient(`/api/conversations/${conversationId}/participants`, { method: "POST", params: { userId, role } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.participants(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(variables.conversationId) });
    },
  });
};

export const useAddMultipleParticipants = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/conversations/{conversationId}/participants/bulk
    mutationFn: ({ conversationId, userIds }) => apiClient(`/api/conversations/${conversationId}/participants/bulk`, { method: "POST", body: userIds }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.participants(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(variables.conversationId) });
    },
  });
};

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({ // DELETE /api/conversations/{conversationId}/participants/{userId}
    mutationFn: ({ conversationId, userId }) => apiClient(`/api/conversations/${conversationId}/participants/${userId}`, { method: "DELETE" }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.participants(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(variables.conversationId) });
    },
  });
};

export const useLeaveConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/conversations/{conversationId}/leave
    mutationFn: (conversationId) => apiClient(`/api/conversations/${conversationId}/leave`, { method: "POST" }),
    onSuccess: (data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.removeQueries({ queryKey: conversationKeys.detail(conversationId) });
      queryClient.invalidateQueries({ queryKey: ["messages", "list", conversationId] }); // Use messageKeys if imported
    },
  });
};

export const useUpdateParticipantRole = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/conversations/{conversationId}/participants/{userId}/role
    mutationFn: ({ conversationId, userId, role }) => apiClient(`/api/conversations/${conversationId}/participants/${userId}/role`, { method: "PUT", params: { role } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.participants(variables.conversationId) });
    },
  });
};

export const useUpdateGroupDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/conversations/{conversationId}/group
    mutationFn: ({ conversationId, name, description, groupImage }) => apiClient(`/api/conversations/${conversationId}/group`, { method: "PUT", params: { name, description, groupImage } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.setQueryData(conversationKeys.detail(variables.conversationId), data);
    },
  });
};

export const useUpdateGroupImage = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/conversations/{conversationId}/group/image
    mutationFn: ({ conversationId, imagePath }) => apiClient(`/api/conversations/${conversationId}/group/image`, { method: "PUT", params: { imagePath } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.setQueryData(conversationKeys.detail(variables.conversationId), data);
    },
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/conversations/{conversationId}/notifications
    mutationFn: ({ conversationId, enabled }) => apiClient(`/api/conversations/${conversationId}/notifications`, { method: "PUT", params: { enabled } }),
    onSuccess: (data, variables) => {
      // queryClient.invalidateQueries({ queryKey: conversationKeys.detail(variables.conversationId) });
    },
  });
};

export const useUpdateLastSeen = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/conversations/{conversationId}/last-seen
    mutationFn: (conversationId) => apiClient(`/api/conversations/${conversationId}/last-seen`, { method: "PUT" }),
    onSuccess: () => {
      // WebSocket should handle unread count updates
    },
  });
};

