import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

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

  // Return publicationId since the API returns no body
  return { publicationId };
};

// React Query hooks
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
      queryClient.invalidateQueries(['userPublications']);
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
        fileUrl: item.fileDownloadUri || item.fileUrl, // Fallback to fileUrl if fileDownloadUri is not present
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