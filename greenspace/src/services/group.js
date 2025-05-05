import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

// Fetch all groups with pagination
const fetchGroups = async ({ page = 0, size = 10, sortBy = 'createDate', direction = 'desc', token }) => {
    if (!token) throw new Error("No token provided");

    const response = await fetch(
        `${API_BASE_URL}/api/groups?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch groups');
    }

    return response.json();
};

// Fetch group by ID
const fetchGroupById = async ({ id, token }) => {
    if (!token) throw new Error("No token provided");
    if (!id) throw new Error("No group id provided");

    const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch group');
    }

    return response.json();
};

// Fetch groups by member username
const fetchGroupsByMember = async ({ username, page = 0, size = 10, token }) => {
    if (!token) throw new Error("No token provided");
    if (!username) throw new Error("No username provided");

    const response = await fetch(
        `${API_BASE_URL}/api/groups/member/${username}?page=${page}&size=${size}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch groups by member');
    }

    return response.json();
};

// Create new group
const createGroup = async ({ groupData, token }) => {
    if (!token) throw new Error("No token provided");

    const response = await fetch(`${API_BASE_URL}/api/groups`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(groupData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create group');
    }

    return response.json();
};

// Update group
const updateGroup = async ({ id, groupData, token }) => {
    if (!token) throw new Error("No token provided");
    if (!id) throw new Error("No group id provided");

    const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(groupData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update group');
    }

    return response.json();
};

// Delete group
const deleteGroup = async ({ id, token }) => {
    if (!token) throw new Error("No token provided");
    if (!id) throw new Error("No group id provided");

    const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete group');
    }

    return { id };
};

// Send membership request
const sendMembershipRequest = async ({ groupId, token }) => {
    if (!token) throw new Error("No token provided");
    if (!groupId) throw new Error("No group id provided");

    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/request`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send membership request');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

// Handle membership request
const handleMembershipRequest = async ({ requestId, status, token }) => {
    if (!token) throw new Error("No token provided");
    if (!requestId) throw new Error("No request id provided");

    const response = await fetch(`${API_BASE_URL}/api/groups/request/${requestId}?status=${status}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to handle membership request');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : { requestId, status };
};

// Remove member
const removeMember = async ({ groupId, username, token }) => {
    if (!token) throw new Error("No token provided");
    if (!groupId) throw new Error("No group id provided");
    if (!username) throw new Error("No username provided");

    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/member/${username}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove member');
    }

    return { groupId, username };
};

// Create group publication
const createGroupPublication = async ({ groupId, publicationData, token }) => {
    if (!token) throw new Error("No token provided");
    if (!groupId) throw new Error("No group id provided");

    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/publication`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(publicationData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create group publication');
    }

    return response.json();
};

// Fetch group publications
const fetchGroupPublications = async ({ groupId, page = 0, size = 10, token }) => {
    if (!token) throw new Error("No token provided");
    if (!groupId) throw new Error("No group id provided");

    const response = await fetch(
        `${API_BASE_URL}/api/groups/${groupId}/publications?page=${page}&size=${size}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        if (response.status === 403) {
            return { restricted: true };
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch group publications');
    }

    return response.json();
};

// Fetch membership requests
const fetchMembershipRequests = async ({ groupId, token }) => {
    if (!token) throw new Error("No token provided");
    if (!groupId) throw new Error("No group id provided");

    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/requests`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch membership requests');
    }

    return response.json();
};

// Fetch user membership request
const fetchUserMembershipRequest = async ({ groupId, token }) => {
    if (!token) throw new Error("No token provided");
    if (!groupId) throw new Error("No group id provided");

    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/my-request`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        if (response.status === 403 || response.status === 204) {
            return null; // No access or no pending request
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch user membership request');
    }

    return response.json();
};

// Fetch user by username
const fetchUserByUsername = async ({ username, token }) => {
    if (!token) throw new Error("No token provided");
    if (!username) throw new Error("No username provided");

    const response = await fetch(`${API_BASE_URL}/u/${username}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch user');
    }

    return response.json();
};

// Upload group profile photo
const uploadGroupProfilePhoto = async ({ groupId, file, token }) => {
    if (!token) throw new Error("No token provided");
    if (!groupId) throw new Error("No group id provided");
    if (!file) throw new Error("No file provided");

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/profile-photo`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload group profile photo');
    }

    return response.text();
};

