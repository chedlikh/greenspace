import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089';

// Fetch response by ID
const fetchResponseById = async (responseId, token) => {
  if (!token) throw new Error('No authentication token provided');
  if (!responseId) throw new Error('No responseId provided');

  const response = await fetch(`${API_BASE_URL}/api/responses/${responseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to fetch response:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to fetch response (Status: ${response.status})`);
  }

  return response.json();
};

// Fetch responses by question ID (admin-only)
const fetchResponsesByQuestionId = async (questionId, token) => {
  if (!token) throw new Error('No authentication token provided');
  if (!questionId) throw new Error('No questionId provided');

  const response = await fetch(`${API_BASE_URL}/api/responses/question/${questionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to fetch responses for question:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to fetch responses for question (Status: ${response.status})`);
  }

  return response.json();
};

// Fetch responses by user ID
const fetchResponsesByUserId = async (userId, token) => {
  if (!token) throw new Error('No authentication token provided');
  if (!userId) throw new Error('No userId provided');

  const response = await fetch(`${API_BASE_URL}/api/responses/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to fetch responses for user:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to fetch responses for user (Status: ${response.status})`);
  }

  return response.json();
};

// Fetch responses by sondage ID (admin-only)
const fetchResponsesBySondageId = async (sondageId, token) => {
  if (!token) throw new Error('No authentication token provided');
  if (!sondageId) throw new Error('No sondageId provided');

  const response = await fetch(`${API_BASE_URL}/api/responses/sondage/${sondageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to fetch responses for sondage:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to fetch responses for sondage (Status: ${response.status})`);
  }

  return response.json();
};

// Fetch user responses for a sondage
const fetchUserResponsesForSondage = async (sondageId, userId, token) => {
  if (!token) throw new Error('No authentication token provided');
  if (!sondageId || !userId) throw new Error('No sondageId or userId provided');

  const response = await fetch(`${API_BASE_URL}/api/responses/sondage/${sondageId}/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to fetch user responses for sondage:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to fetch user responses for sondage (Status: ${response.status})`);
  }

  return response.json();
};

// Check if user has responded to a question
const checkUserRespondedToSondage = async (questionId, userId, token) => {
  if (!token) throw new Error('No authentication token provided');
  if (!questionId || !userId) throw new Error('No questionId or userId provided');

  const response = await fetch(`${API_BASE_URL}/api/responses/check/${questionId}/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to check user response:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to check user response (Status: ${response.status})`);
  }

  return response.json();
};

// Fetch sondage response statistics (admin-only)
const fetchSondageResponseStatistics = async (sondageId, token) => {
  if (!token) throw new Error('No authentication token provided');
  if (!sondageId) throw new Error('No sondageId provided');

  const response = await fetch(`${API_BASE_URL}/api/responses/statistics/sondage/${sondageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to fetch sondage statistics:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to fetch sondage statistics (Status: ${response.status})`);
  }

  return response.json();
};

// Submit a response
const submitResponse = async ({ questionId, answerData, token }) => {
  if (!token) throw new Error('No authentication token provided');
  if (!questionId) throw new Error('No questionId provided');

  const response = await fetch(`${API_BASE_URL}/api/responses/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ questionId, ...answerData }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to submit response:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to submit response (Status: ${response.status})`);
  }

  return response.json();
};

// Update a response
const updateResponse = async ({ responseId, answerData, token }) => {
  if (!token) throw new Error('No authentication token provided');
  if (!responseId) throw new Error('No responseId provided');

  const response = await fetch(`${API_BASE_URL}/api/responses/update/${responseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(answerData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to update response:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to update response (Status: ${response.status})`);
  }

  return response.json();
};

// Delete a response
const deleteResponse = async ({ responseId, token }) => {
  if (!token) throw new Error('No authentication token provided');
  if (!responseId) throw new Error('No responseId provided');

  const response = await fetch(`${API_BASE_URL}/api/responses/delete/${responseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to delete response:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to delete response (Status: ${response.status})`);
  }

  return { success: true }; // DELETE returns no content
};

// React Query hooks
export const useResponseById = (responseId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['response', responseId],
    queryFn: () => fetchResponseById(responseId, token),
    enabled: !!responseId && !!token,
  });
};

export const useResponsesByQuestionId = (questionId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['responses', 'question', questionId],
    queryFn: () => fetchResponsesByQuestionId(questionId, token),
    enabled: !!questionId && !!token,
  });
};

export const useResponsesByUserId = (userId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['responses', 'user', userId],
    queryFn: () => fetchResponsesByUserId(userId, token),
    enabled: !!userId && !!token,
  });
};

export const useResponsesBySondageId = (sondageId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['responses', 'sondage', sondageId],
    queryFn: () => fetchResponsesBySondageId(sondageId, token),
    enabled: !!sondageId && !!token,
  });
};

export const useUserResponsesForSondage = (sondageId, userId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['responses', 'sondage', sondageId, 'user', userId],
    queryFn: () => fetchUserResponsesForSondage(sondageId, userId, token),
    enabled: !!sondageId && !!userId && !!token,
  });
};

export const useCheckUserResponded = (questionId, userId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['responseCheck', questionId, userId],
    queryFn: () => checkUserRespondedToSondage(questionId, userId, token),
    enabled: !!questionId && !!userId && !!token,
  });
};

export const useSondageResponseStatistics = (sondageId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ['statistics', 'sondage', sondageId],
    queryFn: () => fetchSondageResponseStatistics(sondageId, token),
    enabled: !!sondageId && !!token,
  });
};

export const useSubmitResponse = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, answerData }) => submitResponse({ questionId, answerData, token }),
    onSuccess: (_, { questionId, sondageId }) => {
      queryClient.invalidateQueries({ queryKey: ['responses', 'sondage', sondageId] });
      queryClient.invalidateQueries({ queryKey: ['responses', 'question', questionId] });
      queryClient.invalidateQueries({ queryKey: ['statistics', 'sondage', sondageId] });
      toast.success('Response submitted successfully!');
    },
    onError: (error) => {
      console.error('Submit response error:', error);
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useUpdateResponse = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ responseId, answerData, sondageId }) => 
      updateResponse({ responseId, answerData, token }),
    onSuccess: (_, { responseId, sondageId }) => {
      queryClient.invalidateQueries({ queryKey: ['response', responseId] });
      queryClient.invalidateQueries({ queryKey: ['responses', 'sondage', sondageId] });
      queryClient.invalidateQueries({ queryKey: ['statistics', 'sondage', sondageId] });
      toast.success('Response updated successfully!');
    },
    onError: (error) => {
      console.error('Update response error:', error);
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useDeleteResponse = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ responseId, sondageId }) => deleteResponse({ responseId, token }),
    onSuccess: (_, { responseId, sondageId }) => {
      queryClient.invalidateQueries({ queryKey: ['response', responseId] });
      queryClient.invalidateQueries({ queryKey: ['responses', 'sondage', sondageId] });
      queryClient.invalidateQueries({ queryKey: ['statistics', 'sondage', sondageId] });
      toast.success('Response deleted successfully!');
    },
    onError: (error) => {
      console.error('Delete response error:', error);
      toast.error(`Error: ${error.message}`);
    },
  });
};