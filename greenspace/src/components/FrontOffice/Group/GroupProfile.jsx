import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGroupById, useGroupPublications, fetchImageWithToken, useAuthToken, useUploadGroupProfilePhoto, useUploadGroupCoverPhoto } from '../../../services/group';
import CreatePublicationForm from '../Publication/CreatePublicationForm';
import PublicationCard from '../Publication/PublicationCard';
import GroupMembershipRequest from './GroupMembershipRequest';
import GroupMemberList from './GroupMemberList';
import Pagination from '../Publication/Pagination';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Camera } from 'feather-icons-react';

const GroupProfile = () => {
  const { id } = useParams();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const token = useAuthToken();
  const { data: group, isLoading: isGroupLoading, isError: isGroupError, error: groupError } = useGroupById(id);
  const currentUser = useSelector((state) => state.auth.user);
  const isMember = group?.members?.some(member => member.id === currentUser?.id);
  const isPublic = group?.privacyLevel === 'PUBLIC';
  const { data: publications, isLoading: isPublicationsLoading, isError: isPublicationsError, error: publicationsError } = useGroupPublications(id, page, size, isMember, isPublic);
  const [groupPhotoUrls, setGroupPhotoUrls] = useState({});
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const { mutate: uploadProfilePhoto, isLoading: isUploadingProfile } = useUploadGroupProfilePhoto();
  const { mutate: uploadCoverPhoto, isLoading: isUploadingCover } = useUploadGroupCoverPhoto();

  useEffect(() => {
    if (!group || !token) return;

    const loadImages = async () => {
      const newPhotoUrls = {};
      if (group.coverPhotoUrl) {
        newPhotoUrls.cover = await fetchImageWithToken(group.coverPhotoUrl, token);
      }
      if (group.profilePhotoUrl) {
        newPhotoUrls.profile = await fetchImageWithToken(group.profilePhotoUrl, token);
      }
      setGroupPhotoUrls(newPhotoUrls);
    };

    loadImages();

    return () => {
      Object.values(groupPhotoUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [group, token]);

  const handleProfileUpload = (file) => {
    if (file) {
      setProfileFile(file);
      uploadProfilePhoto({ groupId: id, file }, {
        onSuccess: () => {
          toast.success('Profile photo uploaded successfully!');
          setProfileFile(null);
          if (profileInputRef.current) profileInputRef.current.value = '';
        },
        onError: (error) => {
          toast.error(`Failed to upload profile photo: ${error.message}`);
          setProfileFile(null);
          if (profileInputRef.current) profileInputRef.current.value = '';
        },
      });
    }
  };

  const handleCoverUpload = (file) => {
    if (file) {
      setCoverFile(file);
      uploadCoverPhoto({ groupId: id, file }, {
        onSuccess: () => {
          toast.success('Cover photo uploaded successfully!');
          setCoverFile(null);
          if (coverInputRef.current) coverInputRef.current.value = '';
        },
        onError: (error) => {
          toast.error(`Failed to upload cover photo: ${error.message}`);
          setCoverFile(null);
          if (coverInputRef.current) coverInputRef.current.value = '';
        },
      });
    }
  };

  if (isGroupLoading) return <LoadingSpinner />;
  if (isGroupError) return <ErrorMessage message={groupError.message} />;
  if (!group) return <div className="text-grey-500 text-center py-8 font-xssss">No group data available.</div>;

  const isAdmin = currentUser?.id === group?.adminId;

  return (
    <div className="main-content right-chat-active mt-20">
      <div className="middle-sidebar-bottom">
        <div className="middle-sidebar-left">
          <div className="row">
            {/* Sidebar */}
            <div className="col-xl-4 col-xxl-3 col-lg-4 pe-0">
              <div className="card w-100 shadow-xss rounded-xxl overflow-hidden border-0 mb-3 mt-3 pb-3">
                {/* Cover Image */}
                <div
                  className="card-body position-relative h150 bg-image-cover bg-image-center"
                  style={{ backgroundImage: `url(${groupPhotoUrls.cover || '/default-cover.png'})` }}
                >
                  {isAdmin && (
                    <label className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 cursor-pointer shadow-md transition-all duration-300 hover:shadow-lg">
                      <input
                        type="file"
                        id="coverPhoto"
                        ref={coverInputRef}
                        accept="image/*"
                        onChange={(e) => handleCoverUpload(e.target.files[0])}
                        disabled={isUploadingCover}
                        className="hidden"
                      />
                      {isUploadingCover ? (
                        <div className="w-5 h-5 border-2 border-grey-900 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera size={20} className="text-grey-900" />
                      )}
                    </label>
                  )}
                </div>
                {/* Profile Image and Name */}
                <div className="card-body d-block pt-4 text-center">
                  <figure className="avatar mt--6 position-relative w75 z-index-1 w100 ms-auto me-auto">
                    <img
                      src={groupPhotoUrls.profile || '/default-group.png'}
                      alt={`${group.name} profile`}
                      className="p-1 bg-white rounded-circle w-100 shadow-sm"style={{ width: 88, height: 88 }}
                    />
                    {isAdmin && (
                      <div className="absolute -bottom-2 -right-2 group">
                        <label className="bg-white rounded-full p-1 cursor-pointer shadow-md transition-all duration-300 hover:shadow-lg">
                          <input
                            type="file"
                            id="profilePhoto"
                            ref={profileInputRef}
                            accept="image/*"
                            onChange={(e) => handleProfileUpload(e.target.files[0])}
                            disabled={isUploadingProfile}
                            className="hidden"
                          />
                          {isUploadingProfile ? (
                            <div className="w-4 h-4 border-2 border-grey-900 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Camera size={16} className="text-grey-900" />
                          )}
                        </label>
                        <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded-md">
                          Change Profile Photo
                        </span>
                      </div>
                    )}
                  </figure>
                  <h4 className="font-xs ls-1 fw-700 text-grey-900">
                    {group.name}
                    <span className="d-block font-xssss fw-500 mt-1 lh-3 text-grey-500">
                      @{group.name.toLowerCase().replace(/\s+/g, '')}
                    </span>
                  </h4>
                </div>
                {/* Group Stats */}
                <div className="card-body d-flex align-items-center ps-4 pe-4 pt-0">
                  <h4 className="font-xsssss text-center text-grey-500 fw-600 ms-2 me-2">
                    <b className="text-grey-900 mb-1 font-xss fw-700 d-inline-block ls-3 text-dark">
                      {group.posts?.length || 0}
                    </b>{' '}
                    Posts
                  </h4>
                  <h4 className="font-xsssss text-center text-grey-500 fw-600 ms-2 me-2">
                    <b className="text-grey-900 mb-1 font-xss fw-700 d-inline-block ls-3 text-dark">
                      {group.members?.length || 0}
                    </b>{' '}
                    Members
                  </h4>
                </div>
                {/* Join Group and Actions */}
                <div className="card-body d-flex align-items-center justify-content-center ps-4 pe-4 pt-0">
                  {!isMember && (
                    <GroupMembershipRequest
                      groupId={id}
                      isMember={isMember}
                      isAdmin={isAdmin}
                      className="bg-success p-3 z-index-1 rounded-3 text-white font-xsssss text-uppercase fw-700 ls-3"
                      buttonText="Joindre Groupe"
                    />
                  )}
                  <a
                    href="#"
                    className="bg-greylight btn-round-lg ms-2 rounded-3 text-grey-700"
                    onClick={() => toast.info('Message feature not implemented')}
                  >
                    <i className="feather-mail font-md"></i>
                  </a>
                  <a
                    href="#"
                    className="bg-greylight theme-white-bg btn-round-lg ms-2 rounded-3 text-grey-700"
                    onClick={() => toast.info('More options not implemented')}
                  >
                    <i className="ti-more font-md"></i>
                  </a>
                </div>
              </div>
              {/* About Section */}
              <div className="card w-100 shadow-xss rounded-xxl border-0 mb-3">
                <div className="card-body d-block p-4">
                  <h4 className="fw-700 mb-3 font-xsss text-grey-900">About</h4>
                  <p className="fw-500 text-grey-500 lh-24 font-xssss mb-0">
                    {group.description || 'No description provided.'}
                  </p>
                </div>
                <div className="card-body border-top-xs d-flex">
                  <i className="feather-lock text-grey-500 me-3 font-lg"></i>
                  <h4 className="fw-700 text-grey-900 font-xssss mt-0">
                    {group.privacyLevel.charAt(0) + group.privacyLevel.slice(1).toLowerCase().replace('_', ' ')}
                    <span className="d-block font-xssss fw-500 mt-1 lh-3 text-grey-500">
                      {group.privacyLevel === 'PUBLIC' ? 'Anyone can join' : 'Requires approval to join'}
                    </span>
                  </h4>
                </div>
                <div className="card-body d-flex pt-0">
                  <i className="feather-user text-grey-500 me-3 font-lg"></i>
                  <h4 className="fw-700 text-grey-900 font-xssss mt-1">
                    Admin:{' '}
                    <Link
                      to={`/profile/${group.adminUsername}`}
                      className="text-primary hover:underline"
                    >
                      {group.adminUsername}
                    </Link>
                  </h4>
                </div>
              </div>
              {/* Member List */}
              <GroupMemberList groupId={id} isAdmin={isAdmin} groupMembers={group.members} />
            </div>
            {/* Main Content Area */}
            <div className="col-xl-8 col-xxl-9 col-lg-8">
              {/* Create Publication Form */}
              {isMember && (
                <div className="card w-100 shadow-xss rounded-xxl border-0 ps-4 pt-4 pe-4 pb-3 mb-3 mt-3">
                  <CreatePublicationForm
                    groupId={id}
                    onSuccess={() => toast.success('Publication posted to group!')}
                  />
                </div>
              )}
              {/* Posts Section */}
              <div className="card w-100 shadow-xss rounded-xxl border-0 p-4 mb-3">
                <h3 className="fw-700 text-grey-900 font-xsss">Group Posts</h3>
                {(!isMember && !isPublic) || publications?.restricted ? (
                  <p className="text-grey-500 text-center py-8 font-xssss">
                    Join the group to view posts.
                  </p>
                ) : isPublicationsLoading ? (
                  <LoadingSpinner />
                ) : isPublicationsError ? (
                  <ErrorMessage message={publicationsError.message} />
                ) : publications?.content?.length === 0 ? (
                  <p className="text-grey-500 text-center py-8 font-xssss">
                    No posts yet. Be the first to post!
                  </p>
                ) : (
                  <>
                    <div className="space-y-6">
                      {publications.content.map((publication) => (
                        <PublicationCard
                          key={publication.id}
                          publication={publication}
                          group={group}
                        />
                      ))}
                    </div>
                    <Pagination
                      currentPage={page}
                      totalPages={publications?.totalPages || 0}
                      onPageChange={setPage}
                      pageSize={size}
                      onPageSizeChange={setSize}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupProfile;