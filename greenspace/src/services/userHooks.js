import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://greenspace.ddns.net:8089";
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

// Delete user
export const deleteUser = async ({ username, token }) => {
  const response = await fetch(`${API_BASE_URL}/u/${username}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to delete user:", errorData);
    throw new Error(errorData.message || "Failed to delete user");
  }

  return response.json();
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

// Custom hooks

export const useUsers = () => {
  const token = useSelector((state) => state.auth.token);

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

export const useUserDetails = (username) => {
  const token = useSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["userDetails", username],
    queryFn: () => fetchUserByUsername(username, token),
    enabled: !!username && !!token,
  });
};

export const useUpdateUser = (username) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateUser({ username, payload, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["userDetails", username]);
      queryClient.invalidateQueries(["users"]);
      alert("User updated successfully!");
    },
  });
};

export const useDeleteUser = (username) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteUser({ username, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      alert("User deleted successfully!");
    },
  });
};

export const useAssignRolesToUser = (username) => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleNames) => assignRolesToUser({ username, roleNames, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["userDetails", username]);
      alert("Roles assigned successfully!");
    },
  });
};

export const useCreateUser = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userData, roleName }) => createUser({ userData, roleName, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      alert("User created successfully!");
    },
  });
};
