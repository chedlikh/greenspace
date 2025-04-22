import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const API_BASE_URL = "http://localhost:8089";

// Fetch all stories
export const fetchStories = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/stories`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("Failed to fetch stories:", errorData);
      throw new Error(errorData.message || "Failed to fetch stories");
    } catch (e) {
      throw new Error("Failed to fetch stories");
    }
  }

  return response.json();
};

// Fetch story by ID
export const fetchStoryById = async (id, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/stories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("Failed to fetch story:", errorData);
      throw new Error(errorData.message || "Failed to fetch story");
    } catch (e) {
      throw new Error("Failed to fetch story");
    }
  }

  return response.json();
};

// Fetch active stories by username
export const fetchActiveStoriesByUser = async (username, token) => {
  if (!token) throw new Error("No token provided");
  if (!username) throw new Error("No username provided");

  const response = await fetch(`${API_BASE_URL}/api/stories/user/${username}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("Failed to fetch user stories:", errorData);
      throw new Error(errorData.message || "Failed to fetch user stories");
    } catch (e) {
      throw new Error("Failed to fetch user stories");
    }
  }

  return response.json();
};

// Create a new media story - UPDATED to match the controller endpoint
export const createStory = async ({ mediaFile, caption, mediaType, username, token }) => {
  if (!token) throw new Error("No token provided");
  if (!username) throw new Error("No username provided");
  if (!mediaFile) throw new Error("No media file provided");

  const formData = new FormData();
  formData.append('file', mediaFile);
  
  // Caption is optional in the controller
  if (caption) {
    formData.append('caption', caption);
  }

  // This endpoint is specifically for media stories
  const response = await fetch(`${API_BASE_URL}/api/stories/media/user/${username}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: Failed to create story`;
    
    try {
      const errorData = await response.json();
      console.error("Failed to create story:", errorData);
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If the response isn't valid JSON
      console.error("Failed to parse error response:", e);
    }
    
    throw new Error(errorMessage);
  }

  // Handle the case where the response body might be empty
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

// Create a new text story
export const createTextStory = async ({ text, backgroundColor, fontStyle, username, token }) => {
  if (!token) throw new Error("No token provided");
  if (!username) throw new Error("No username provided");
  if (!text) throw new Error("No text content provided");

  const formData = new FormData();
  formData.append('text', text);
  
  if (backgroundColor) {
    formData.append('backgroundColor', backgroundColor);
  }
  
  if (fontStyle) {
    formData.append('fontStyle', fontStyle);
  }

  const response = await fetch(`${API_BASE_URL}/api/stories/text/user/${username}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("Failed to create text story:", errorData);
      throw new Error(errorData.message || "Failed to create text story");
    } catch (e) {
      throw new Error("Failed to create text story");
    }
  }

  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : {};
};

// Update story caption
export const updateStoryCaption = async ({ id, caption, token }) => {
  if (!token) throw new Error("No token provided");
  if (!caption) throw new Error("No caption provided");

  const formData = new FormData();
  formData.append('caption', caption);

  const response = await fetch(`${API_BASE_URL}/api/stories/${id}/caption`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("Failed to update story caption:", errorData);
      throw new Error(errorData.message || "Failed to update story caption");
    } catch (e) {
      throw new Error("Failed to update story caption");
    }
  }

  return response.json();
};

// Delete story by ID
export const deleteStory = async ({ id, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/stories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("Failed to delete story:", errorData);
      throw new Error(errorData.message || "Failed to delete story");
    } catch (e) {
      throw new Error("Failed to delete story");
    }
  }

  return true; // The controller returns no content, so just return success
};

// View a story
export const viewStory = async ({ storyId, viewerUsername, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/stories/${storyId}/view/${viewerUsername}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("Failed to record story view:", errorData);
      throw new Error(errorData.message || "Failed to record story view");
    } catch (e) {
      throw new Error("Failed to record story view");
    }
  }

  return true; // The controller returns no content
};

// Get story viewers
export const getStoryViewers = async ({ storyId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/stories/${storyId}/viewers`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("Failed to fetch story viewers:", errorData);
      throw new Error(errorData.message || "Failed to fetch story viewers");
    } catch (e) {
      throw new Error("Failed to fetch story viewers");
    }
  }

  return response.json();
};

