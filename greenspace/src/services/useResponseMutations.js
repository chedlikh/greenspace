import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

// Submit a response
const submitResponse = async ({ submission, token }) => {
  const response = await fetch(`${API_BASE_URL}/api/responses/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(submission),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to submit response (Status: ${response.status})`);
  }
  
  return response.json();
};

// Update a response
const updateResponse = async ({ responseId, submission, token }) => {
  const response = await fetch(`${API_BASE_URL}/api/responses/update/${responseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(submission),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update response (Status: ${response.status})`);
  }
  
  return response.json();
};

// Delete a response
const deleteResponse = async ({ responseId, token }) => {
  const response = await fetch(`${API_BASE_URL}/api/responses/delete/${responseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete response (Status: ${response.status})`);
  }
  
  return { success: true };
};

// Fetch user responses for a sondage
const fetchUserResponsesForSondage = async ({ sondageId, userId, token }) => {
  const response = await fetch(`${API_BASE_URL}/api/responses/sondage/${sondageId}/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `Failed to fetch responses (Status: ${response.status})`;
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in again.');
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// Fetch all user responses
const fetchUserResponses = async ({ userId, token }) => {
  const response = await fetch(`${API_BASE_URL}/api/responses/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `Failed to fetch user responses (Status: ${response.status})`;
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in again.');
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// Check if user has responded to a question
const checkUserResponse = async ({ questionId, userId, token }) => {
  const response = await fetch(`${API_BASE_URL}/api/responses/check/${questionId}/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to check response (Status: ${response.status})`);
  }
  
  return response.json();
};

// React Query hooks
export const useSubmitResponse = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (submission) => submitResponse({ submission, token }),
    onSuccess: (_, submission) => {
      queryClient.invalidateQueries(['responses', submission.sondageId, submission.userId]);
      queryClient.invalidateQueries(['responseCheck', submission.questionId, submission.userId]);
      toast.success('Response submitted successfully!');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useUpdateResponse = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ responseId, submission }) => updateResponse({ responseId, submission, token }),
    onSuccess: (_, { submission }) => {
      queryClient.invalidateQueries(['responses', submission.sondageId, submission.userId]);
      toast.success('Response updated successfully!');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useDeleteResponse = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ responseId, sondageId, userId }) => deleteResponse({ responseId, token }),
    onSuccess: (_, { sondageId, userId }) => {
      queryClient.invalidateQueries(['responses', sondageId, userId]);
      toast.success('Response deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useUserResponsesForSondage = (sondageId, userId) => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ['responses', sondageId, userId],
    queryFn: () => fetchUserResponsesForSondage({ sondageId, userId, token }),
    enabled: !!sondageId && !!userId && !!token,
    onError: (error) => {
      if (error.message.includes('Unauthorized')) {
        toast.error('Session expired. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else {
        toast.error(`Error fetching responses: ${error.message}`);
      }
    },
  });
};

export const useUserResponses = (userId) => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ['userResponses', userId],
    queryFn: () => fetchUserResponses({ userId, token }),
    enabled: !!userId && !!token,
    onError: (error) => {
      if (error.message.includes('Unauthorized')) {
        toast.error('Session expired. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else {
        toast.error(`Error fetching user responses: ${error.message}`);
      }
    },
  });
};

export const useCheckUserResponse = (questionId, userId) => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ['responseCheck', questionId, userId],
    queryFn: () => checkUserResponse({ questionId, userId, token }),
    enabled: !!questionId && !!userId && !!token,
    onError: (error) => {
      toast.error(`Error checking response: ${error.message}`);
    },
  });
};