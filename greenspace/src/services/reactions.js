import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

// React to publication
const reactToPublication = async ({ publicationId, reactionType, token }) => {
  if (!token) throw new Error("No token provided");
  if (!publicationId) throw new Error("No publicationId provided");

  const response = await fetch(
    `${API_BASE_URL}/api/reactions/publication/${publicationId}?reactionType=${reactionType}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 403) {
      throw new Error('You do not have permission to react to this publication');
    }
    throw new Error(errorData.message || 'Failed to react to publication');
  }

  return response.json();
};

// React to comment
const reactToComment = async ({ commentId, reactionType, token }) => {
  if (!token) throw new Error("No token provided");
  if (!commentId) throw new Error("No commentId provided");

  const response = await fetch(
    `${API_BASE_URL}/api/reactions/comment/${commentId}?reactionType=${reactionType}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 403) {
      throw new Error('You do not have permission to react to this comment');
    }
    throw new Error(errorData.message || 'Failed to react to comment');
  }

  return response.json();
};

// Get reaction counts for publication
const getPublicationReactionCounts = async ({ publicationId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!publicationId) throw new Error("No publicationId provided");

  const response = await fetch(`${API_BASE_URL}/api/reactions/publication/${publicationId}/count`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get reaction counts');
  }

  return response.json();
};

// Get reaction counts for comment
const getCommentReactionCounts = async ({ commentId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!commentId) throw new Error("No commentId provided");

  const response = await fetch(`${API_BASE_URL}/api/reactions/comment/${commentId}/count`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get reaction counts');
  }

  return response.json();
};

// Get user reaction for publication
const getUserPublicationReaction = async ({ publicationId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!publicationId) throw new Error("No publicationId provided");

  const response = await fetch(`${API_BASE_URL}/api/reactions/publication/${publicationId}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get user reaction');
  }

  const data = await response.json();
  return data.exists ? data.reaction : null;
};

// Get user reaction for comment
const getUserCommentReaction = async ({ commentId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!commentId) throw new Error("No commentId provided");

  const response = await fetch(`${API_BASE_URL}/api/reactions/comment/${commentId}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get user reaction');
  }

  if (response.status === 404) {
    return null;
  }

  return response.json();
};

// Get all reactions for publication
const getPublicationReactions = async ({ publicationId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!publicationId) throw new Error("No publicationId provided");

  const response = await fetch(`${API_BASE_URL}/api/reactions/publication/${publicationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get publication reactions');
  }

  return response.json();
};

// Get all reactions for comment
const getCommentReactions = async ({ commentId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!commentId) throw new Error("No commentId provided");

  const response = await fetch(`${API_BASE_URL}/api/reactions/comment/${commentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get comment reactions');
  }

  return response.json();
};

// Delete reaction
const deleteReaction = async ({ id, publicationId, commentId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!id) throw new Error("No reaction id provided");

  const response = await fetch(`${API_BASE_URL}/api/reactions/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 403) {
      throw new Error('You do not have permission to delete this reaction');
    }
    throw new Error(errorData.message || 'Failed to delete reaction');
  }

  return { publicationId, commentId };
};

// React Query hooks
export const useReactToPublication = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicationId, reactionType }) => reactToPublication({ publicationId, reactionType, token }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['publicationReactionCounts', variables.publicationId]);
      queryClient.invalidateQueries(['userPublicationReaction', variables.publicationId]);
      queryClient.invalidateQueries(['publicationReactions', variables.publicationId]);
      queryClient.invalidateQueries(['publication', variables.publicationId]);
    },
  });
};

export const useReactToComment = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, reactionType }) => reactToComment({ commentId, reactionType, token }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['commentReactionCounts', variables.commentId]);
      queryClient.invalidateQueries(['userCommentReaction', variables.commentId]);
      queryClient.invalidateQueries(['commentReactions', variables.commentId]);
    },
  });
};

export const usePublicationReactionCounts = (publicationId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['publicationReactionCounts', publicationId],
    queryFn: () => getPublicationReactionCounts({ publicationId, token }),
    enabled: !!publicationId && !!token,
    select: (data) => ({
      counts: data.counts,
    }),
  });
};

export const useCommentReactionCounts = (commentId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['commentReactionCounts', commentId],
    queryFn: () => getCommentReactionCounts({ commentId, token }),
    enabled: !!commentId && !!token,
    select: (data) => ({
      counts: data.counts,
    }),
  });
};

export const useUserPublicationReaction = (publicationId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['userPublicationReaction', publicationId],
    queryFn: () => getUserPublicationReaction({ publicationId, token }),
    enabled: !!publicationId && !!token,
    select: (data) => {
      if (!data) return null;
      return {
        id: data.id,
        reactionType: data.reactionType,
        user: {
          id: data.user?.id,
          username: data.user?.username,
        },
        publicationId: data.publicationId,
      };
    },
  });
};

export const useUserCommentReaction = (commentId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['userCommentReaction', commentId],
    queryFn: () => getUserCommentReaction({ commentId, token }),
    enabled: !!commentId && !!token,
    select: (data) =>
      data
        ? {
            id: data.id,
            reactionType: data.reactionType,
            user: {
              id: data.user?.id,
              username: data.user?.username,
            },
            commentId: data.commentId,
          }
        : null,
  });
};

export const usePublicationReactions = (publicationId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['publicationReactions', publicationId],
    queryFn: () => getPublicationReactions({ publicationId, token }),
    enabled: !!publicationId && !!token,
    select: (data) =>
      data.map((reaction) => ({
        id: reaction.id,
        reactionType: reaction.reactionType,
        user: {
          id: reaction.user?.id,
          username: reaction.user?.username,
        },
        publicationId: reaction.publicationId,
      })),
  });
};

export const useCommentReactions = (commentId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['commentReactions', commentId],
    queryFn: () => getCommentReactions({ commentId, token }),
    enabled: !!commentId && !!token,
    select: (data) =>
      data.map((reaction) => ({
        id: reaction.id,
        reactionType: reaction.reactionType,
        user: {
          id: reaction.user?.id,
          username: reaction.user?.username,
        },
        commentId: reaction.commentId,
      })),
  });
};

export const useDeleteReaction = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, publicationId, commentId }) =>
      deleteReaction({ id, publicationId, commentId, token }),
    onSuccess: (data) => {
      if (data.publicationId) {
        queryClient.invalidateQueries(['publicationReactionCounts', data.publicationId]);
        queryClient.invalidateQueries(['userPublicationReaction', data.publicationId]);
        queryClient.invalidateQueries(['publicationReactions', data.publicationId]);
        queryClient.invalidateQueries(['publication', data.publicationId]);
      }
      if (data.commentId) {
        queryClient.invalidateQueries(['commentReactionCounts', data.commentId]);
        queryClient.invalidateQueries(['userCommentReaction', data.commentId]);
        queryClient.invalidateQueries(['commentReactions', data.commentId]);
      }
    },
  });
};