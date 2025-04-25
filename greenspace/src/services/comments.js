import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

// Fetch comments for a publication
const fetchPublicationComments = async ({ publicationId, page = 0, size = 10, token }) => {
  if (!token) throw new Error("No token provided");
  if (!publicationId) throw new Error("No publicationId provided");
  const response = await fetch(
    `${API_BASE_URL}/api/comments/publication/${publicationId}?page=${page}&size=${size}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch comments');
  }
  return response.json();
};
// Fetch comment replies
const fetchCommentReplies = async ({ commentId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!commentId) throw new Error("No commentId provided");

  const response = await fetch(`${API_BASE_URL}/api/comments/replies/${commentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch comment replies');
  }

  return response.json();
};

// Add comment to publication
const addComment = async ({ publicationId, commentData, token }) => {
  if (!token) throw new Error("No token provided");
  if (!publicationId) throw new Error("No publicationId provided");

  const response = await fetch(`${API_BASE_URL}/api/comments/publication/${publicationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(commentData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add comment');
  }

  return response.json();
};

// Reply to comment
const replyToComment = async ({ parentCommentId, replyData, token }) => {
  if (!token) throw new Error("No token provided");
  if (!parentCommentId) throw new Error("No parentCommentId provided");

  const response = await fetch(`${API_BASE_URL}/api/comments/reply/${parentCommentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(replyData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add reply');
  }

  return response.json();
};

// Update comment
const updateComment = async ({ id, commentData, token }) => {
  if (!token) throw new Error("No token provided");
  if (!id) throw new Error("No comment id provided");

  const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(commentData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update comment');
  }

  return response.json();
};

// Delete comment
const deleteComment = async ({ id, publicationId, parentCommentId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!id) throw new Error("No comment id provided");

  const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete comment');
  }

  // Return the provided IDs since the API returns no body
  return { publicationId, parentCommentId };
};

// React Query hooks
export const usePublicationComments = (publicationId, page, size) => {
  const token = useSelector((state) => state.auth.token);
  return useQuery({
    queryKey: ['publicationComments', publicationId, page, size],
    queryFn: () => fetchPublicationComments({ publicationId, page, size, token }),
    enabled: !!publicationId && !!token,
    keepPreviousData: true,
  });
};

export const useCommentReplies = (commentId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['commentReplies', commentId],
    queryFn: () => fetchCommentReplies({ commentId, token }),
    enabled: !!commentId && !!token,
  });
};





export const useUpdateComment = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, commentData }) => updateComment({ id, commentData, token }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['publicationComments', data.publicationId]);
      if (data.parentCommentId) {
        queryClient.invalidateQueries(['commentReplies', data.parentCommentId]);
      }
    },
  });
};


const fetchPublicationCommentCount = async ({ publicationId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!publicationId) throw new Error("No publicationId provided");
  
  const response = await fetch(
    `${API_BASE_URL}/api/comments/publication/${publicationId}/count`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch comment count');
  }
  
  return response.json();
};

// Add this hook to the exports
export const usePublicationCommentCount = (publicationId) => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ['publicationCommentCount', publicationId],
    queryFn: () => fetchPublicationCommentCount({ publicationId, token }),
    enabled: !!publicationId && !!token,
  });
};

// Also update the useAddComment, useReplyToComment, and useDeleteComment hooks
// to invalidate the comment count query when comments change

export const useAddComment = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicationId, commentData }) => addComment({ publicationId, commentData, token }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['publicationComments', variables.publicationId]);
      queryClient.invalidateQueries(['publicationCommentCount', variables.publicationId]);
      queryClient.invalidateQueries(['publication', variables.publicationId]);
    },
  });
};

export const useReplyToComment = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentCommentId, replyData }) => replyToComment({ parentCommentId, replyData, token }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['commentReplies', variables.parentCommentId]);
      queryClient.invalidateQueries(['publicationComments', data.publicationId]);
      queryClient.invalidateQueries(['publicationCommentCount', data.publicationId]);
    },
  });
};

export const useDeleteComment = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, publicationId, parentCommentId }) =>
      deleteComment({ id, publicationId, parentCommentId, token }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['publicationComments', data.publicationId]);
      queryClient.invalidateQueries(['publicationCommentCount', data.publicationId]);
      if (data.parentCommentId) {
        queryClient.invalidateQueries(['commentReplies', data.parentCommentId]);
      }
    },
  });
};