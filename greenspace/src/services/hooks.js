//hooks.js file
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch  } from "react-redux";
import { debounce } from 'lodash';
import { toast } from 'react-toastify';


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://greenspace.ddns.net:8089";

// logoutapi
export const logoutUser = async (token) => {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to logout:", errorData);
    throw new Error(errorData.message || "Failed to logout");
  }

  return response.json();
};

// customlogoutapi

export const useLogout = () => {
  const dispatch = useDispatch();

  return useMutation(
    (token) => logoutUser(token),
    {
      onSuccess: () => {
        // Dispatch Redux logout action to clear local state
        dispatch(logout());
      },
      onError: (error) => {
        console.error('Logout error:', error);
        // Even if API logout fails, we should clear local state
        dispatch(logout());
      },
    }
  );
};


// Fetch authenticated user details
export const fetchUserDetails = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch user details:", errorData);
    throw new Error(errorData.message || "Failed to fetch user details");
  }

  return response.json();
};

// Fetch all users
export const fetchUsers = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Error fetching users");
  }

  return response.json();
};

// Fetch user details by username
export const fetchUserByUsername = async (username, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/u/${username}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch user details:", errorData);
    throw new Error(errorData.message || "Failed to fetch user details");
  }

  return response.json();
};

// Update user details
export const updateUser = async ({ username, payload, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/u/${username}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  return response.json();
};

export const deleteUser = async ({ username,token }) => {
  

  const response = await fetch(`${API_BASE_URL}/u/${username}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      
    },
    
  });
  console.log("Delete response:", response); 
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to delete user:", errorData);
    throw new Error(errorData.message || "Failed to delete user");
  }

  return response.json(); // Ensure the response is valid JSON
};
// Custom hook to get users and authenticated user
export const useUsers = () => {
  const token = useSelector((state) => state.auth.token);
  console.log("Token:", token);

  // Get authenticated user
  const userQuery = useQuery({
    queryKey: ["userDetails", token],
    queryFn: () => fetchUserDetails(token),
    enabled: !!token,
  });

  // Get all users
  const usersQuery = useQuery({
    queryKey: ["users", token],
    queryFn: () => fetchUsers(token),
    enabled: !!token,
  });

  return { userQuery, usersQuery };
};

// Custom hook to fetch user details by username
export const useUserDetails = (username) => {
  const token = useSelector((state) => state.auth.token);
  console.log("Token:", token);

  return useQuery({
    queryKey: ["userDetails", username],
    queryFn: () => fetchUserByUsername(username, token),
    enabled: !!username && !!token,
  });
};

// Custom hook to update user details
export const useUpdateUser = (username) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  console.log("Token:", token);

  return useMutation({
    mutationFn: (payload) => updateUser({ username, payload, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["userDetails", username]); // Invalidate and refetch user details
      queryClient.invalidateQueries(["users"]); // Invalidate and refetch users list
      alert("User updated successfully!");
    },
  
  });
};

export const useDeleteUser = (username) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  console.log("Token:", token);

  return useMutation({
    mutationFn: () => deleteUser({ username,token }),
    onSuccess: () => {
      console.log("User deleted successfully");
      queryClient.invalidateQueries(["/users"]); // Invalidate the users list
      alert("User deleted successfully!");
   
    },
  });
};
// Assign roles to a user
export const assignRolesToUser = async ({ username, roleNames, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/u/${username}/assign-roles`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(roleNames),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to assign roles:", errorData);
    throw new Error(errorData.message || "Failed to assign roles");
  }

  return response.json();
};
export const useAssignRolesToUser = (username) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleNames) => assignRolesToUser({ username, roleNames, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["userDetails", username]); // Invalidate and refetch user details
      alert("Roles assigned successfully!");
    },
    onError: (error) => {
      console.error("Error assigning roles:", error);
      alert("Failed to assign roles: " + error.message);
    },
  });
};
// Create a new user
export const createUser = async ({ userData, roleName, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/create?roleName=${roleName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to create user:", errorData);
    throw new Error(errorData.message || "Failed to create user");
  }

  return response.json();
};

// Custom hook to create a user
export const useCreateUser = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userData, roleName }) => createUser({ userData, roleName, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]); // Invalidate and refetch users list
      
      
    },
    onError: (error) => {
      console.error("Error creating user:", error);
    },
  });
};
// Custom hook to upload profile photo
export const useUploadProfilePhoto = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, file }) => {
      if (!username) throw new Error("Username is required");
      return uploadProfilePhoto(username, file, token);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["userDetails", variables.username]);
      return data;
    },
  });
};

