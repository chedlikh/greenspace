// hooks/typingIndicatorHooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

// --- Typing Indicator Query Keys ---
export const typingIndicatorKeys = {
  all: ["typingIndicators"],
  lists: () => [...typingIndicatorKeys.all, "list"],
  list: (conversationId) => [...typingIndicatorKeys.lists(), conversationId],
  usernames: (conversationId) => [...typingIndicatorKeys.list(conversationId), "usernames"],
};

// --- Typing Indicator Queries ---

// GET /api/typing/{conversationId}
export const useTypingUsers = (conversationId, options = {}) => {
  return useQuery({
    queryKey: typingIndicatorKeys.list(conversationId),
    queryFn: () => apiClient(`/api/typing/${conversationId}`), // Returns List<TypingIndicatorDTO>
    enabled: !!conversationId,
    // Refetching handled by WebSocket invalidation primarily
    refetchInterval: false,
    staleTime: 5000, // Consider data stale after 5s if no WebSocket update
    ...options,
  });
};

// GET /api/typing/{conversationId}/usernames
export const useTypingUsernames = (conversationId, options = {}) => {
    return useQuery({
      queryKey: typingIndicatorKeys.usernames(conversationId),
      queryFn: () => apiClient(`/api/typing/${conversationId}/usernames`), // Returns List<String>
      enabled: !!conversationId,
      // Refetching handled by WebSocket invalidation primarily
      refetchInterval: false,
      staleTime: 5000, // Consider data stale after 5s if no WebSocket update
      ...options,
    });
  };

// --- Typing Indicator Mutations ---

// POST /api/typing/{conversationId}/start
export const useStartTyping = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId) => apiClient(`/api/typing/${conversationId}/start`, { method: "POST" }),
    onSuccess: (data, conversationId) => {
      // Invalidate typing users list for this conversation
      queryClient.invalidateQueries({ queryKey: typingIndicatorKeys.list(conversationId) });
      queryClient.invalidateQueries({ queryKey: typingIndicatorKeys.usernames(conversationId) });
    },
    // Consider adding onError handling
  });
};

// POST /api/typing/{conversationId}/stop
export const useStopTyping = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId) => apiClient(`/api/typing/${conversationId}/stop`, { method: "POST" }),
    onSuccess: (data, conversationId) => {
      // Invalidate typing users list for this conversation
      queryClient.invalidateQueries({ queryKey: typingIndicatorKeys.list(conversationId) });
      queryClient.invalidateQueries({ queryKey: typingIndicatorKeys.usernames(conversationId) });
    },
    // Consider adding onError handling
  });
};

