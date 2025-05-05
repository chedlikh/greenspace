import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  useTop5GroupMembers,
  useAllGroupMembers,
  useMembershipRequests,
  useHandleMembershipRequest,
  fetchImageWithToken,
  useAuthToken,
} from '../../../services/group';
import MemberStatsModal from './MemberStatsModal';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { toast } from 'react-toastify';
import { useRemoveGroupMember, useUpdateMemberSettings } from '../../../services/group';

const GroupMemberList = ({ groupId, isAdmin, groupMembers }) => {
  const { id } = useParams();
  const groupIdToUse = groupId || id;
  const token = useAuthToken();
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [sortBy, setSortBy] = useState('publicationCount');
  const [direction, setDirection] = useState('desc');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberPhotoUrls, setMemberPhotoUrls] = useState({});
  const [requestPhotoUrls, setRequestPhotoUrls] = useState({});

  const { data: top5Members, isLoading: isTop5Loading, isError: isTop5Error, error: top5Error } = useTop5GroupMembers(groupIdToUse);
  const { data: allMembers, isLoading: isAllLoading, isError: isAllError, error: allError } = useAllGroupMembers(
    groupIdToUse,
    page,
    size,
    sortBy,
    direction
  );
  const { data: requests, isLoading: isRequestsLoading, isError: isRequestsError, error: requestsError } = useMembershipRequests(groupIdToUse, isAdmin);
  const { mutate: handleRequest, isLoading: isHandling } = useHandleMembershipRequest();
  const removeMemberMutation = useRemoveGroupMember();
  const updateSettingsMutation = useUpdateMemberSettings();

  console.log('GroupMemberList data:', {
    top5Members,
    allMembers,
    requests,
    groupMembers,
    groupIdToUse,
    isAdmin,
    memberCount: allMembers?.totalElements || top5Members?.length || groupMembers?.length || 0
  });

  useEffect(() => {
    if (!token) return;

    const fetchMemberPhotos = async () => {
      const newPhotoUrls = {};
      const members = showAllMembers
        ? (allMembers?.content?.length > 0 ? allMembers.content : groupMembers || [])
        : (top5Members?.length > 0 ? top5Members : groupMembers || []);
      for (const member of members) {
        if (member.photoProfile) {
          newPhotoUrls[member.userId || member.id] = await fetchImageWithToken(member.photoProfile, token);
        }
      }
      setMemberPhotoUrls(newPhotoUrls);
    };

    fetchMemberPhotos();

    return () => {
      Object.values(memberPhotoUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [top5Members, allMembers, groupMembers, showAllMembers, token]);

  useEffect(() => {
    if (!requests || !token || !isAdmin) return;

    const fetchRequestPhotos = async () => {
      const newPhotoUrls = {};
      for (const request of requests) {
        if (request.photoProfile) {
          newPhotoUrls[request.userId] = await fetchImageWithToken(request.photoProfile, token);
        }
      }
      setRequestPhotoUrls(newPhotoUrls);
    };

    fetchRequestPhotos();

    return () => {
      Object.values(requestPhotoUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [requests, token, isAdmin]);

  const handleRequestAction = (requestId, status) => {
    handleRequest(
      { requestId, status, groupId: groupIdToUse },
      {
        onSuccess: () => {
          toast.success(`Request ${status.toLowerCase()}!`);
        },
        onError: (error) => {
          toast.error(`Failed to handle request: ${error.message}`);
        },
      }
    );
  };

  const handleRemoveMember = (username) => {
    if (window.confirm(`Are you sure you want to remove ${username} from the group?`)) {
      removeMemberMutation.mutate(
        { groupId: groupIdToUse, username },
        {
          onSuccess: () => {
            toast.success(`${username} removed from the group!`);
          },
          onError: (error) => {
            toast.error(`Failed to remove member: ${error.message}`);
          },
        }
      );
    }
  };

  const handleUpdateSettings = (username, canPost, canComment) => {
    updateSettingsMutation.mutate(
      {
        groupId: groupIdToUse,
        username,
        settingsData: { canPost, canComment },
      },
      {
        onSuccess: () => {
          toast.success(`Permissions updated for ${username}!`);
        },
        onError: (error) => {
          toast.error(`Failed to update permissions: ${error.message}`);
        },
      }
    );
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(0);
  };

  const handleDirectionChange = (e) => {
    setDirection(e.target.value);
    setPage(0);
  };

  const renderMedal = (index) => {
    if (sortBy !== 'joinDate' && direction === 'desc') {
      if (index === 0) return <span className="text-yellow-500">🥇</span>;
      if (index === 1) return <span className="text-gray-400">🥈</span>;
      if (index === 2) return <span className="text-amber-600">🥉</span>;
    }
    return null;
  };

  if (isTop5Loading || isRequestsLoading) return <LoadingSpinner />;
  if (isTop5Error) return <ErrorMessage message={top5Error.message} />;
  if (isAllError && showAllMembers) return <ErrorMessage message={allError.message} />;
  if (isRequestsError && isAdmin) return <ErrorMessage message={requestsError.message} />;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {showAllMembers ? 'All Members' : 'Top 5 Members'} ({allMembers?.totalElements || top5Members?.length || groupMembers?.length || 0})
      </h2>

      {!showAllMembers ? (
        <>
          <ul className="space-y-3">
            {top5Members && top5Members.length > 0 ? (
              top5Members.map((member, index) => (
                <li
                  key={member.userId}
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                >
                  <img
                    src={memberPhotoUrls[member.userId] || '/default-avatar.png'}
                    alt={member.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex items-center">
                    {renderMedal(index)}
                    <span className="ml-2 text-gray-700">
                      {member.firstName} {member.lastName} (@{member.username})
                    </span>
                    {member.userId === groupIdToUse.adminId && (
                      <span className="ml-2 text-sm text-indigo-600">(Admin)</span>
                    )}
                  </div>
                </li>
              ))
            ) : groupMembers && groupMembers.length > 0 ? (
              groupMembers.slice(0, 5).map((member, index) => (
                <li
                  key={member.id}
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => setSelectedMember({ ...member, userId: member.id })}
                >
                  <img
                    src={memberPhotoUrls[member.id] || '/default-avatar.png'}
                    alt={member.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex items-center">
                    {renderMedal(index)}
                    <span className="ml-2 text-gray-700">
                      {member.firstname} {member.lastName} (@{member.username})
                    </span>
                    {member.id === groupIdToUse.adminId && (
                      <span className="ml-2 text-sm text-indigo-600">(Admin)</span>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No top members found.</li>
            )}
          </ul>
          <button
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={() => setShowAllMembers(true)}
          >
            View All Members
          </button>
        </>
      ) : (
        <>
          <div className="flex space-x-4 mb-4">
            <div>
              <label className="mr-2 text-gray-700">Sort By:</label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="p-2 border rounded-lg"
              >
                <option value="publicationCount">Publications</option>
                <option value="commentCount">Comments</option>
                <option value="reactionCount">Reactions</option>
                <option value="joinDate">Join Date</option>
              </select>
            </div>
            <div>
              <label className="mr-2 text-gray-700">Direction:</label>
              <select
                value={direction}
                onChange={handleDirectionChange}
                className="p-2 border rounded-lg"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
          <ul className="space-y-3">
            {isAllLoading ? (
              <LoadingSpinner />
            ) : allMembers && allMembers.content && allMembers.content.length > 0 ? (
              allMembers.content.map((member, index) => (
                <li
                  key={member.userId}
                  className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
                >
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                  >
                    <img
                      src={memberPhotoUrls[member.userId] || '/default-avatar.png'}
                      alt={member.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex items-center ml-3">
                      {renderMedal(index)}
                      <span className="ml-2 text-gray-700">
                        {member.firstName} {member.lastName} (@{member.username})
                      </span>
                      {member.userId === groupIdToUse.adminId && (
                        <span className="ml-2 text-sm text-indigo-600">(Admin)</span>
                      )}
                    </div>
                  </div>
                  {isAdmin && member.userId !== groupIdToUse.adminId && (
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={member.canPost}
                          onChange={(e) =>
                            handleUpdateSettings(member.username, e.target.checked, member.canComment)
                          }
                          className="mr-1"
                        />
                        Post
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={member.canComment}
                          onChange={(e) =>
                            handleUpdateSettings(member.username, member.canPost, e.target.checked)
                          }
                          className="mr-1"
                        />
                        Comment
                      </label>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        onClick={() => handleRemoveMember(member.username)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </li>
              ))
            ) : groupMembers && groupMembers.length > 0 ? (
              groupMembers.map((member, index) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
                >
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => setSelectedMember({ ...member, userId: member.id })}
                  >
                    <img
                      src={memberPhotoUrls[member.id] || '/default-avatar.png'}
                      alt={member.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex items-center ml-3">
                      {renderMedal(index)}
                      <span className="ml-2 text-gray-700">
                        {member.firstname} {member.lastName} (@{member.username})
                      </span>
                      {member.id === groupIdToUse.adminId && (
                        <span className="ml-2 text-sm text-indigo-600">(Admin)</span>
                      )}
                    </div>
                  </div>
                  {isAdmin && member.id !== groupIdToUse.adminId && (
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={true} // Default to true if not available
                          onChange={(e) =>
                            handleUpdateSettings(member.username, e.target.checked, true)
                          }
                          className="mr-1"
                        />
                        Post
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={true} // Default to true if not available
                          onChange={(e) =>
                            handleUpdateSettings(member.username, true, e.target.checked)
                          }
                          className="mr-1"
                        />
                        Comment
                      </label>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        onClick={() => handleRemoveMember(member.username)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="text-gray-500">No members found.</li>
            )}
          </ul>
          <div className="mt-4 flex justify-between">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              onClick={() => setShowAllMembers(false)}
            >
              Back to Top 5
            </button>
            <div>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Previous
              </button>
              <button
                className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={allMembers?.last}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {isAdmin && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Membership Requests</h3>
          <div className="space-y-3">
            {!requests || requests.length === 0 ? (
              <p className="text-gray-500">No pending requests.</p>
            ) : (
              requests
                .filter((request) => request.status === 'PENDING')
                .map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={requestPhotoUrls[request.userId] || '/default-avatar.png'}
                        alt={request.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-gray-700">{request.username}</span>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleRequestAction(request.id, 'ACCEPTED')}
                        disabled={isHandling}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.id, 'REJECTED')}
                        disabled={isHandling}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {selectedMember && (
        <MemberStatsModal
          groupId={groupIdToUse}
          username={selectedMember.username}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default GroupMemberList;