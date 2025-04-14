import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const API_BASE_URL = 'http://localhost:8089/api';

// Fetch all stories
export const fetchStories = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/stories`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch stories:", errorData);
    throw new Error(errorData.message || "Failed to fetch stories");
  }

  return response.json();
};

// Fetch story by ID
export const fetchStoryById = async (id, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch story:", errorData);
    throw new Error(errorData.message || "Failed to fetch story");
  }

  return response.json();
};

// Fetch active stories by username
export const fetchActiveStoriesByUser = async (username, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/stories/user/${username}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch user stories:", errorData);
    throw new Error(errorData.message || "Failed to fetch user stories");
  }

  return response.json();
};

// Create a new story
export const createStory = async ({ storyData, token }) => {
  if (!token) throw new Error("No token provided");

  const formData = new FormData();
  if (storyData.mediaFile) {
    formData.append('file', storyData.mediaFile);
  }
  formData.append('caption', storyData.caption || '');
  formData.append('mediaType', storyData.mediaType || 'IMAGE');

  const response = await fetch(`${API_BASE_URL}/stories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to create story:", errorData);
    throw new Error(errorData.message || "Failed to create story");
  }

  return response.json();
};

// Update story by ID
export const updateStory = async ({ id, storyData, token }) => {
  if (!token) throw new Error("No token provided");

  const formData = new FormData();
  if (storyData.mediaFile) {
    formData.append('file', storyData.mediaFile);
  }
  if (storyData.caption) {
    formData.append('caption', storyData.caption);
  }

  const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to update story:", errorData);
    throw new Error(errorData.message || "Failed to update story");
  }

  return response.json();
};

// Delete story by ID
export const deleteStory = async ({ id, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to delete story:", errorData);
    throw new Error(errorData.message || "Failed to delete story");
  }

  return response.json();
};

// Media URL helpers
export const getStoryMediaUrl = (filename, token) => {
  return {
    url: `${API_BASE_URL}/stories/media/${filename}`,
    token: token
  };
};

export const getprofileMediaUrl = (filename, token) => {
  return {
    url: `http://localhost:8089/images/${filename}`,
    token: token
  };
};

export const fetchMediaWithAuth = async (url, token) => {
  if (!token) throw new Error("No token provided");
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch media");
  }
  
  return URL.createObjectURL(await response.blob());
};

// React Query hooks

export const useStories = () => {
  const token = useSelector((state) => state.auth.token);
  return useQuery({
    queryKey: ["stories"],
    queryFn: () => fetchStories(token),
    enabled: !!token,
  });
};

export const useStoryById = (id) => {
  const token = useSelector((state) => state.auth.token);
  return useQuery({
    queryKey: ["story", id],
    queryFn: () => fetchStoryById(id, token),
    enabled: !!id && !!token,
  });
};

export const useActiveStoriesByUser = (username) => {
  const token = useSelector((state) => state.auth.token);
  return useQuery({
    queryKey: ["user-stories", username],
    queryFn: () => fetchActiveStoriesByUser(username, token),
    enabled: !!username && !!token,
  });
};

export const useCreateStory = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyData) => createStory({ storyData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["stories"]);
    },
    onError: (error) => {
      console.error("Error creating story:", error);
    },
  });
};

export const useUpdateStory = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyData) => updateStory({ id, storyData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["story", id]);
      queryClient.invalidateQueries(["stories"]);
    },
    onError: (error) => {
      console.error("Error updating story:", error);
    },
  });
};

export const useDeleteStory = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteStory({ id, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["stories"]);
    },
    onError: (error) => {
      console.error("Error deleting story:", error);
    },
  });
};

export const useStoryMediaUrl = () => {
  const token = useSelector((state) => state.auth.token);
  return (filename) => getStoryMediaUrl(filename, token);
};

export const useprofileMediaUrl = () => {
  const token = useSelector((state) => state.auth.token);
  return (filename) => getprofileMediaUrl(filename, token);
};