// Custom hook to upload cover photo
export const useUploadCoverPhoto = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, filecover }) => {
      if (!username) throw new Error("Username is required");
      return uploadCoverPhoto(username, filecover, token);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["userDetails", variables.username]);
      return data;
    },
  });
};

// Upload profile photo
export const uploadProfilePhoto = async (username, file, token) => {
  if (!token) throw new Error("No token provided");
  if (!file) throw new Error("No file provided");
  if (!username) throw new Error("No username provided");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/${username}/profile-photo`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Failed to upload profile photo:", errorData);
    throw new Error(errorData.message || `Failed to upload profile photo: ${response.status}`);
  }

  return response.json();
};

// Upload cover photo
export const uploadCoverPhoto = async (username, file, token) => {
  if (!token) throw new Error("No token provided");
  
  if (!username) throw new Error("No username provided");

  const formData = new FormData();
  formData.append("filecover", file);  

  const response = await fetch(`${API_BASE_URL}/${username}/cover-photo`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Failed to upload cover photo:", errorData);
    throw new Error(errorData.message || `Failed to upload cover photo: ${response.status}`);
  }

  return response.json();
};
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


// Custom hook to fetch sites
export const useSites = () => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["sites"],
    queryFn: () => fetchSites(token),
    enabled: !!token, // Only fetch if the token is available
  });
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

// Custom hook to create a site
export const useCreateSite = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteData) => createSite({ siteData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["sites"]); // Invalidate and refetch sites list
      alert("Site created successfully!");
    },
    onError: (error) => {
      console.error("Error creating site:", error);
      alert("Failed to create site: " + error.message);
    },
  });
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

// Custom hook to fetch site by ID
export const useSiteById = (id) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["site", id],
    queryFn: () => fetchSiteById(id, token),
    enabled: !!id && !!token, // Only fetch if the ID and token are available
  });
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

// Custom hook to update site
export const useUpdateSite = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteData) => updateSite({ id, siteData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["site", id]); // Invalidate and refetch site details
      alert("Site updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating site:", error);
      alert("Failed to update site: " + error.message);
    },
  });
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

// Custom hook to delete site
export const useDeleteSite = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteSite({ id, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["sites"]); // Invalidate and refetch sites list
      alert("Site deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting site:", error);
      alert("Failed to delete site: " + error.message);
    },
  });
};
// Assign users to poste
export const assignUsersToPoste = async ({ posteId, usernames, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/postes/${posteId}/assign-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ usernames }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to assign users to poste:", errorData);
    throw new Error(errorData.message || "Failed to assign users to poste");
  }

  return response.json();
};

// Custom hook to assign users to poste
export const useAssignUsersToPoste = (posteId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usernames) => assignUsersToPoste({ posteId, usernames, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["poste", posteId]); // Invalidate and refetch site details
      alert("Users assigned to poste successfully!");
    },
    onError: (error) => {
      console.error("Error assigning users to poste:", error);
      alert("Failed to assign users to poste: " + error.message);
    },
  });
};
// Unassign users from poste
export const unassignUsersFromPoste = async ({ posteId, usernames, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/postes/${posteId}/unassign-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ usernames }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to unassign users from poste:", errorData);
    throw new Error(errorData.message || "Failed to unassign users from poste");
  }

  return response.json();
};

// Custom hook to unassign users from poste
export const useUnassignUsersFromPoste = (posteId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usernames) => unassignUsersFromPoste({ posteId, usernames, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["poste", posteId]); // Invalidate and refetch site details
      alert("Users unassigned from poste successfully!");
    },
    onError: (error) => {
      console.error("Error unassigning users from poste:", error);
      alert("Failed to unassign users from poste: " + error.message);
    },
  });
};

export const useUsersByPosteId = (posteId) => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ['posteUsers', posteId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/postes/${posteId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch poste users');
      return response.json();
    },
    enabled: !!posteId,
  });
};
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

// Custom hook to fetch all societes
export const useSocietes = () => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["societes"],
    queryFn: () => fetchSocietes(token),
    enabled: !!token, // Only fetch if the token is available
  });
};

// Custom hook to fetch societe by ID
export const useSocieteById = (id) => {
  console.log("Fetching societe with ID:", id);
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["societe", id],
    queryFn: () => fetchSocieteById(id, token),
    enabled: !!id && !!token, // Only fetch if the ID and token are available
  });
};

// Custom hook to fetch sites for a societe
export const useSocietesSites = (societeId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["societe", societeId, "sites"],
    queryFn: () => fetchSocietesSites(societeId, token),
    enabled: !!societeId && !!token, // Only fetch if the societeId and token are available
  });
};

// Custom hook to create a societe
export const useCreateSociete = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (societeData) => createSociete({ societeData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["societes"]); // Invalidate and refetch societes list
      alert("Societe created successfully!");
    },
    onError: (error) => {
      console.error("Error creating societe:", error);
      alert("Failed to create societe: " + error.message);
    },
  });
};

// Custom hook to update societe
export const useUpdateSociete = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (societeData) => updateSociete({ id, societeData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["societe", id]); // Invalidate and refetch societe details
      queryClient.invalidateQueries(["societes"]); // Invalidate and refetch societes list
      alert("Societe updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating societe:", error);
      alert("Failed to update societe: " + error.message);
    },
  });
};

// Custom hook to delete societe
export const useDeleteSociete = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteSociete({ id, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["societes"]); // Invalidate and refetch societes list
      alert("Societe deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting societe:", error);
      alert("Failed to delete societe: " + error.message);
    },
  });
};

// Custom hook to assign site to societe
export const useAssignSiteToSociete = (societeId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteId) => assignSiteToSociete({ societeId, siteId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["societe", societeId]); // Invalidate and refetch societe details
      queryClient.invalidateQueries(["societe", societeId, "sites"]); // Invalidate and refetch societe's sites
      alert("Site assigned to societe successfully!");
    },
    onError: (error) => {
      console.error("Error assigning site to societe:", error);
      alert("Failed to assign site to societe: " + error.message);
    },
  });
};

// Custom hook to unassign site from societe
export const useUnassignSiteFromSociete = (societeId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteId) => unassignSiteFromSociete({ societeId, siteId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["societe", societeId]); // Invalidate and refetch societe details
      queryClient.invalidateQueries(["societe", societeId, "sites"]); // Invalidate and refetch societe's sites
      alert("Site unassigned from societe successfully!");
    },
    onError: (error) => {
      console.error("Error unassigning site from societe:", error);
      alert("Failed to unassign site from societe: " + error.message);
    },
  });
};

// Fetch all Gservices
export const fetchGservices = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/gservices`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch Gservices:", errorData);
    throw new Error(errorData.message || "Failed to fetch Gservices");
  }

  return response.json();
};