// Upload group cover photo
const uploadGroupCoverPhoto = async ({ groupId, file, token }) => {
    if (!token) throw new Error("No token provided");
    if (!groupId) throw new Error("No group id provided");
    if (!file) throw new Error("No file provided");

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/cover-photo`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload group cover photo');
    }

    return response.text();
};

// Fetch top 5 group members
const fetchTop5GroupMembers = async ({ groupId, token }) => {
    if (!token) throw new Error("No token provided");
    if (!groupId) throw new Error("No group id provided");

    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members/top5`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch top 5 group members');
    }

    return response.json();
};

// Fetch all group members with pagination, sorting, and filtering
const fetchAllGroupMembers = async ({ groupId, page = 0, size = 10, sortBy = 'publicationCount', direction = 'desc', token }) => {
    if (!token) throw new Error("No token provided");
    if (!groupId) throw new Error("No group id provided");

    const response = await fetch(
        `${API_BASE_URL}/api/groups/${groupId}/members?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch group members');
    }

    return response.json();
};

// Fetch member stats
const fetchMemberStats = async ({ groupId, username, token }) => {
    if (!token) throw new Error("No token provided");
    if (!groupId) throw new Error("No group id provided");
    if (!username) throw new Error("No username provided");

    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/member/${username}/stats`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch member stats');
    }

    return response.json();
};

// Update member settings (restrict post/comment)
const updateMemberSettings = async ({ groupId, username, settingsData, token }) => {
    if (!token) throw new Error("No token provided");
    if (!groupId) throw new Error("No group id provided");
    if (!username) throw new Error("No username provided");

    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/member/${username}/settings`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingsData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update member settings');
    }

    return response.json();
};

// Fetches an image with the auth token and returns a data URL
export const fetchImageWithToken = async (imageUrl, token) => {
    if (!imageUrl || !token) {
        console.warn('Missing image URL or token:', { imageUrl, token });
        return null;
    }

    const isAbsoluteUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
    const url = isAbsoluteUrl ? imageUrl : `${API_BASE_URL}/images${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
};

// React Query hooks
export const useGroups = (page, size, sortBy, direction) => {
    const token = useSelector((state) => state.auth.token);

    return useQuery({
        queryKey: ['groups', page, size, sortBy, direction],
        queryFn: () => fetchGroups({ page, size, sortBy, direction, token }),
        enabled: !!token,
        keepPreviousData: true,
    });
};

export const useGroupById = (id) => {
    const token = useSelector((state) => state.auth.token);

    return useQuery({
        queryKey: ['group', id],
        queryFn: () => fetchGroupById({ id, token }),
        enabled: !!id && !!token,
    });
};

export const useGroupsByMember = (username, page, size) => {
    const token = useSelector((state) => state.auth.token);

    return useQuery({
        queryKey: ['groupsByMember', username, page, size],
        queryFn: () => fetchGroupsByMember({ username, page, size, token }),
        enabled: !!username && !!token,
        keepPreviousData: true,
    });
};

export const useCreateGroup = () => {
    const token = useSelector((state) => state.auth.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (groupData) => createGroup({ groupData, token }),
        onSuccess: () => {
            queryClient.invalidateQueries(['groups']);
            queryClient.invalidateQueries(['groupsByMember']);
        },
    });
};

export const useUpdateGroup = () => {
    const token = useSelector((state) => state.auth.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, groupData }) => updateGroup({ id, groupData, token }),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['groups']);
            queryClient.invalidateQueries(['group', data.id]);
            queryClient.invalidateQueries(['groupsByMember']);
        },
    });
};

export const useDeleteGroup = () => {
    const token = useSelector((state) => state.auth.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteGroup({ id, token }),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['groups']);
            queryClient.invalidateQueries(['group', data.id]);
            queryClient.invalidateQueries(['groupsByMember']);
        },
    });
};

export const useSendMembershipRequest = () => {
    const token = useSelector((state) => state.auth.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (groupId) => sendMembershipRequest({ groupId, token }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['group', variables]);
            queryClient.invalidateQueries(['groupsByMember']);
            queryClient.invalidateQueries(['userMembershipRequest', variables]);
        },
    });
};

export const useHandleMembershipRequest = () => {
    const token = useSelector((state) => state.auth.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ requestId, status }) => handleMembershipRequest({ requestId, status, token }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['groups']);
            queryClient.invalidateQueries(['groupsByMember']);
            queryClient.invalidateQueries(['membershipRequests']);
            queryClient.invalidateQueries(['userMembershipRequest']);
            queryClient.invalidateQueries(['group', data.groupId]);
        },
    });
};

export const useRemoveGroupMember = () => {
    const token = useSelector((state) => state.auth.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, username }) => removeMember({ groupId, username, token }),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['group', data.groupId]);
            queryClient.invalidateQueries(['groupsByMember']);
            queryClient.invalidateQueries(['top5GroupMembers', data.groupId]);
            queryClient.invalidateQueries(['allGroupMembers', data.groupId]);
            queryClient.invalidateQueries(['memberStats', data.groupId, data.username]);
        },
    });
};

export const useCreateGroupPublication = () => {
    const token = useSelector((state) => state.auth.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, publicationData }) => createGroupPublication({ groupId, publicationData, token }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['groupPublications', variables.groupId]);
            queryClient.invalidateQueries(['group', variables.groupId]);
            queryClient.invalidateQueries(['publications']);
        },
    });
};

export const useGroupPublications = (groupId, page, size, isMember, isPublic) => {
    const token = useSelector((state) => state.auth.token);

    return useQuery({
        queryKey: ['groupPublications', groupId, page, size],
        queryFn: () => fetchGroupPublications({ groupId, page, size, token }),
        enabled: !!groupId && !!token && (isMember || isPublic),
        keepPreviousData: true,
    });
};

export const useMembershipRequests = (groupId, isAdmin) => {
    const token = useSelector((state) => state.auth.token);

    return useQuery({
        queryKey: ['membershipRequests', groupId],
        queryFn: async () => {
            const requests = await fetchMembershipRequests({ groupId, token });
            const userPromises = requests.map(request =>
                fetchUserByUsername({ username: request.username, token })
                    .then(user => ({
                        ...request,
                        photoProfile: user.photoProfile,
                    }))
                    .catch(error => {
                        console.error(`Failed to fetch user ${request.username}:`, error);
                        return { ...request, photoProfile: null };
                    })
            );
            return Promise.all(userPromises);
        },
        enabled: !!groupId && !!token && isAdmin,
    });
};

export const useUserMembershipRequest = (groupId) => {
    const token = useSelector((state) => state.auth.token);

    return useQuery({
        queryKey: ['userMembershipRequest', groupId],
        queryFn: () => fetchUserMembershipRequest({ groupId, token }),
        enabled: !!groupId && !!token,
    });
};

export const useUserByUsername = (username) => {
    const token = useSelector((state) => state.auth.token);

    return useQuery({
        queryKey: ['user', username],
        queryFn: () => fetchUserByUsername({ username, token }),
        enabled: !!username && !!token,
    });
};

export const useUploadGroupProfilePhoto = () => {
    const token = useSelector((state) => state.auth.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, file }) => uploadGroupProfilePhoto({ groupId, file, token }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['group', variables.groupId]);
            queryClient.invalidateQueries(['groups']);
            queryClient.invalidateQueries(['groupsByMember']);
        },
    });
};

export const useUploadGroupCoverPhoto = () => {
    const token = useSelector((state) => state.auth.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, file }) => uploadGroupCoverPhoto({ groupId, file, token }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['group', variables.groupId]);
            queryClient.invalidateQueries(['groups']);
            queryClient.invalidateQueries(['groupsByMember']);
        },
    });
};

export const useTop5GroupMembers = (groupId) => {
    const token = useSelector((state) => state.auth.token);

    return useQuery({
        queryKey: ['top5GroupMembers', groupId],
        queryFn: () => fetchTop5GroupMembers({ groupId, token }),
        enabled: !!groupId && !!token,
    });
};

export const useAllGroupMembers = (groupId, page, size, sortBy, direction) => {
    const token = useSelector((state) => state.auth.token);

    return useQuery({
        queryKey: ['allGroupMembers', groupId, page, size, sortBy, direction],
        queryFn: () => fetchAllGroupMembers({ groupId, page, size, sortBy, direction, token }),
        enabled: !!groupId && !!token,
        keepPreviousData: true,
        select: (data) => ({
            ...data,
            content: data.content.map(member => ({
                ...member,
                medal: member.medal || null, // Ensure medal field is included
            })),
        }),
    });
};

export const useMemberStats = (groupId, username) => {
    const token = useSelector((state) => state.auth.token);

    return useQuery({
        queryKey: ['memberStats', groupId, username],
        queryFn: () => fetchMemberStats({ groupId, username, token }),
        enabled: !!groupId && !!username && !!token,
    });
};

export const useUpdateMemberSettings = () => {
    const token = useSelector((state) => state.auth.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, username, settingsData }) => updateMemberSettings({ groupId, username, settingsData, token }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['allGroupMembers', variables.groupId]);
            queryClient.invalidateQueries(['group', variables.groupId]);
            queryClient.invalidateQueries(['top5GroupMembers', variables.groupId]);
            queryClient.invalidateQueries(['memberStats', variables.groupId, variables.username]);
        },
    });
};

// Hook to get the token from Redux
export const useAuthToken = () => {
    return useSelector((state) => state.auth.token);
};