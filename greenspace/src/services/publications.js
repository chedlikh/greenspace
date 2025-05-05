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

// Fetch user timeline publications by username
const fetchUserTimelinePublications = async ({ username, page = 0, size = 10, token }) => {
  if (!token) throw new Error("No token provided");
  if (!username) throw new Error("No username provided");

  const response = await fetch(
    `${API_BASE_URL}/api/publications/timeline/${username}?page=${page}&size=${size}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user timeline publications');
  }

  return response.json();
};

// Fetch publications by privacy level
const fetchPublicationsByPrivacyLevel = async ({ privacyLevel, token }) => {
  if (!token) throw new Error("No token provided");
  if (!privacyLevel) throw new Error("No privacy level provided");

  const response = await fetch(`${API_BASE_URL}/api/publications/privacy/${privacyLevel}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch publications by privacy level');
  }

  return response.json();
};

// Create new publication (for user's own profile)
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
    if (response.status === 403) {
      throw new Error('You do not have permission to create this publication');
    }
    throw new Error(errorData.message || 'Failed to create publication');
  }

  return response.json();
};

// Create cross-user publication (for posting on another user's profile)
const createCrossUserPublication = async ({ publicationData, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/publications/cross-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(publicationData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 403) {
      throw new Error('You do not have permission to create this cross-user publication');
    }
    throw new Error(errorData.message || 'Failed to create cross-user publication');
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
    if (response.status === 403) {
      throw new Error('You do not have permission to update this publication');
    }
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
    if (response.status === 403) {
      throw new Error('You do not have permission to delete this publication');
    }
    throw new Error(errorData.message || 'Failed to delete publication');
  }

  return { id };
};

// Fetch user's reaction for a specific publication
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

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user reaction for comment');
  }

  return response.json();
};

// Upload media to publication
const uploadMedia = async ({ publicationId, file, caption, displayOrder, token }) => {
  if (!token) throw new Error("No token provided");
  if (!publicationId) throw new Error("No publicationId provided");
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append('file', file);
  if (caption) formData.append('caption', caption);
  if (displayOrder !== undefined) formData.append('displayOrder', displayOrder.toString());

  const response = await fetch(`${API_BASE_URL}/api/media/upload/publication/${publicationId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload media');
  }

  return response.json();
};

// Upload multiple media to publication
const uploadMultipleMedia = async ({ publicationId, files, captions, token }) => {
  if (!token) throw new Error("No token provided");
  if (!publicationId) throw new Error("No publicationId provided");
  if (!files || files.length === 0) throw new Error("No files provided");

  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append('files', file);
    if (captions && captions[index]) {
      formData.append('captions', captions[index]);
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/media/upload/multiple/publication/${publicationId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload multiple media');
  }

  return response.json();
};

// Get media by publication ID
const getPublicationMedia = async ({ publicationId, token }) => {
  if (!token) throw new Error('No token provided');
  if (!publicationId) throw new Error('No publicationId provided');

  const response = await fetch(`${API_BASE_URL}/api/media/publication/${publicationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get publication media');
  }

  return response.json();
};

// Update media
const updateMedia = async ({ id, mediaData, token }) => {
  if (!token) throw new Error("No token provided");
  if (!id) throw new Error("No media id provided");

  const response = await fetch(`${API_BASE_URL}/api/media/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(mediaData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update media');
  }

  return response.json();
};

// Delete media
const deleteMedia = async ({ id, publicationId, token }) => {
  if (!token) throw new Error("No token provided");
  if (!id) throw new Error("No media id provided");
  if (!publicationId) throw new Error("No publicationId provided");

  const response = await fetch(`${API_BASE_URL}/api/media/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete media');
  }

  return { publicationId };
};

// React Query hooks
export const usePublications = (page, size, sortBy, direction) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['publications', page, size, sortBy, direction],
    queryFn: () => fetchPublications({ page, size, sortBy, direction, token }),
    enabled: !!token,
    keepPreviousData: true,
    select: (data) => {
      console.log('usePublications raw response:', data);
      return {
        ...data,
        content: data.content.map((publication) => ({
          id: publication.id,
          content: publication.content,
          user: {
            id: publication.user?.id,
            username: publication.user?.username,
            firstname: publication.user?.firstname,
            lastName: publication.user?.lastName,
            photoProfile: publication.user?.photoProfile,
          },
          targetUser: publication.targetUser
            ? {
                id: publication.targetUser.id,
                username: publication.targetUser.username,
                firstname: publication.targetUser.firstname,
                lastName: publication.targetUser.lastName,
                photoProfile: publication.targetUser.photoProfile,
              }
            : null,
          group: publication.group
            ? {
                id: publication.group.id,
                name: publication.group.name,
                adminId: publication.group.admin?.id,
                profilePhotoUrl: publication.group.profilePhotoUrl,
              }
            : null,
          privacyLevel: publication.privacyLevel,
          location: publication.location,
          feeling: publication.feeling,
          createDate: publication.createDate,
          isEdited: publication.isEdited,
          viewCount: publication.viewCount,
          mediaItems: publication.mediaItems || [],
        })),
      };
    },
  });
};

export const usePublicationById = (id) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['publication', id],
    queryFn: () => fetchPublicationById({ id, token }),
    enabled: !!id && !!token,
    select: (data) => ({
      id: data.id,
      content: data.content,
      user: {
        id: data.user?.id,
        username: data.user?.username,
        firstname: data.user?.firstname,
        lastName: data.user?.lastName,
        photoProfile: data.user?.photoProfile, // Added photoProfile
      },
      targetUser: data.targetUser
        ? {
            id: data.targetUser.id,
            username: data.targetUser.username,
            firstname: data.targetUser.firstname,
            lastName: data.targetUser.lastName,
            photoProfile: data.targetUser.photoProfile, // Added photoProfile
          }
        : null,
      group: data.group
        ? {
            id: data.group.id,
            name: data.group.name,
            adminId: data.group.admin?.id,
            profilePhotoUrl: data.group.profilePhotoUrl, // Added profilePhotoUrl
          }
        : null,
      privacyLevel: data.privacyLevel,
      location: data.location,
      feeling: data.feeling,
      createDate: data.createDate,
      isEdited: data.isEdited,
      viewCount: data.viewCount,
      mediaItems: data.mediaItems || [],
    }),
  });
};