// Fetch Gservice by ID
export const fetchGserviceById = async (id, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/gservices/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch Gservice:", errorData);
    throw new Error(errorData.message || "Failed to fetch Gservice");
  }

  return response.json();
};

// Create a new Gservice
export const createGservice = async ({ gserviceData, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/gservices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(gserviceData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to create Gservice:", errorData);
    throw new Error(errorData.message || "Failed to create Gservice");
  }

  return response.json();
};

// Update Gservice by ID
export const updateGservice = async ({ id, gserviceData, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/gservices/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(gserviceData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to update Gservice:", errorData);
    throw new Error(errorData.message || "Failed to update Gservice");
  }

  return response.json();
};

// Delete Gservice by ID
export const deleteGservice = async ({ id, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/gservices/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to delete Gservice:", errorData);
    throw new Error(errorData.message || "Failed to delete Gservice");
  }

  return response.json();
};

// Assign site to Gservice
export const assignSiteToGservice = async ({ gserviceId, siteId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/gservices/${gserviceId}/assign-site/${siteId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to assign site to Gservice:", errorData);
    throw new Error(errorData.message || "Failed to assign site to Gservice");
  }

  // Handle empty response
  try {
    return await response.json();
  } catch (error) {
    return { message: "Site assigned successfully" }; // Fallback for empty response
  }
};

// Unassign site from Gservice
export const unassignSiteFromGservice = async ({ gserviceId, siteId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/gservices/${gserviceId}/unassign-site/${siteId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to unassign site from Gservice:", errorData);
    throw new Error(errorData.message || "Failed to unassign site from Gservice");
  }

  // Handle empty response
  try {
    return await response.json();
  } catch (error) {
    return { message: "Site unassigned successfully" }; // Fallback for empty response
  }
};
// Fetch services for a site
export const fetchSiteServices = async (siteId, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/Site/${siteId}/services`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch site's services:", errorData);
    throw new Error(errorData.message || "Failed to fetch site's services");
  }

  return response.json();
};

// Custom hook to fetch services for a site
export const useSiteServices = (siteId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["site", siteId, "services"],
    queryFn: () => fetchSiteServices(siteId, token),
    enabled: !!siteId && !!token, // Only fetch if the siteId and token are available
  });
};

// Custom hooks for Gservice

// Fetch all Gservices
export const useGservices = () => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["gservices"],
    queryFn: () => fetchGservices(token),
    enabled: !!token, // Only fetch if the token is available
  });
};

// Fetch Gservice by ID
export const useGserviceById = (id) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["gservice", id],
    queryFn: () => fetchGserviceById(id, token),
    enabled: !!id && !!token, // Only fetch if the ID and token are available
  });
};

// Create a new Gservice
export const useCreateGservice = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gserviceData) => createGservice({ gserviceData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["gservices"]); // Invalidate and refetch Gservices list
      alert("Gservice created successfully!");
    },
    onError: (error) => {
      console.error("Error creating Gservice:", error);
      alert("Failed to create Gservice: " + error.message);
    },
  });
};

// Update Gservice by ID
export const useUpdateGservice = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gserviceData) => updateGservice({ id, gserviceData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["gservice", id]); // Invalidate and refetch Gservice details
      queryClient.invalidateQueries(["gservices"]); // Invalidate and refetch Gservices list
      alert("Gservice updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating Gservice:", error);
      alert("Failed to update Gservice: " + error.message);
    },
  });
};

// Delete Gservice by ID
export const useDeleteGservice = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteGservice({ id, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["gservices"]); // Invalidate and refetch Gservices list
      alert("Gservice deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting Gservice:", error);
      alert("Failed to delete Gservice: " + error.message);
    },
  });
};

// Assign site to Gservice
export const useAssignSiteToGservice = (gserviceId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteId) => assignSiteToGservice({ gserviceId, siteId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["gservice", gserviceId]); // Invalidate and refetch Gservice details
      alert("Site assigned to Gservice successfully!");
    },
    onError: (error) => {
      console.error("Error assigning site to Gservice:", error);
      alert("Failed to assign site to Gservice: " + error.message);
    },
  });
};

// Unassign site from Gservice
export const useUnassignSiteFromGservice = (gserviceId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteId) => unassignSiteFromGservice({ gserviceId, siteId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["gservice", gserviceId]); // Invalidate and refetch Gservice details
      alert("Site unassigned from Gservice successfully!");
    },
    onError: (error) => {
      console.error("Error unassigning site from Gservice:", error);
      alert("Failed to unassign site from Gservice: " + error.message);
    },
  });
};
//hooks from claude













export const useGservice = (id) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["gservice-sites", id],
    queryFn: () => fetchGservice(id, token),
    enabled: !!id && !!token, // Only fetch if the ID and token are available
  });
};
const fetchGserviceSites = async (gserviceId, token) => {
  if (!gserviceId || !token) return [];

  const response = await fetch(`${API_BASE_URL}/api/gservices/${gserviceId}/available-sites`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch available sites:", errorData);
    throw new Error(errorData.message || "Failed to fetch available sites");
  }

  return response.json();
};

export const useGserviceSites = (gserviceId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["gservice-sites", gserviceId],
    queryFn: () => fetchGserviceSites(gserviceId, token),
    enabled: !!gserviceId && !!token, // Only fetch if the gserviceId and token are available
  });
};

//----------------------------------POSTE-------------------------------------//




// Fetch all postes
export const fetchPostes = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/postes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch postes:", errorData);
    throw new Error(errorData.message || "Failed to fetch postes");
  }

  return response.json();
};

// Fetch poste by ID
export const fetchPosteById = async (id, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/postes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch poste details:", errorData);
    throw new Error(errorData.message || "Failed to fetch poste details");
  }

  return response.json();
};

// Fetch services for a poste
export const fetchServicesByPosteId = async (posteId, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/postes/${posteId}/services`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch poste services:", errorData);
    throw new Error(errorData.message || "Failed to fetch poste services");
  }

  return response.json();
};
// getpostesbyserviceid
export const getPostByServiceId = async (serviceId, token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/gservices/${serviceId}/postes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch poste services:", errorData);
    throw new Error(errorData.message || "Failed to fetch poste services");
  }

  return response.json();
};

// Fetch all services
export const fetchServices = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/gservices`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch services:", errorData);
    throw new Error(errorData.message || "Failed to fetch services");
  }

  return response.json();
};

// Create a new poste
export const createPoste = async ({ posteData, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/postes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(posteData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to create poste:", errorData);
    throw new Error(errorData.message || "Failed to create poste");
  }

  return response.json();
};

// Update a poste
export const updatePoste = async ({ id, posteData, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/postes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(posteData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to update poste:", errorData);
    throw new Error(errorData.message || "Failed to update poste");
  }

  return response.json();
};

// Delete a poste
export const deletePoste = async ({ id, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/postes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to delete poste:", errorData);
    throw new Error(errorData.message || "Failed to delete poste");
  }

  return response.json();
};

// Assign a service to a poste
export const assignServiceToPoste = async ({ posteId, serviceId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/postes/${posteId}/services/${serviceId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to assign service to poste:", errorData);
    throw new Error(errorData.message || "Failed to assign service to poste");
  }

  return response.json();
};

// Unassign a service from a poste
export const unassignServiceFromPoste = async ({ posteId, serviceId, token }) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/postes/${posteId}/services/${serviceId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to unassign service from poste:", errorData);
    throw new Error(errorData.message || "Failed to unassign service from poste");
  }

  return response.json();
};

// Custom hooks

export const usePostes = () => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["postes"],
    queryFn: () => fetchPostes(token),
    enabled: !!token,
  });
};

export const usePosteById = (id) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["poste", id],
    queryFn: () => fetchPosteById(id, token),
    enabled: !!id && !!token,
  });
};

export const useServicesByPosteId = (posteId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["posteServices", posteId],
    queryFn: () => fetchServicesByPosteId(posteId, token),
    enabled: !!posteId && !!token,
  });
};
export const usePosteByServiceId = (serviceId) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["servicesPostes", serviceId],
    queryFn: () => getPostByServiceId(serviceId, token),
    enabled: !!serviceId && !!token,
  });
};

export const useServices = () => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["services"],
    queryFn: () => fetchServices(token),
    enabled: !!token,
  });
};

export const useCreatePoste = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (posteData) => createPoste({ posteData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["postes"]);
      alert("Poste created successfully!");
    },
  });
};

export const useUpdatePoste = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (posteData) => updatePoste({ id, posteData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["poste", id]);
      queryClient.invalidateQueries(["postes"]);
      alert("Poste updated successfully!");
    },
  });
};

export const useDeletePoste = (id) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deletePoste({ id, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["postes"]);
      alert("Poste deleted successfully!");
    },
  });
};

export const useAssignServiceToPoste = (posteId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId) => assignServiceToPoste({ posteId, serviceId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["posteServices", posteId]);
      alert("Service assigned to poste successfully!");
    },
  });
};

export const useUnassignServiceFromPoste = (posteId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId) => unassignServiceFromPoste({ posteId, serviceId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["posteServices", posteId]);
      alert("Service unassigned from poste successfully!");
    },
  });
};

// -----------------------sondage------------------------------//
// -----------------------sondage------------------------------//
const fetchSondages = async (token) => {
  if (!token) throw new Error("No token provided");

  const response = await fetch(`${API_BASE_URL}/api/sondages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch sondages:", errorData);
    throw new Error(errorData.message || "Failed to fetch sondages");
  }
  
  return response.json();
};

