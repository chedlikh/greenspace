import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

// Fetch all sites
export const fetchSites = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch sites:", errorData);
    throw new Error(errorData.message || "Failed to fetch sites");
  }

  return response.json();
};

// Fetch site by ID
export const fetchSiteById = async (id, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch site:", errorData);
    throw new Error(errorData.message || "Failed to fetch site");
  }

  return response.json();
};

// Create a new site
export const createSite = async ({ siteData, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(siteData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to create site:", errorData);
    throw new Error(errorData.message || "Failed to create site");
  }

  return response.json();
};

// Update site by ID
export const updateSite = async ({ id, siteData, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(siteData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to update site:", errorData);
    throw new Error(errorData.message || "Failed to update site");
  }

  return response.json();
};

// Delete site by ID
export const deleteSite = async ({ id, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to delete site:", errorData);
    throw new Error(errorData.message || "Failed to delete site");
  }

  return response.json();
};

// Assign users to site
export const assignUsersToSite = async ({ siteId, usernames, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${siteId}/assign-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ usernames }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to assign users to site:", errorData);
    throw new Error(errorData.message || "Failed to assign users to site");
  }

  return response.json();
};

// Unassign users from site
export const unassignUsersFromSite = async ({ siteId, usernames, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${siteId}/unassign-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ usernames }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to unassign users from site:", errorData);
    throw new Error(errorData.message || "Failed to unassign users from site");
  }

  return response.json();
};

// Assign site to societe
export const assignSiteToSociete = async ({ siteId, societeId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${siteId}/societe/${societeId}`, {
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

// Assign site to service
export const assignSiteToService = async ({ siteId, gserviceId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${siteId}/service/${gserviceId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to assign site to service:", errorData);
    throw new Error(errorData.message || "Failed to assign site to service");
  }

  return response.json();
};

// Unassign site from societe
export const unassignSiteFromSociete = async ({ siteId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${siteId}/societe`, {
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

// Unassign site from service
export const unassignSiteFromService = async ({ siteId, gserviceId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${siteId}/service/${gserviceId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to unassign site from service:", errorData);
    throw new Error(errorData.message || "Failed to unassign site from service");
  }

  return response.json();
};

// Fetch unassigned societes for a specific site
export const fetchUnassignedSocietes = async ({ siteId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${siteId}/unassigned-societes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch unassigned societes:", errorData);
    throw new Error(errorData.message || "Failed to fetch unassigned societes");
  }

  return response.json();
};

// Fetch unassigned services for a specific site
export const fetchUnassignedServices = async ({ siteId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${siteId}/unassigned-services`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch unassigned services:", errorData);
    throw new Error(errorData.message || "Failed to fetch unassigned services");
  }

  return response.json();
};

// Fetch assigned services for a specific site
export const fetchAssignedServices = async ({ siteId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${siteId}/services`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch assigned services:", errorData);
    throw new Error(errorData.message || "Failed to fetch assigned services");
  }

  return response.json();
};

// Fetch all societes (assuming you have this endpoint)
export const fetchAllSocietes = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Societes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch societes:", errorData);
    throw new Error(errorData.message || "Failed to fetch societes");
  }

  return response.json();
};

// Fetch all services (assuming you have this endpoint)
export const fetchAllServices = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Services`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch services:", errorData);
    throw new Error(errorData.message || "Failed to fetch services");
  }

  return response.json();
};

// Custom hooks

export const useSites = () => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["sites"],
    queryFn: () => fetchSites(token),
    enabled: !!token,
  });
};

export const useSiteById = (id) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["site", id],
    queryFn: () => fetchSiteById(id, token),
    enabled: !!id && !!token,
  });
};

export const useCreateSite = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteData) => createSite({ siteData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["sites"]);
    },
  });
};

export const useUpdateSite = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteData) => updateSite({ id, siteData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["site", id]);
      queryClient.invalidateQueries(["sites"]);
    },
  });
};

export const useDeleteSite = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteSite({ id, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["sites"]);
    },
  });
};

export const useAssignUsersToSite = (siteId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usernames) => assignUsersToSite({ siteId, usernames, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["site", siteId]);
    },
  });
};

export const useUnassignUsersFromSite = (siteId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usernames) => unassignUsersFromSite({ siteId, usernames, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["site", siteId]);
    },
  });
};

export const useAssignSiteToSociete = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ siteId, societeId }) => assignSiteToSociete({ siteId, societeId, token }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["site", variables.siteId]);
      queryClient.invalidateQueries(["sites"]);
      queryClient.invalidateQueries(["allSocietes"]);
    },
  });
};

export const useAssignSiteToService = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ siteId, gserviceId }) => assignSiteToService({ siteId, gserviceId, token }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["site", variables.siteId]);
      queryClient.invalidateQueries(["sites"]);
      queryClient.invalidateQueries(["allServices"]);
    },
  });
};

export const useUnassignSiteFromSociete = (siteId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unassignSiteFromSociete({ siteId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["site", siteId]);
      queryClient.invalidateQueries(["sites"]);
    },
  });
};

export const useUnassignSiteFromService = (siteId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gserviceId) => unassignSiteFromService({ siteId, gserviceId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["site", siteId]);
      queryClient.invalidateQueries(["sites"]);
    },
  });
};

export const useUnassignedSocietes = (siteId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["unassignedSocietes", siteId],
    queryFn: () => fetchUnassignedSocietes({ siteId, token }),
    enabled: !!siteId && !!token,
  });
};

export const useUnassignedServices = (siteId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["unassignedServices", siteId],
    queryFn: () => fetchUnassignedServices({ siteId, token }),
    enabled: !!siteId && !!token,
  });
};

export const useAssignedServices = (siteId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["assignedServices", siteId],
    queryFn: () => fetchAssignedServices({ siteId, token }),
    enabled: !!siteId && !!token,
  });
};

// Use all societes and filter unassigned ones
export const useAllSocietes = () => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["allSocietes"],
    queryFn: () => fetchAllSocietes(token),
    enabled: !!token,
  });
};

// Use all services and filter unassigned ones
export const useAllServices = () => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["allServices"],
    queryFn: () => fetchAllServices(token),
    enabled: !!token,
  });
};
// Fetch sites by societe ID
export const fetchSitesBySocieteId = async (societeId, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/societe/${societeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch sites by societe:", errorData);
    throw new Error(errorData.message || "Failed to fetch sites by societe");
  }

  return response.json();
};

export const useSitesBySocieteId = (societeId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["sitesBySociete", societeId],
    queryFn: () => fetchSitesBySocieteId(societeId, token),
    enabled: !!societeId && !!token,
  });
};