// Get stories for feed
export const getStoriesForFeed = async ({ username, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/stories/feed/${username}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("Failed to fetch feed stories:", errorData);
      throw new Error(errorData.message || "Failed to fetch feed stories");
    } catch (e) {
      throw new Error("Failed to fetch feed stories");
    }
  }

  return response.json();
};

// Get users with active stories
export const getUsersWithActiveStories = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/stories/users-with-stories`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("Failed to fetch users with stories:", errorData);
      throw new Error(errorData.message || "Failed to fetch users with stories");
    } catch (e) {
      throw new Error("Failed to fetch users with stories");
    }
  }

  return response.json();
};

// Media URL helpers
export const getStoryMediaUrl = (filename, token) => {
  return {
    url: `${API_BASE_URL}/api/stories/media/${filename}`,
    token: token
  };
};

export const getProfileMediaUrl = (filename) => {
  return `${API_BASE_URL}/images/${filename}`;
};

export const fetchMediaWithAuth = async (url, token) => {
  if (!token) throw new Error("No token provided");
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch media: ${response.status}`);
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
    mutationFn: ({ mediaFile, caption, mediaType }) => {
      // Get the current user from state or another source
      const username = queryClient.getQueryData(['userDetails', token])?.username;
      
      if (!username) {
        throw new Error("User not found or not logged in");
      }
      
      return createStory({ 
        mediaFile, 
        caption, 
        mediaType, 
        username, 
        token 
      });
    },
    onSuccess: (data, variables) => {
      // Get the username to invalidate the proper queries
      const username = queryClient.getQueryData(['userDetails', token])?.username;
      
      if (username) {
        queryClient.invalidateQueries(["user-stories", username]);
      }
      queryClient.invalidateQueries(["stories"]);
    },
    onError: (error) => {
      console.error("Error creating story:", error);
    },
  });
};

export const useCreateTextStory = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ text, backgroundColor, fontStyle }) => {
      const username = queryClient.getQueryData(['userDetails', token])?.username;
      
      if (!username) {
        throw new Error("User not found or not logged in");
      }
      
      return createTextStory({ 
        text, 
        backgroundColor, 
        fontStyle, 
        username, 
        token 
      });
    },
    onSuccess: (data, variables) => {
      const username = queryClient.getQueryData(['userDetails', token])?.username;
      
      if (username) {
        queryClient.invalidateQueries(["user-stories", username]);
      }
      queryClient.invalidateQueries(["stories"]);
    },
    onError: (error) => {
      console.error("Error creating text story:", error);
    },
  });
};

export const useUpdateStoryCaption = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, caption }) => updateStoryCaption({ id, caption, token }),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries(["story", id]);
      queryClient.invalidateQueries(["stories"]);
      
      // Also invalidate user stories since we don't know which user this belongs to
      const username = queryClient.getQueryData(['userDetails', token])?.username;
      if (username) {
        queryClient.invalidateQueries(["user-stories", username]);
      }
    },
    onError: (error) => {
      console.error("Error updating story caption:", error);
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
      
      // Also invalidate user stories
      const username = queryClient.getQueryData(['userDetails', token])?.username;
      if (username) {
        queryClient.invalidateQueries(["user-stories", username]);
      }
    },
    onError: (error) => {
      console.error("Error deleting story:", error);
    },
  });
};

export const useViewStory = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ storyId, viewerUsername }) => viewStory({ storyId, viewerUsername, token }),
    onSuccess: (data, { storyId }) => {
      queryClient.invalidateQueries(["story", storyId]);
    },
    onError: (error) => {
      console.error("Error viewing story:", error);
    },
  });
};

export const useStoryViewers = (storyId) => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ["story-viewers", storyId],
    queryFn: () => getStoryViewers({ storyId, token }),
    enabled: !!storyId && !!token,
  });
};

export const useStoriesForFeed = (username) => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ["feed-stories", username],
    queryFn: () => getStoriesForFeed({ username, token }),
    enabled: !!username && !!token,
  });
};

export const useUsersWithActiveStories = () => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ["users-with-stories"],
    queryFn: () => getUsersWithActiveStories(token),
    enabled: !!token,
  });
};