const fetchSondageById = async (id, token) => {
  if (!token) throw new Error("No token provided");
  
  const response = await fetch(`${API_BASE_URL}/api/sondages/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch sondage details:", errorData);
    throw new Error(errorData.message || "Failed to fetch sondage details");
  }
  
  return response.json();
};

const fetchServicesBySondageId = async (id, token) => {
  if (!token) throw new Error("No token provided");
  
  const response = await fetch(`${API_BASE_URL}/api/sondages/${id}/services`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch sondage services:", errorData);
    throw new Error(errorData.message || "Failed to fetch sondage services");
  }
  
  return response.json();
};

// Create a new sondage
const createSondage = async ({ sondageData, token }) => {
  if (!token) throw new Error("No token provided");
  
  const response = await fetch(`${API_BASE_URL}/api/sondages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sondageData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to create sondage:", errorData);
    throw new Error(errorData.message || "Failed to create sondage");
  }
  
  return response.json();
};

// Update a sondage
const updateSondage = async ({ id, sondageData, token }) => {
  if (!token) throw new Error("No token provided");
  
  const response = await fetch(`${API_BASE_URL}/api/sondages/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sondageData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to update sondage:", errorData);
    throw new Error(errorData.message || "Failed to update sondage");
  }
  
  return response.json();
};

// Delete a sondage
const deleteSondage = async ({ id, token }) => {
  if (!token) throw new Error("No token provided");
  
  const response = await fetch(`${API_BASE_URL}/api/sondages/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to delete sondage:", errorData);
    throw new Error(errorData.message || "Failed to delete sondage");
  }
  
  return response.json();
};

