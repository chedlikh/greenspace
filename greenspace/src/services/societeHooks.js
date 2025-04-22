import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://greenspace.ddns.net:8089";
// Fetch all societes
export const fetchSocietes = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/societes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch societes:", errorData);
    throw new Error(errorData.message || "Failed to fetch societes");
  }

  return response.json();
};

// Fetch societe by ID
export const fetchSocieteById = async (id, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/societes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch societe:", errorData);
    throw new Error(errorData.message || "Failed to fetch societe");
  }

  return response.json();
};

// Create a new societe
export const createSociete = async ({ societeData, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/societes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(societeData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to create societe:", errorData);
    throw new Error(errorData.message || "Failed to create societe");
  }

  return response.json();
};

// Update societe by ID
export const updateSociete = async ({ id, societeData, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/societes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(societeData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to update societe:", errorData);
    throw new Error(errorData.message || "Failed to update societe");
  }

  return response.json();
};

// Delete societe by ID
export const deleteSociete = async ({ id, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/societes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to delete societe:", errorData);
    throw new Error(errorData.message || "Failed to delete societe");
  }

  return response.json();
};

// Fetch sites for a societe
export const fetchSocietesSites = async (societeId, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/societes/${societeId}/sites`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch societe's sites:", errorData);
    throw new Error(errorData.message || "Failed to fetch societe's sites");
  }

  return response.json();
};

// Assign site to societe
export const assignSiteToSociete = async ({ societeId, siteId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/societes/${societeId}/sites/${siteId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to assign site to societe:", errorData);
    throw new Error(errorData.message || "Failed to assign site to societe");
  }

  return response.json();
};

// Unassign site from societe
export const unassignSiteFromSociete = async ({ societeId, siteId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/societes/${societeId}/sites/${siteId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to unassign site from societe:", errorData);
    throw new Error(errorData.message || "Failed to unassign site from societe");
  }

  return response.json();
};

// Custom hooks

export const useSocietes = () => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["societes"],
    queryFn: () => fetchSocietes(token),
    enabled: !!token,
  });
};

export const useSocieteById = (id) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["societe", id],
    queryFn: () => fetchSocieteById(id, token),
    enabled: !!id && !!token,
  });
};

export const useSocietesSites = (societeId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["societe", societeId, "sites"],
    queryFn: () => fetchSocietesSites(societeId, token),
    enabled: !!societeId && !!token,
  });
};

export const useCreateSociete = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (societeData) => createSociete({ societeData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["societes"]);
      alert("Societe created successfully!");
    },
  });
};

export const useUpdateSociete = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (societeData) => updateSociete({ id, societeData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["societe", id]);
      queryClient.invalidateQueries(["societes"]);
      alert("Societe updated successfully!");
    },
  });
};

export const useDeleteSociete = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteSociete({ id, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["societes"]);
      alert("Societe deleted successfully!");
    },
  });
};

export const useAssignSiteToSociete = (societeId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteId) => assignSiteToSociete({ societeId, siteId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["societe", societeId]);
      queryClient.invalidateQueries(["societe", societeId, "sites"]);
      alert("Site assigned to societe successfully!");
    },
  });
};

export const useUnassignSiteFromSociete = (societeId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteId) => unassignSiteFromSociete({ societeId, siteId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["societe", societeId]);
      queryClient.invalidateQueries(["societe", societeId, "sites"]);
      alert("Site unassigned from societe successfully!");
    },
  });
};
