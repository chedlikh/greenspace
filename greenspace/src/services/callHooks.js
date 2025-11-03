// hooks/callHooks.js
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

// --- Call Query Keys ---
export const callKeys = {
  all: ["calls"],
  lists: () => [...callKeys.all, "list"],
  list: (filters) => [...callKeys.lists(), { filters }],
  details: () => [...callKeys.all, "detail"],
  detail: (id) => [...callKeys.details(), id],
  participants: (id) => [...callKeys.detail(id), "participants"],
  history: (userId) => [...callKeys.all, "history", userId],
  conversationHistory: (conversationId) => [...callKeys.all, "history", "conversation", conversationId],
  recent: (userId) => [...callKeys.all, "recent", userId],
  missed: (userId) => [...callKeys.all, "missed", userId],
  active: () => [...callKeys.all, "active"],
  preferences: (userId) => [...callKeys.all, "preferences", userId],
  token: (id) => [...callKeys.detail(id), "token"],
};

// --- Call Queries ---

// GET /api/calls/{id}
export const useCallById = (callId, options = {}) => {
  return useQuery({
    queryKey: callKeys.detail(callId),
    queryFn: () => apiClient(`/api/calls/${callId}`),
    enabled: !!callId,
    ...options,
  });
};

// GET /api/calls/{id}/participants
export const useCallParticipants = (callId, options = {}) => {
  return useQuery({
    queryKey: callKeys.participants(callId),
    queryFn: () => apiClient(`/api/calls/${callId}/participants`),
    enabled: !!callId,
    ...options,
  });
};

// GET /api/calls/history (Paginated for current user)
export const useUserCallHistory = (options = {}) => {
  return useInfiniteQuery({
    queryKey: callKeys.history("currentUser"),
    queryFn: ({ pageParam = 0 }) => apiClient("/api/calls/history", { params: { page: pageParam, size: 20 } }),
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    ...options,
  });
};

// GET /api/calls/conversation/{conversationId}/history (Paginated)
export const useConversationCallHistory = (conversationId, options = {}) => {
  return useInfiniteQuery({
    queryKey: callKeys.conversationHistory(conversationId),
    queryFn: ({ pageParam = 0 }) => apiClient(`/api/calls/conversation/${conversationId}/history`, { params: { page: pageParam, size: 20 } }),
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    enabled: !!conversationId,
    ...options,
  });
};

// GET /api/calls/recent
export const useRecentCalls = (limit = 10, options = {}) => {
  return useQuery({
    queryKey: callKeys.recent("currentUser"),
    queryFn: () => apiClient("/api/calls/recent", { params: { limit } }),
    ...options,
  });
};

// GET /api/calls/missed
export const useMissedCalls = (options = {}) => {
  return useQuery({
    queryKey: callKeys.missed("currentUser"),
    queryFn: () => apiClient("/api/calls/missed"),
    ...options,
  });
};

// GET /api/calls/active
export const useActiveCalls = (options = {}) => {
  return useQuery({
    queryKey: callKeys.active(),
    queryFn: () => apiClient("/api/calls/active"),
    ...options,
  });
};

// GET /api/calls/{id}/token
export const useCallToken = (callId, options = {}) => {
  return useQuery({
    queryKey: callKeys.token(callId),
    queryFn: () => apiClient(`/api/calls/${callId}/token`), // Returns String
    enabled: !!callId,
    cacheTime: 0,
    staleTime: 0,
    ...options,
  });
};

// GET /api/calls/preferences
export const useCallPreferences = (options = {}) => {
  return useQuery({
    queryKey: callKeys.preferences("currentUser"),
    queryFn: () => apiClient("/api/calls/preferences"),
    ...options,
  });
};

// --- Call Mutations ---

export const useInitiateCall = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/calls
    mutationFn: (callCreateDTO) => apiClient("/api/calls", { method: "POST", body: callCreateDTO }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: callKeys.active() });
      queryClient.setQueryData(callKeys.detail(data.id), data);
    },
  });
};

export const useInitiateDirectCall = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/calls/direct/{targetUserId}
    mutationFn: ({ targetUserId, type }) => apiClient(`/api/calls/direct/${targetUserId}`, { method: "POST", body: { type } }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: callKeys.active() });
      queryClient.setQueryData(callKeys.detail(data.id), data);
    },
  });
};

export const useInitiateGroupCall = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/calls/group
    mutationFn: (callCreateDTO) => apiClient("/api/calls/group", { method: "POST", body: callCreateDTO }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: callKeys.active() });
      queryClient.setQueryData(callKeys.detail(data.id), data);
    },
  });
};

