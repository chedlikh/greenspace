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
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { toast } from 'react-toastify';
import { useRemoveGroupMember, useUpdateMemberSettings, useMemberStats } from '../../../services/group';

// Custom component for profile photos with proper URL handling
const ProfilePhoto = ({ photoUrl, username, className = "w75 h75 rounded-circle object-cover border-2 border-grey-200" }) => {
  return (
    <img
      src={photoUrl || '/default-avatar.png'}
      alt={username || "User"}
      className={className}
      onError={(e) => { e.target.src = '/default-avatar.png'; }}
    />
  );
};

const GroupMemberList = ({ groupId, isAdmin, groupMembers }) => {
  const { id } = useParams();
  const groupIdToUse = groupId || id;
  const token = useAuthToken();
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [sortBy, setSortBy] = useState('publicationCount');
  const [direction, setDirection] = useState('desc');
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

  // Fetch member photos
  useEffect(() => {
    if (!token) return;

    const fetchMemberPhotos = async () => {
      const newPhotoUrls = {};
      const members = allMembers?.content?.length > 0 ? allMembers.content : groupMembers || [];
      
      for (const member of members) {
        const userId = member.userId || member.id;
        if (member.photoProfile && userId) {
          try {
            newPhotoUrls[userId] = await fetchImageWithToken(member.photoProfile, token);
          } catch (error) {
            console.error(`Error fetching image for user ${userId}:`, error);
          }
        }
      }
      setMemberPhotoUrls(prev => ({ ...prev, ...newPhotoUrls }));
    };

    fetchMemberPhotos();

    return () => {
      // Clean up blob URLs
      Object.values(memberPhotoUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [allMembers, groupMembers, token]);

  // Fetch request photos
  useEffect(() => {
    if (!requests || !token || !isAdmin) return;

    const fetchRequestPhotos = async () => {
      const newPhotoUrls = {};
      for (const request of requests) {
        if (request.photoProfile && request.userId) {
          try {
            newPhotoUrls[request.userId] = await fetchImageWithToken(request.photoProfile, token);
          } catch (error) {
            console.error(`Error fetching image for request ${request.userId}:`, error);
          }
        }
      }
      setRequestPhotoUrls(prev => ({ ...prev, ...newPhotoUrls }));
    };

    fetchRequestPhotos();

    return () => {
      // Clean up blob URLs
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
      if (index === 0) return <span className="font-xsss text-grey-900">🥇</span>;
      if (index === 1) return <span className="font-xsss text-grey-900">🥈</span>;
      if (index === 2) return <span className="font-xsss text-grey-900">🥉</span>;
    }
    return null;
  };

  if (isTop5Loading || isRequestsLoading) return <LoadingSpinner />;
  if (isTop5Error) return <ErrorMessage message={top5Error.message} />;
  if (isAllError && showMembersModal) return <ErrorMessage message={allError.message} />;
  if (isRequestsError && isAdmin) return <ErrorMessage message={requestsError.message} />;

  return (
    <div className="card w-100 shadow-xss rounded-xxl border-0 p-4 mb-3">
      <h2 className="fw-700 text-grey-900 font-xsss mb-3">
        Group Members ({allMembers?.totalElements || top5Members?.length || groupMembers?.length || 0})
      </h2>

      <button
        className="p-2 bg-primary text-white font-xssss fw-600 rounded-3 mb-3 w-100 text-center"
        onClick={() => setShowMembersModal(true)}
      >
        View All Members
      </button>

      {/* Top 5 Members List */}
      <ul className="list-unstyled">
        {top5Members && top5Members.length > 0 ? (
          top5Members.map((member, index) => (
            <li
              key={member.userId}
              className="d-flex align-items-center p-2 rounded-3 hover-bg-greylight"
            >
              <ProfilePhoto 
                photoUrl={memberPhotoUrls[member.userId]} 
                username={member.username} 
              />
              <div className="ms-3 d-flex align-items-center">
                {renderMedal(index)}
                <span className="font-xssss fw-500 text-grey-900">
                  {member.firstName} {member.lastName} (@{member.username})
                </span>
                {member.userId === groupMembers?.find(m => m.isAdmin)?.id && (
                  <span className="ms-2 font-xssss text-primary fw-600">(Admin)</span>
                )}
              </div>
            </li>
          ))
        ) : groupMembers && groupMembers.length > 0 ? (
          groupMembers.slice(0, 5).map((member, index) => (
            <li
              key={member.id}
              className="d-flex align-items-center p-2 rounded-3 hover-bg-greylight"
            >
              <ProfilePhoto 
                photoUrl={memberPhotoUrls[member.id]} 
                username={member.username} 
              />
              <div className="ms-3 d-flex align-items-center">
                {renderMedal(index)}
                <span className="font-xssss fw-500 text-grey-900">
                  {member.firstName || member.firstname} {member.lastName} (@{member.username})
                </span>
                {member.isAdmin && (
                  <span className="ms-2 font-xssss text-primary fw-600">(Admin)</span>
                )}
              </div>
            </li>
          ))
        ) : (
          <li className="text-grey-500 font-xssss text-center py-3">No top members found.</li>
        )}
      </ul>

      {/* All Members Modal */}
      {
        showMembersModal && (
          <div className="modal-popup-wrap fixed inset-0 bg-black bg-opacity-50 d-flex align-items-center justify-content-center z-1000 mt-16">
            <div className="modal-popup-body bg-white p-4 rounded-xxl shadow-xss w-100" style={{ maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="card-body p-0 d-flex align-items-center border-bottom-xs mb-3">
                <h3 className="fw-700 text-grey-900 font-xss mb-0">All Members</h3>
                <a href="#" className="ms-auto font-xssss text-grey-500" onClick={() => setShowMembersModal(false)}>
                  <i className="ti-close font-xss"></i>
                </a>
              </div>

              <div className="d-flex mb-3 flex-column flex-md-row">
                <div className="flex-1 me-md-2">
                  <label className="font-xssss fw-600 text-grey-900 mb-1">Sort By:</label>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-100 p-2 border border-grey-200 rounded-3 font-xssss text-grey-900 focus-border-primary"
                  >
                    <option value="publicationCount">Publications</option>
                    <option value="commentCount">Comments</option>
                    <option value="reactionCount">Reactions</option>
                    <option value="joinDate">Join Date</option>
                  </select>
                </div>
                <div className="flex-1 ms-md-2">
                  <label className="font-xssss fw-600 text-grey-900 mb-1">Direction:</label>
                  <select
                    value={direction}
                    onChange={handleDirectionChange}
                    className="w-100 p-2 border border-grey-200 rounded-3 font-xssss text-grey-900 focus-border-primary"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              {isAllLoading ? (
                <LoadingSpinner />
              ) : allMembers && allMembers.content && allMembers.content.length > 0 ? (
                <div className="space-y-3">
                  {allMembers.content.map((member, index) => (
                    <MemberCard
                      key={member.userId}
                      member={member}
                      index={index}
                      groupId={groupIdToUse}
                      isAdmin={isAdmin}
                      photoUrl={memberPhotoUrls[member.userId]}
                      renderMedal={renderMedal}
                      handleRemoveMember={handleRemoveMember}
                      handleUpdateSettings={handleUpdateSettings}
                      isAdminMember={member.userId === groupMembers?.find(m => m.isAdmin)?.id}
                    />
                  ))}
                </div>
              ) : groupMembers && groupMembers.length > 0 ? (
                <div className="space-y-3">
                  {groupMembers.map((member, index) => (
                    <MemberCard
                      key={member.id}
                      member={{ ...member, userId: member.id, firstName: member.firstName || member.firstname }}
                      index={index}
                      groupId={groupIdToUse}
                      isAdmin={isAdmin}
                      photoUrl={memberPhotoUrls[member.id]}
                      renderMedal={renderMedal}
                      handleRemoveMember={handleRemoveMember}
                      handleUpdateSettings={handleUpdateSettings}
                      isAdminMember={member.isAdmin}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-grey-500 font-xssss text-center py-3">No members found.</p>
              )}

              <div className="d-flex justify-content-between mt-3">
                <button
                  className="p-2 bg-primary text-white font-xssss fw-600 rounded-3 disabled-bg-greylight disabled-text-grey-500"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Previous
                </button>
                <button
                  className="p-2 bg-primary text-white font-xssss fw-600 rounded-3 disabled-bg-greylight disabled-text-grey-500"
                  onClick={() => setPage(page + 1)}
                  disabled={allMembers?.last}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Membership Requests Section */}
      {isAdmin && (
        <div className="mt-4">
          <h3 className="fw-700 text-grey-900 font-xsss mb-3">Membership Requests</h3>
          <div className="space-y-3">
            {!requests || requests.length === 0 ? (
              <p className="text-grey-500 font-xssss text-center py-3">No pending requests.</p>
            ) : (
              requests
                .filter((request) => request.status === 'PENDING')
                .map((request) => (
                  <div key={request.id} className="d-flex align-items-center justify-content-between p-3 bg-greylight rounded-3 hover-bg-grey-100">
                    <div className="d-flex align-items-center">
                      <ProfilePhoto 
                        photoUrl={requestPhotoUrls[request.userId]} 
                        username={request.username}
                      />
                      <span className="ms-3 font-xssss fw-500 text-grey-900">{request.username}</span>
                    </div>
                    <div className="d-flex ms-2">
                      <button
                        onClick={() => handleRequestAction(request.id, 'ACCEPTED')}
                        disabled={isHandling}
                        className="p-2 bg-success text-white font-xssss fw-600 rounded-3 ms-2 disabled-bg-greylight disabled-text-grey-500"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.id, 'REJECTED')}
                        disabled={isHandling}
                        className="p-2 bg-danger text-white font-xssss fw-600 rounded-3 ms-2 disabled-bg-greylight disabled-text-grey-500"
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
    </div>
  );
};

// Member Card Component
const MemberCard = ({ member, index, groupId, isAdmin, photoUrl, renderMedal, handleRemoveMember, handleUpdateSettings, isAdminMember }) => {
  const { data: stats, isLoading: isStatsLoading } = useMemberStats(groupId, member.username);
  const [canPost, setCanPost] = useState(member.canPost ?? true);
  const [canComment, setCanComment] = useState(member.canComment ?? true);

  const handleToggle = (type, value) => {
    if (type === 'post') {
      setCanPost(value);
      handleUpdateSettings(member.username, value, canComment);
    } else {
      setCanComment(value);
      handleUpdateSettings(member.username, canPost, value);
    }
  };

  return (
    <div className="card-body p-3 bg-greylight rounded-3 hover-bg-grey-100">
      <div className="d-flex align-items-start justify-content-between">
        <div className="d-flex align-items-center">
          <ProfilePhoto 
            photoUrl={photoUrl} 
            username={member.username}
            className="w100 h100 rounded-circle object-cover border-2 border-grey-200"
          />
          <div className="ms-3">
            <div className="d-flex align-items-center">
              {renderMedal(index)}
              <span className="ms-2 font-xsss fw-600 text-grey-900">
                {member.firstName} {member.lastName} (@{member.username})
              </span>
              {isAdminMember && (
                <span className="ms-2 font-xssss text-primary fw-600">(Admin)</span>
              )}
            </div>
            {isStatsLoading ? (
              <LoadingSpinner size="sm" />
            ) : stats && (
              <div className="d-flex flex-column font-xssss text-grey-900 mt-2">
                <div className="d-flex align-items-center">
                  <i className="feather-file-text text-grey-500 me-2 font-md"></i>
                  <span>Publications: <strong>{stats.publicationCount}</strong></span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="feather-message-circle text-grey-500 me-2 font-md"></i>
                  <span>Comments: <strong>{stats.commentCount}</strong></span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="feather-thumbs-up text-grey-500 me-2 font-md"></i>
                  <span>Reactions: <strong>{stats.reactionCount}</strong></span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="feather-calendar text-grey-500 me-2 font-md"></i>
                  <span>Join Date: <strong>{new Date(stats.joinDate).toLocaleDateString()}</strong></span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="feather-message-square text-grey-500 me-2 font-md"></i>
                  <span>Last Comment: <strong>{stats.lastCommentDate ? new Date(stats.lastCommentDate).toLocaleDateString() : 'N/A'}</strong></span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="feather-edit text-grey-500 me-2 font-md"></i>
                  <span>Last Publication: <strong>{stats.lastPublicationDate ? new Date(stats.lastPublicationDate).toLocaleDateString() : 'N/A'}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
        {isAdmin && !isAdminMember && (
          <div className="d-flex flex-column align-items-end">
            <div className="d-flex align-items-center mb-2">
              <div className="d-flex align-items-center me-2">
                <span className="font-xssss text-grey-900 me-1">Post</span>
                <label className="relative inline-flex items-center cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={canPost}
                    onChange={() => handleToggle('post', !canPost)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-3 rounded-3 ${canPost ? 'bg-primary' : 'bg-greylight'} transition-colors duration-200`}>
                    <span
                      className={`w-3 h-3 rounded-circle bg-white absolute top-0.001 left-0.5 transition-transform duration-200 ${canPost ? 'translate-x-4' : 'translate-x-0'}`}
                    />
                  </div>
                </label>
              </div>
              <div className="d-flex align-items-center">
                <span className="font-xssss text-grey-900 me-1">Comment</span>
                <label className="relative inline-flex items-center cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={canComment}
                    onChange={() => handleToggle('comment', !canComment)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-3 rounded-3 ${canComment ? 'bg-primary' : 'bg-greylight'} transition-colors duration-200`}>
                    <span
                      className={`w-3 h-3 rounded-circle bg-white absolute top-0.001 left-0.5 transition-transform duration-200 ${canComment ? 'translate-x-4' : 'translate-x-0'}`}
                    />
                  </div>
                </label>
              </div>
            </div>
            <button
              className="p-1 bg-danger text-white font-xssss fw-600 rounded-3 w-75 text-center hover-bg-danger-dark transition-colors duration-200"
              onClick={() => handleRemoveMember(member.username)}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupMemberList;