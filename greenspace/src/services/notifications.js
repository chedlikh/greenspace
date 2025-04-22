import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const API_BASE_URL = "http://greenspace.ddns.net:8089";

// Fetch unread notifications
export const fetchUnreadNotifications = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/notifications/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/mark-as-read`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return response.json();
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read/${userId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }

  return response.json();
};

// Custom hooks
export const useNotifications = () => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  
  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => fetchUnreadNotifications(user?.id, token),
    enabled: !!user?.id && !!token,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};

export const useMarkNotificationAsRead = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => markNotificationAsRead(notificationId, token),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    }
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(user?.id, token),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    }
  });
};