export const useJoinCall = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/calls/{id}/join
    mutationFn: (callId) => apiClient(`/api/calls/${callId}/join`, { method: "POST" }),
    onSuccess: (data, callId) => {
      queryClient.invalidateQueries({ queryKey: callKeys.active() });
      queryClient.invalidateQueries({ queryKey: callKeys.detail(callId) });
      queryClient.invalidateQueries({ queryKey: callKeys.participants(callId) });
    },
  });
};

export const useLeaveCall = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/calls/{id}/leave
    mutationFn: (callId) => apiClient(`/api/calls/${callId}/leave`, { method: "POST" }),
    onSuccess: (data, callId) => {
      queryClient.invalidateQueries({ queryKey: callKeys.active() });
      queryClient.invalidateQueries({ queryKey: callKeys.detail(callId) });
      queryClient.invalidateQueries({ queryKey: callKeys.participants(callId) });
      queryClient.invalidateQueries({ queryKey: callKeys.history("currentUser") });
    },
  });
};

export const useEndCall = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/calls/{id}/end
    mutationFn: (callId) => apiClient(`/api/calls/${callId}/end`, { method: "POST" }),
    onSuccess: (data, callId) => {
      queryClient.invalidateQueries({ queryKey: callKeys.active() });
      queryClient.removeQueries({ queryKey: callKeys.detail(callId) });
      queryClient.invalidateQueries({ queryKey: callKeys.history("currentUser") });
    },
  });
};

export const useRejectCall = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/calls/{id}/reject
    mutationFn: (callId) => apiClient(`/api/calls/${callId}/reject`, { method: "POST" }),
    onSuccess: (data, callId) => {
      queryClient.invalidateQueries({ queryKey: callKeys.active() });
      queryClient.removeQueries({ queryKey: callKeys.detail(callId) });
      queryClient.invalidateQueries({ queryKey: callKeys.missed("currentUser") });
      queryClient.invalidateQueries({ queryKey: callKeys.history("currentUser") });
    },
  });
};

export const useUpdateCallStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/calls/{id}/status
    mutationFn: ({ callId, status }) => apiClient(`/api/calls/${callId}/status`, { method: "PUT", body: { status } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: callKeys.active() });
      queryClient.setQueryData(callKeys.detail(variables.callId), data);
    },
  });
};

export const useUpdateParticipantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/calls/{id}/participants/{userId}/status
    mutationFn: ({ callId, userId, status }) => apiClient(`/api/calls/${callId}/participants/${userId}/status`, { method: "PUT", body: { status } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: callKeys.participants(variables.callId) });
    },
  });
};

export const useAddParticipantToCall = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/calls/{id}/participants/{userId}
    mutationFn: ({ callId, userId }) => apiClient(`/api/calls/${callId}/participants/${userId}`, { method: "POST" }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: callKeys.participants(variables.callId) });
    },
  });
};

export const useRemoveParticipantFromCall = () => {
  const queryClient = useQueryClient();
  return useMutation({ // DELETE /api/calls/{id}/participants/{userId}
    mutationFn: ({ callId, userId }) => apiClient(`/api/calls/${callId}/participants/${userId}`, { method: "DELETE" }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: callKeys.participants(variables.callId) });
    },
  });
};

export const useToggleAudio = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/calls/{id}/audio
    mutationFn: (callId) => apiClient(`/api/calls/${callId}/audio`, { method: "POST" }),
    onSuccess: (data, callId) => {
      queryClient.invalidateQueries({ queryKey: callKeys.participants(callId) });
      queryClient.invalidateQueries({ queryKey: callKeys.detail(callId) });
    },
  });
};

export const useToggleVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/calls/{id}/video
    mutationFn: (callId) => apiClient(`/api/calls/${callId}/video`, { method: "POST" }),
    onSuccess: (data, callId) => {
      queryClient.invalidateQueries({ queryKey: callKeys.participants(callId) });
      queryClient.invalidateQueries({ queryKey: callKeys.detail(callId) });
    },
  });
};

export const useUpdateMediaSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/calls/{id}/media
    mutationFn: ({ callId, audioEnabled, videoEnabled }) => apiClient(`/api/calls/${callId}/media`, { method: "PUT", body: { audioEnabled, videoEnabled } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: callKeys.participants(variables.callId) });
      queryClient.setQueryData(callKeys.detail(variables.callId), data);
    },
  });
};

export const useUpdateCallPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/calls/preferences
    mutationFn: (preferencesDTO) => apiClient("/api/calls/preferences", { method: "PUT", body: preferencesDTO }),
    onSuccess: (data) => {
      queryClient.setQueryData(callKeys.preferences("currentUser"), data);
    },
  });
};

