// hooks/messageHooks.js
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

// --- Message Query Keys ---
export const messageKeys = {
  all: ["messages"],
  lists: () => [...messageKeys.all, "list"],
  list: (conversationId, filters = {}) => [...messageKeys.lists(), conversationId, { filters }],
  details: () => [...messageKeys.all, "detail"],
  detail: (id) => [...messageKeys.details(), id],
  replies: (id) => [...messageKeys.detail(id), "replies"],
  attachments: (id) => [...messageKeys.detail(id), "attachments"],
  reactions: (id) => [...messageKeys.detail(id), "reactions"],
  unread: () => [...messageKeys.all, "unread"],
  unreadCount: (conversationId) => [...messageKeys.unread(), "count", conversationId],
  search: (conversationId, query) => [...messageKeys.all, "search", conversationId, query],
};

// --- Message Queries ---

// GET /api/messages/{id}
export const useMessageById = (messageId, options = {}) => {
  return useQuery({
    queryKey: messageKeys.detail(messageId),
    queryFn: () => apiClient(`/api/messages/${messageId}`),
    enabled: !!messageId,
    ...options,
  });
};

// GET /api/messages/conversation/{conversationId} (Paginated)
export const useConversationMessages = (conversationId, options = {}) => {
  return useInfiniteQuery({
    queryKey: messageKeys.list(conversationId), // Use base key without filters for infinite query
    queryFn: ({ pageParam = 0 }) => apiClient(`/api/messages/conversation/${conversationId}`, { params: { page: pageParam, size: 20 } }),
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    enabled: !!conversationId,
    ...options,
  });
};

// GET /api/messages/recent/{conversationId}
export const useRecentMessages = (conversationId, limit = 50, options = {}) => {
  return useQuery({
    queryKey: messageKeys.list(conversationId, { recent: limit }),
    queryFn: () => apiClient(`/api/messages/recent/${conversationId}`, { params: { limit } }),
    enabled: !!conversationId,
    ...options,
  });
};

// GET /api/messages/unread
export const useUnreadMessages = (options = {}) => {
  return useQuery({
    queryKey: messageKeys.unread(),
    queryFn: () => apiClient("/api/messages/unread"),
    ...options,
  });
};

// GET /api/messages/unread/count/{conversationId}
export const useUnreadMessagesCount = (conversationId, options = {}) => {
  return useQuery({
    queryKey: messageKeys.unreadCount(conversationId),
    queryFn: () => apiClient(`/api/messages/unread/count/${conversationId}`),
    enabled: !!conversationId,
    ...options,
  });
};

// GET /api/messages/{id}/replies
export const useMessageReplies = (messageId, options = {}) => {
  return useQuery({
    queryKey: messageKeys.replies(messageId),
    queryFn: () => apiClient(`/api/messages/${messageId}/replies`),
    enabled: !!messageId,
    ...options,
  });
};

// GET /api/messages/search/conversation/{conversationId}
export const useSearchMessagesInConversation = (conversationId, query, options = {}) => {
  return useQuery({
    queryKey: messageKeys.search(conversationId, query),
    queryFn: () => apiClient(`/api/messages/search/conversation/${conversationId}`, { params: { query /*, page, size if paginated */ } }),
    enabled: !!conversationId && !!query,
    ...options,
  });
};

// GET /api/messages/{id}/attachments
export const useMessageAttachments = (messageId, options = {}) => {
  return useQuery({
    queryKey: messageKeys.attachments(messageId),
    queryFn: () => apiClient(`/api/messages/${messageId}/attachments`),
    enabled: !!messageId,
    ...options,
  });
};

// GET /api/messages/{id}/reactions
export const useMessageReactions = (messageId, options = {}) => {
  return useQuery({
    queryKey: messageKeys.reactions(messageId),
    queryFn: () => apiClient(`/api/messages/${messageId}/reactions`),
    enabled: !!messageId,
    ...options,
  });
};

// --- Message Mutations ---

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/messages
    mutationFn: (sendDTO) => apiClient("/api/messages", { method: "POST", body: sendDTO }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list(variables.conversationId) });
    },
  });
};

export const useSendTextMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/messages/text/{conversationId}
    mutationFn: ({ conversationId, content }) => apiClient(`/api/messages/text/${conversationId}`, { method: "POST", body: content, headers: { "Content-Type": "text/plain" } }),
    onSuccess: (data, variables) => {
      // Optimistic update or invalidation
      queryClient.invalidateQueries({ queryKey: messageKeys.list(variables.conversationId) });
    },
  });
};

export const useSendMediaMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/messages/media/{conversationId}
    mutationFn: ({ conversationId, file, type }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        return apiClient(`/api/messages/media/${conversationId}`, { method: "POST", body: formData });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list(variables.conversationId) });
    },
  });
};

