import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const API_BASE_URL = "http://greenspace.ddns.net:8089";
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
      alert("Site created successfully!");
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
      alert("Site updated successfully!");
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
      alert("Site deleted successfully!");
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
      alert("Users assigned to site successfully!");
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
      alert("Users unassigned from site successfully!");
    },
  });
};