// Assign service to sondage
const assignServiceToSondage = async ({ sondageId, serviceId, token }) => {
  console.log('assignServiceToSondage called with:', { sondageId, serviceId });
  if (!token) throw new Error("No token provided");
  const serviceIdStr = String(serviceId);
  console.log('Final URL being called:', `${API_BASE_URL}/api/sondages/${sondageId}/services/${serviceIdStr}`);
  
  const response = await fetch(`${API_BASE_URL}/api/sondages/${sondageId}/services/${serviceId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to assign service to sondage:", errorData);
    throw new Error(errorData.message || "Failed to assign service to sondage");
  }
  
  return response.json();
};

// Unassign service from sondage
const unassignServiceFromSondage = async ({ sondageId, serviceId, token }) => {
  if (!token) {
    throw new Error('No token provided');
  }

  if (!sondageId || !serviceId) {
    throw new Error('Missing sondageId or serviceId');
  }

  console.log(`Sending DELETE request to ${API_BASE_URL}/api/sondages/${sondageId}/services/${serviceId}`); // Debug log

  const response = await fetch(`${API_BASE_URL}/api/sondages/${sondageId}/services/${serviceId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: 'Unknown error occurred' };
    }
    console.error('Failed to unassign service from sondage:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
    });
    throw new Error(errorData.message || 'Failed to unassign service from sondage');
  }

  // DELETE requests may not return a body, so handle empty response
  try {
    return await response.json();
  } catch (e) {
    return { success: true }; // Fallback for empty response
  }
};
// React Query hooks
export const useSondages = () => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ['sondages'],
    queryFn: () => fetchSondages(token),
    enabled: !!token,
  });
};

