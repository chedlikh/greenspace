import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGroupById, useGroupPublications, fetchImageWithToken, useAuthToken } from '../../../services/group';
import CreatePublicationForm from '../Publication/CreatePublicationForm';
import PublicationCard from '../Publication/PublicationCard';
import GroupPhotoUpload from './GroupPhotoUpload';
import GroupMembershipRequest from './GroupMembershipRequest';
import GroupMemberList from './GroupMemberList';
import Pagination from '../Publication/Pagination';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

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

    console.log('GroupProfile data:', { group, currentUser, isMember, isPublic, memberCount: group?.members?.length });

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

    if (isGroupLoading) return <LoadingSpinner />;
    if (isGroupError) return <ErrorMessage message={groupError.message} />;
    if (!group) return <div>No group data available.</div>;

    const isAdmin = currentUser?.id === group.adminId;
    console.log('Admin check:', { isAdmin, currentUserId: currentUser?.id, adminId: group.adminId });

    return (
        <div className="space-y-8">
            <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-lg overflow-hidden">
                <img
                    src={groupPhotoUrls.cover || '/default-cover.png'}
                    alt={`${group.name} cover`}
                    className="w-full h-64 object-cover opacity-80"
                />
                <div className="absolute bottom-4 left-4 flex items-end space-x-4">
                    <img
                        src={groupPhotoUrls.profile || '/default-group.png'}
                        alt={`${group.name} profile`}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-white">{group.name}</h1>
                        <p className="text-sm text-white opacity-80">{group.privacyLevel.toLowerCase().replace('_', ' ')}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                        <p className="text-gray-600">{group.description || 'No description provided.'}</p>
                        <div className="mt-4">
                            <p className="text-sm text-gray-500">
                                Admin: <Link to={`/profile/${group.adminUsername}`} className="text-indigo-600 hover:underline">{group.adminUsername}</Link>
                            </p>
                            <p className="text-sm text-gray-500">Members: {group.members?.length || 0}</p>
                        </div>
                    </div>

                    {isAdmin && (
                        <GroupPhotoUpload groupId={id} />
                    )}

                    {!isMember && (
                        <GroupMembershipRequest groupId={id} isMember={isMember} isAdmin={isAdmin} />
                    )}

                    <GroupMemberList groupId={id} isAdmin={isAdmin} groupMembers={group.members} />
                </div>

                <div className="md:w-2/3 space-y-6">
                    {isMember && (
                        <CreatePublicationForm groupId={id} onSuccess={() => toast.success('Publication posted to group!')} />
                    )}

                    <h3 className="text-2xl font-bold text-gray-900">Group Posts</h3>

                    {(!isMember && !isPublic) || publications?.restricted ? (
                        <p className="text-gray-500 text-center">Join the group to view posts.</p>
                    ) : isPublicationsLoading ? (
                        <LoadingSpinner />
                    ) : isPublicationsError ? (
                        <ErrorMessage message={publicationsError.message} />
                    ) : publications?.content?.length === 0 ? (
                        <p className="text-gray-500 text-center">No posts yet. Be the first to post!</p>
                    ) : (
                        <>
                            <div className="space-y-6">
                                {publications.content.map((publication) => (
                                    <PublicationCard key={publication.id} publication={publication} group={group} />
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
    );
};

export default GroupProfile;