export const useSendVoiceMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({ // POST /api/messages/voice/{conversationId}
      mutationFn: ({ conversationId, voiceFile }) => {
        const formData = new FormData();
        formData.append("voiceFile", voiceFile);
        return apiClient(`/api/messages/voice/${conversationId}`, { method: "POST", body: formData });
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: messageKeys.list(variables.conversationId) });
      },
    });
  };

export const useSendLocationMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({ // POST /api/messages/location/{conversationId}
      mutationFn: ({ conversationId, location }) => apiClient(`/api/messages/location/${conversationId}`, { method: "POST", body: location, headers: { "Content-Type": "text/plain" } }),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: messageKeys.list(variables.conversationId) });
      },
    });
  };

export const useMarkMessageAsDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/messages/{id}/delivered
    mutationFn: (messageId) => apiClient(`/api/messages/${messageId}/delivered`, { method: "PUT" }),
    onSuccess: (data, messageId) => {
      // queryClient.invalidateQueries({ queryKey: messageKeys.detail(messageId) });
    },
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/messages/{id}/read
    mutationFn: (messageId) => apiClient(`/api/messages/${messageId}/read`, { method: "PUT" }),
    onSuccess: (data, messageId) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.detail(messageId) });
      // Need conversationId to invalidate list/counts effectively
      // queryClient.invalidateQueries({ queryKey: messageKeys.unread() });
    },
  });
};

export const useMarkConversationMessagesAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/messages/conversation/{conversationId}/read
    mutationFn: (conversationId) => apiClient(`/api/messages/conversation/${conversationId}/read`, { method: "PUT" }),
    onSuccess: (data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list(conversationId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount(conversationId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.unread() });
    },
  });
};

export const useEditMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({ // PUT /api/messages/{id}
    mutationFn: ({ messageId, newContent }) => apiClient(`/api/messages/${messageId}`, { method: "PUT", body: newContent, headers: { "Content-Type": "text/plain" } }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(messageKeys.detail(variables.messageId), data);
      // Need conversationId to invalidate list
      // queryClient.invalidateQueries({ queryKey: messageKeys.list(conversationId) });
    },
  });
};

export const useDeleteMessageForMe = () => {
  const queryClient = useQueryClient();
  return useMutation({ // DELETE /api/messages/{id}
    mutationFn: (messageId) => apiClient(`/api/messages/${messageId}`, { method: "DELETE" }),
    onSuccess: (data, messageId) => {
      queryClient.removeQueries({ queryKey: messageKeys.detail(messageId) });
      // Need conversationId to invalidate list
      // queryClient.invalidateQueries({ queryKey: messageKeys.list(conversationId) });
    },
  });
};

export const useDeleteMessageForEveryone = () => {
  const queryClient = useQueryClient();
  return useMutation({ // DELETE /api/messages/{id}/everyone
    mutationFn: (messageId) => apiClient(`/api/messages/${messageId}/everyone`, { method: "DELETE" }),
    onSuccess: (data, messageId) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.detail(messageId) });
      // Need conversationId to invalidate list
      // queryClient.invalidateQueries({ queryKey: messageKeys.list(conversationId) });
    },
  });
};

export const useReplyToMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/messages/reply/{originalMessageId}
    mutationFn: ({ originalMessageId, content }) => apiClient(`/api/messages/reply/${originalMessageId}`, { method: "POST", body: content, headers: { "Content-Type": "text/plain" } }),
    onSuccess: (data, variables) => {
      // Need conversationId to invalidate list
      // queryClient.invalidateQueries({ queryKey: messageKeys.list(conversationId) });
    },
  });
};

export const useForwardMessages = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/messages/forward
    mutationFn: ({ messageIds, targetConversationId }) => apiClient("/api/messages/forward", { method: "POST", body: messageIds, params: { targetConversationId } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list(variables.targetConversationId) });
    },
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({ // DELETE /api/messages/attachments/{attachmentId}
    mutationFn: (attachmentId) => apiClient(`/api/messages/attachments/${attachmentId}`, { method: "DELETE" }),
    onSuccess: (data, attachmentId) => {
      // Need messageId to invalidate attachments list
      // queryClient.invalidateQueries({ queryKey: messageKeys.attachments(messageId) });
    },
  });
};

export const useAddReaction = () => {
  const queryClient = useQueryClient();
  return useMutation({ // POST /api/messages/{id}/reactions
    mutationFn: ({ messageId, emoji }) => apiClient(`/api/messages/${messageId}/reactions`, { method: "POST", body: emoji, headers: { "Content-Type": "text/plain" } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.reactions(variables.messageId) });
    },
  });
};

export const useRemoveReaction = () => {
  const queryClient = useQueryClient();
  return useMutation({ // DELETE /api/messages/{id}/reactions
    mutationFn: ({ messageId, emoji }) => apiClient(`/api/messages/${messageId}/reactions`, { method: "DELETE", params: { emoji } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.reactions(variables.messageId) });
    },
  });
};