export const useSondageById = (sondageId) => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ['sondage', sondageId],
    queryFn: () => fetchSondageById(sondageId, token),
    enabled: !!sondageId && !!token,
  });
};

export const useServicesBySondageId = (sondageId) => {
  const token = useSelector((state) => state.auth.token);
  
  return useQuery({
    queryKey: ['sondageServices', sondageId],
    queryFn: () => fetchServicesBySondageId(sondageId, token),
    enabled: !!sondageId && !!token,
  });
};

export const useCreateSondage = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sondageData) => createSondage({ sondageData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sondages'] });
      alert("Sondage created successfully!");
    },
  });
};

export const useUpdateSondage = (sondageId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sondageData) => updateSondage({ id: sondageId, sondageData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sondage', sondageId] });
      queryClient.invalidateQueries({ queryKey: ['sondages'] });
      alert("Sondage updated successfully!");
    },
  });
};

export const useDeleteSondage = (sondageId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => deleteSondage({ id: sondageId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sondages'] });
      alert("Sondage deleted successfully!");
    },
  });
};

export const useAssignServiceToSondage = (sondageId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (serviceId) => {
      const actualServiceId = typeof serviceId === 'object' 
        ? serviceId?.serviceId 
        : serviceId;
      
      if (actualServiceId === undefined || actualServiceId === null) {
        throw new Error('No serviceId provided');
      }

      return assignServiceToSondage({ 
        sondageId, 
        serviceId: actualServiceId, 
        token 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sondageServices', sondageId] });
      queryClient.invalidateQueries({ queryKey: ['sondage', sondageId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] }); // Invalidate notifications
    },
    onError: (error) => {
      console.error('Assignment failed:', error);
    }
  });
};

export const useUnassignServiceFromSondage = (sondageId) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId) => {
      const actualServiceId = typeof serviceId === 'object' ? serviceId?.serviceId : serviceId;
      if (actualServiceId === undefined || actualServiceId === null) {
        throw new Error('No valid serviceId provided');
      }
      console.log(`Unassigning service ${actualServiceId} from sondage ${sondageId}`);
      return unassignServiceFromSondage({ sondageId, serviceId: actualServiceId, token });
    },
    onSuccess: debounce(() => {
      console.log('Service unassigned successfully');
      // Batch invalidate both queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          (query.queryKey[0] === 'sondageServices' && query.queryKey[1] === sondageId) ||
          (query.queryKey[0] === 'sondage' && query.queryKey[1] === sondageId),
      });
      toast.success('Service unassigned from sondage successfully!');
    }, 300),
    onError: (error) => {
      console.error('Failed to unassign service:', error.message);
      toast.error(`Error: ${error.message}`);
    },
  });
};