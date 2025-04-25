import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

// Fetch all publications with pagination
const fetchPublications = async ({ page = 0, size = 10, sortBy = 'createDate', direction = 'desc', token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(
    `${API_BASE_URL}/api/publications?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch publications');
  }

  return response.json();
};

// Fetch publication by ID
const fetchPublicationById = async ({ id, token }) => {
  if (!token) throw new Error("No token provided");
  if (!id) throw new Error("No publication id provided");

  const response = await fetch(`${API_BASE_URL}/api/publications/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch publication');
  }

  return response.json();
};

// Fetch publications by username
const fetchUserPublications = async ({ username, page = 0, size = 10, token }) => {
  if (!token) throw new Error("No token provided");
  if (!username) throw new Error("No username provided");

  const response = await fetch(
    `${API_BASE_URL}/api/publications/user/${username}?page=${page}&size=${size}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user publications');
  }

  return response.json();
};

// Create new publication
const createPublication = async ({ publicationData, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/publications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(publicationData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create publication');
  }

  return response.json();
};

// Update publication
const updatePublication = async ({ id, publicationData, token }) => {
  if (!token) throw new Error("No token provided");
  if (!id) throw new Error("No publication id provided");

  const response = await fetch(`${API_BASE_URL}/api/publications/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(publicationData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update publication');
  }

  return response.json();
};

// Delete publication
const deletePublication = async ({ id, token }) => {
  if (!token) throw new Error("No token provided");
  if (!id) throw new Error("No publication id provided");

  const response = await fetch(`${API_BASE_URL}/api/publications/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete publication');
  }

  // Return the ID since the API returns no body
  return { id };
};

// React Query hooks
export const usePublications = (page, size, sortBy, direction) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['publications', page, size, sortBy, direction],
    queryFn: () => fetchPublications({ page, size, sortBy, direction, token }),
    enabled: !!token,
    keepPreviousData: true,
  });
};

export const usePublicationById = (id) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['publication', id],
    queryFn: () => fetchPublicationById({ id, token }),
    enabled: !!id && !!token,
  });
};

export const useUserPublications = (username, page, size) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['userPublications', username, page, size],
    queryFn: () => fetchUserPublications({ username, page, size, token }),
    enabled: !!username && !!token,
    keepPreviousData: true,
  });
};

export const useCreatePublication = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicationData) => createPublication({ publicationData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(['publications']);
      queryClient.invalidateQueries(['userPublications']);
    },
  });
};

export const useUpdatePublication = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, publicationData }) => updatePublication({ id, publicationData, token }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['publications']);
      queryClient.invalidateQueries(['publication', data.id]);
      queryClient.invalidateQueries(['userPublications']);
    },
  });
};

export const useDeletePublication = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deletePublication({ id, token }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['publications']);
      queryClient.invalidateQueries(['publication', data.id]);
      queryClient.invalidateQueries(['userPublications']);
    },
  });
};
const fetchUserReactionForPublication = async ({ publicationId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!publicationId) throw new Error("No publication id provided");

  const response = await fetch(
    `${API_BASE_URL}/api/reactions/publication/${publicationId}/user`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // For NOT_FOUND (404), we'll return null instead of throwing an error
  // since this is an expected response when no reaction exists
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user reaction for publication');
  }

  return response.json();
};

// Fetch user's reaction for a specific comment
const fetchUserReactionForComment = async ({ commentId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!commentId) throw new Error("No comment id provided");

  const response = await fetch(
    `${API_BASE_URL}/api/reactions/comment/${commentId}/user`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // For NOT_FOUND (404), we'll return null instead of throwing an error
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user reaction for comment');
  }

  return response.json();
};

// React Query hooks for fetching reactions


export const useUserReactionForPublication = (publicationId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['userReaction', 'publication', publicationId],
    queryFn: async () => {
      const data = await fetchUserReactionForPublication({ publicationId, token });
      // Normalize to array
      return data ? (Array.isArray(data) ? data : [data]) : [];
    },
    enabled: !!publicationId && !!token,
  });
};

export const useUserReactionForComment = (commentId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['userReaction', 'comment', commentId],
    queryFn: async () => {
      const data = await fetchUserReactionForComment({ commentId, token });
      // Normalize to array
      return data ? (Array.isArray(data) ? data : [data]) : [];
    },
    enabled: !!commentId && !!token,
  });
};