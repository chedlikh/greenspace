import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

// Fetch questions by sondage ID
const fetchQuestionsBySondageId = async (sondageId, token) => {
  if (!token) throw new Error('No authentication token provided');
  if (!sondageId) throw new Error('No sondageId provided');
  
  const response = await fetch(`${API_BASE_URL}/api/questions/sondage/${sondageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to fetch questions:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to fetch questions (Status: ${response.status})`);
  }
  
  return response.json();
};

// Fetch question by ID
const fetchQuestionById = async (questionId, token) => {
  if (!token) throw new Error('No authentication token provided');
  if (!questionId) throw new Error('No questionId provided');
  
  const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to fetch question:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to fetch question (Status: ${response.status})`);
  }
  
  return response.json();
};

// Create a question
const createQuestion = async ({ sondageId, questionData, token }) => {
  if (!token) throw new Error('No authentication token provided');
  if (!sondageId) throw new Error('No sondageId provided');
  
  const response = await fetch(`${API_BASE_URL}/api/questions/sondage/${sondageId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(questionData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to create question:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to create question (Status: ${response.status})`);
  }
  
  return response.json();
};

// Update a question
const updateQuestion = async ({ questionId, questionData, token }) => {
  if (!token) throw new Error('No authentication token provided');
  if (!questionId) throw new Error('No questionId provided');
  
  const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(questionData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to update question:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to update question (Status: ${response.status})`);
  }
  
  return response.json();
};

// Delete a question
const deleteQuestion = async ({ questionId, token }) => {
  if (!token) throw new Error('No authentication token provided');
  if (!questionId) throw new Error('No questionId provided');
  
  const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to delete question:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to delete question (Status: ${response.status})`);
  }
  
  return { success: true }; // DELETE returns no content
};

// Generate AI questions
const generateAIQuestions = async ({ prompt, count, token }) => {
  if (!token) throw new Error('No authentication token provided');
  if (!prompt || count < 1) throw new Error('Invalid prompt or question count');
  
  const response = await fetch(`${API_BASE_URL}/api/questions/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, count }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to generate AI questions:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to generate AI questions (Status: ${response.status})`);
  }
  
  return response.json();
};

// Save generated questions
const saveGeneratedQuestions = async ({ sondageId, questions, token }) => {
  if (!token) throw new Error('No authentication token provided');
  if (!sondageId) throw new Error('No sondageId provided');
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new Error('No questions provided or invalid questions format');
  }
  
  console.log('Saving generated questions:', { sondageId, questions, token: token ? 'Present' : 'Missing' });
  
  const response = await fetch(`${API_BASE_URL}/api/questions/save/${sondageId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(questions),
  });
  
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      console.error('Failed to parse error response:', e);
      errorData = { message: `Server error (Status: ${response.status})` };
    }
    console.error('Failed to save generated questions:', { status: response.status, errorData });
    throw new Error(errorData.message || `Failed to save generated questions (Status: ${response.status})`);
  }
  
  let responseData;
  try {
    responseData = await response.json();
  } catch (e) {
    console.error('Failed to parse response JSON:', e);
    throw new Error('Unexpected end of JSON input');
  }
  
  return responseData;
};

// React Query hooks
export const useQuestionsBySondageId = (sondageId) => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ['questions', sondageId],
    queryFn: () => fetchQuestionsBySondageId(sondageId, token),
    enabled: !!sondageId && !!token,
  });
};

export const useQuestionById = (questionId) => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: () => fetchQuestionById(questionId, token),
    enabled: !!questionId && !!token,
  });
};

export const useCreateQuestion = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sondageId, questionData }) => createQuestion({ sondageId, questionData, token }),
    onSuccess: (_, { sondageId }) => {
      queryClient.invalidateQueries({ queryKey: ['questions', sondageId] });
      toast.success('Question created successfully!');
    },
    onError: (error) => {
      console.error('Create question error:', error);
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useUpdateQuestion = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ questionId, questionData }) => 
      updateQuestion({ questionId, questionData, token }),
    onSuccess: (_, { sondageId }) => {
      queryClient.invalidateQueries({ queryKey: ['questions', sondageId] });
      toast.success('Question updated successfully!');
    },
    onError: (error) => {
      console.error('Update question error:', error);
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useDeleteQuestion = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ questionId, sondageId }) => deleteQuestion({ questionId, token }),
    onSuccess: (_, { sondageId }) => {
      queryClient.invalidateQueries({ queryKey: ['questions', sondageId] });
      toast.success('Question deleted successfully!');
    },
    onError: (error) => {
      console.error('Delete question error:', error);
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useGenerateAIQuestions = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ prompt, count }) => generateAIQuestions({ prompt, count, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('AI questions generated successfully!');
    },
    onError: (error) => {
      console.error('Generate AI questions error:', error);
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useSaveGeneratedQuestions = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sondageId, questions }) => 
      saveGeneratedQuestions({ sondageId, questions, token }),
    onSuccess: (_, { sondageId }) => {
      queryClient.invalidateQueries({ queryKey: ['questions', sondageId] });
      toast.success('Generated questions saved successfully!');
    },
    onError: (error) => {
      console.error('Save generated questions error:', error);
      toast.error(`Error: ${error.message}`);
    },
  });
};