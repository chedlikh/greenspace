import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import MediaGallery from './MediaGallery';
import ReactionButtons from './ReactionButtons';
import CommentSection from './CommentSection';
import PublicationActions from './PublicationActions';
import { usePublicationCommentCount } from '../../../services/comments';
import { useUpdatePublication } from '../../../services/publications';

const PublicationCard = ({ publication, group }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

  // Debug logging: Log the entire publication and group props
  console.log('PublicationCard props:', { publication, group });

  // Debug logging: Log specific publication fields
  console.log('Publication ID:', publication?.id);
  console.log('Publication user object:', publication?.user);
  console.log('Publication user photoProfile:', publication?.user?.photoProfile);
  console.log('Publication targetUser:', publication?.targetUser);
  console.log('Publication group:', publication?.group);

  // State management
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(publication?.content || '');

  // API hooks
  const { mutate: updatePublication, isPending: isUpdating } = useUpdatePublication();
  const { data: commentCount, isLoading: isLoadingCount } = usePublicationCommentCount(publication?.id);

  // Enhanced publication data with media
  const publicationWithMedia = {
    ...publication,
    media: publication?.mediaItems || [],
  };

  // Debug logging: Log publicationWithMedia
  console.log('Publication with media:', publicationWithMedia);

  // User data with fallbacks
  const user = {
    id: publication?.user?.id || null,
    username: publication?.user?.username || 'unknown',
    firstname: publication?.user?.firstname || 'Unknown',
    lastName: publication?.user?.lastName || 'User',
    photoProfile: publication?.user?.photoProfile || null,
  };

  // Debug logging: Log user object
  console.log('Constructed user object:', user);
  console.log('User photo profile:', user.photoProfile);
  console.log('Constructed photo URL:', 
    user.photoProfile ? `${API_BASE_URL}/images/${user.photoProfile}` : '/default-avatar.png');

  // Handler functions
  const toggleComments = () => setShowComments(!showComments);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const handleEdit = () => setIsEditing(true);

  const handleSaveEdit = (newContent) => {
    updatePublication(
      {
        id: publication?.id,
        publicationData: {
          content: newContent,
          privacyLevel: publication?.privacyLevel,
          location: publication?.location,
          feeling: publication?.feeling,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  // Format publication date
  const formattedDate = publication?.createDate
    ? formatDistanceToNow(new Date(publication.createDate), { addSuffix: true })
    : 'Unknown date';

  // Debug logging: Log formatted date
  console.log('Formatted date:', formattedDate);

  // Determine background color based on feeling
  const getBackgroundColor = () => {
    switch (publication?.feeling) {
      case 'happy':
        return 'bg-green-50';
      case 'excited':
        return 'bg-yellow-50';
      case 'sad':
        return 'bg-blue-50';
      case 'angry':
        return 'bg-red-50';
      default:
        return group ? 'bg-indigo-50' : 'bg-white';
    }
  };

  return (
    <div
      className={`${getBackgroundColor()} rounded-2xl shadow-lg overflow-visible transition-all duration-300 hover:shadow-xl mb-8 ${
        group ? 'border-l-4 border-indigo-600' : ''
      }`}
    >
      <div className="p-6">
        {/* User header section */}
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={user.photoProfile ? `${API_BASE_URL}/images/${user.photoProfile}` : '/default-avatar.png'}
            alt={`${user.firstname} ${user.lastName}`}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
              e.target.onerror = null;
            }}
          />
          <div>
            <div className="flex items-center space-x-2">
              {group && (
                <>
                  <Link
                    to={`/groups/${group.id}`}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {group.name}
                  </Link>
                  <span className="text-gray-500">·</span>
                </>
              )}
              <Link
                to={`/profile/${user.username}`}
                className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
              >
                {user.firstname} {user.lastName}
              </Link>
              {publication?.targetUser && (
                <>
                  <span className="text-gray-500">→</span>
                  <Link
                    to={`/users/${publication.targetUser?.username || ''}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors flex items-center"
                  >
                    <img
                      src={
                        publication.targetUser.photoProfile
                          ? `${API_BASE_URL}/images/${publication.targetUser.photoProfile}`
                          : '/default-avatar.png'
                      }
                      alt={`${publication.targetUser.firstname} ${publication.targetUser.lastName}`}
                      className="w-8 h-8 rounded-full object-cover mr-2"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                        e.target.onerror = null;
                      }}
                    />
                    {publication.targetUser?.firstname || 'Unknown'} {publication.targetUser?.lastName || 'User'}
                  </Link>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {formattedDate}
              {publication?.isEdited && <span className="ml-1">· Edited</span>}
              {group && (
                <span className="ml-2">
                  · Posted in{' '}
                  <Link to={`/groups/${group.id}`} className="text-indigo-600 hover:underline">
                    {group.name}
                  </Link>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content section */}
        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              rows={4}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editedContent)}
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p className={`text-gray-800 ${isExpanded ? '' : 'line-clamp-3'}`}>{publication?.content}</p>
            {publication?.content?.length > 150 && (
              <button
                onClick={toggleExpand}
                className="text-indigo-600 text-sm font-medium mt-2 hover:text-indigo-800 transition-colors"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Location and feeling indicators */}
        {publication?.location && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {publication.location}
          </div>
        )}

        {publication?.feeling && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <span className="mr-2">Feeling {publication.feeling}</span>
            <span role="img" aria-label={publication.feeling}>
              {publication.feeling === 'happy' && '😊'}
              {publication.feeling === 'sad' && '😢'}
              {publication.feeling === 'excited' && '🤩'}
              {publication.feeling === 'angry' && '😠'}
            </span>
          </div>
        )}

        {/* Media gallery */}
        {publicationWithMedia?.media?.length > 0 && (
          <div className="mb-4">
            <MediaGallery media={publicationWithMedia.media} />
          </div>
        )}

        {/* Reaction and comment stats */}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-3">
            <ReactionButtons publicationId={publication?.id} isComment={false} />
            <span>{publication?.viewCount || 0} views</span>
          </div>
          <div>
            <span>
              {!isLoadingCount && commentCount !== undefined
                ? commentCount
                : publication?.commentCount || 0}{' '}
              comments
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-gray-200 py-3">
          <PublicationActions
            publicationId={publication?.id}
            username={user.username}
            group={group}
            onToggleComments={toggleComments}
            editedContent={editedContent}
            onSaveEdit={handleSaveEdit}
          />
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="bg-gray-100 p-6 border-t border-gray-200">
          <CommentSection publicationId={publication?.id} />
        </div>
      )}
    </div>
  );
};

export default PublicationCard;