export const useUserTimelinePublications = (username, page, size) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['userTimelinePublications', username, page, size],
    queryFn: () => fetchUserTimelinePublications({ username, page, size, token }),
    enabled: !!username && !!token,
    keepPreviousData: true,
    select: (data) => ({
      ...data,
      content: data.content.map((publication) => ({
        id: publication.id,
        content: publication.content,
        user: {
          id: publication.user?.id,
          username: publication.user?.username,
          firstname: publication.user?.firstname,
          lastName: publication.user?.lastName,
          photoProfile: publication.user?.photoProfile, // Added photoProfile
        },
        targetUser: publication.targetUser
          ? {
              id: publication.targetUser.id,
              username: publication.targetUser.username,
              firstname: publication.targetUser.firstname,
              lastName: publication.targetUser.lastName,
              photoProfile: publication.targetUser.photoProfile, // Added photoProfile
            }
          : null,
        group: null, // Timeline publications exclude group posts
        privacyLevel: publication.privacyLevel,
        location: publication.location,
        feeling: publication.feeling,
        createDate: publication.createDate,
        isEdited: publication.isEdited,
        viewCount: publication.viewCount,
        mediaItems: publication.mediaItems || [],
      })),
    }),
  });
};

export const usePublicationsByPrivacyLevel = (privacyLevel) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['publicationsByPrivacyLevel', privacyLevel],
    queryFn: () => fetchPublicationsByPrivacyLevel({ privacyLevel, token }),
    enabled: !!privacyLevel && !!token,
    select: (data) =>
      data.map((publication) => ({
        id: publication.id,
        content: publication.content,
        user: {
          id: publication.user?.id,
          username: publication.user?.username,
          firstname: publication.user?.firstname,
          lastName: publication.user?.lastName,
          photoProfile: publication.user?.photoProfile, // Added photoProfile
        },
        targetUser: publication.targetUser
          ? {
              id: publication.targetUser.id,
              username: publication.targetUser.username,
              firstname: publication.targetUser.firstname,
              lastName: publication.targetUser.lastName,
              photoProfile: publication.targetUser.photoProfile, // Added photoProfile
            }
          : null,
        group: publication.group
          ? {
              id: publication.group.id,
              name: publication.group.name,
              adminId: publication.group.admin?.id,
              profilePhotoUrl: publication.group.profilePhotoUrl, // Added profilePhotoUrl
            }
          : null,
        privacyLevel: publication.privacyLevel,
        location: publication.location,
        feeling: publication.feeling,
        createDate: publication.createDate,
        isEdited: publication.isEdited,
        viewCount: publication.viewCount,
        mediaItems: publication.mediaItems || [],
      })),
  });
};

export const useCreatePublication = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicationData) => createPublication({ publicationData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(['publications']);
      queryClient.invalidateQueries(['userTimelinePublications']);
    },
  });
};

export const useCreateCrossUserPublication = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicationData) => createCrossUserPublication({ publicationData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(['publications']);
      queryClient.invalidateQueries(['userTimelinePublications']);
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
      queryClient.invalidateQueries(['userTimelinePublications']);
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
      queryClient.invalidateQueries(['userTimelinePublications']);
    },
  });
};

export const useUserReactionForPublication = (publicationId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['userReaction', 'publication', publicationId],
    queryFn: async () => {
      const data = await fetchUserReactionForPublication({ publicationId, token });
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
      return data ? (Array.isArray(data) ? data : [data]) : [];
    },
    enabled: !!commentId && !!token,
  });
};

export const useUploadMedia = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicationId, file, caption, displayOrder }) =>
      uploadMedia({ publicationId, file, caption, displayOrder, token }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['publicationMedia', variables.publicationId]);
      queryClient.invalidateQueries(['publication', variables.publicationId]);
    },
  });
};

export const useUploadMultipleMedia = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicationId, files, captions }) =>
      uploadMultipleMedia({ publicationId, files, captions, token }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['publicationMedia', variables.publicationId]);
      queryClient.invalidateQueries(['publication', variables.publicationId]);
      queryClient.invalidateQueries(['publications']);
      queryClient.invalidateQueries(['userTimelinePublications']);
    },
  });
};

export const usePublicationMedia = (publicationId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['publicationMedia', publicationId],
    queryFn: () => getPublicationMedia({ publicationId, token }),
    enabled: !!publicationId && !!token,
    select: (data) =>
      data.map((item) => ({
        id: item.id,
        mediaType: item.mediaType,
        fileName: item.fileName,
        fileUrl: item.fileDownloadUri || item.fileUrl,
        caption: item.caption,
        displayOrder: item.displayOrder,
        thumbnailUrl: item.thumbnailUrl,
        uploadDate: item.uploadDate,
      })),
  });
};

export const useUpdateMedia = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, mediaData, publicationId }) => updateMedia({ id, mediaData, token }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['publicationMedia', variables.publicationId]);
    },
  });
};

export const useDeleteMedia = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, publicationId }) => deleteMedia({ id, publicationId, token }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['publicationMedia', data.publicationId]);
      queryClient.invalidateQueries(['publication', data.publicationId]);
    },
  });
};