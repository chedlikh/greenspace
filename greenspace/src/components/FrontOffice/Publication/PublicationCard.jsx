import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import MediaGallery from './MediaGallery';
import ReactionButtons from './ReactionButtons';
import CommentSection from './CommentSection';
import PublicationActions from './PublicationActions';
import UserAvatar from './UserAvatar';
import { usePublicationCommentCount } from '../../../services/comments';

const PublicationCard = ({ publication }) => {
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(publication.content);

  const {
    data: commentCount,
    isLoading: isLoadingCount
  } = usePublicationCommentCount(publication.id);

  // Map mediaItems to media for compatibility with MediaGallery
  const publicationWithMedia = {
    ...publication,
    media: publication.mediaItems || []
  };

  const toggleComments = () => setShowComments(!showComments);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const handleEdit = () => setIsEditing(true);

  const formattedDate = publication.createDate
    ? formatDistanceToNow(new Date(publication.createDate), { addSuffix: true })
    : 'Unknown date';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <UserAvatar user={publication.user} size="md" />
          <div>
            <Link
              to={`/users/${publication.user.username}`}
              className="font-semibold text-gray-800 hover:text-indigo-600"
            >
              {publication.user.firstname}  {publication.user.lastName}
            </Link>
            <div className="text-xs text-gray-500">
              {formattedDate}
              {publication.isEdited && <span className="ml-1">· Edited</span>}
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                }}
                className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p className={`text-gray-800 ${isExpanded ? '' : 'line-clamp-3'}`}>
              {publication.content}
            </p>
            {publication.content.length > 150 && (
              <button
                onClick={toggleExpand}
                className="text-indigo-600 text-sm font-medium mt-1"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {publication.location && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
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

        {publication.feeling && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <span className="mr-1">Feeling {publication.feeling}</span>
            <span role="img" aria-label={publication.feeling}>
              {publication.feeling === 'happy' && '😊'}
              {publication.feeling === 'sad' && '😢'}
              {publication.feeling === 'excited' && '🤩'}
              {publication.feeling === 'angry' && '😠'}
            </span>
          </div>
        )}

        {publicationWithMedia.media?.length > 0 && (
          <div className="mb-4">
            <MediaGallery media={publicationWithMedia.media} />
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
          <div className="flex items-center space-x-2">
            <ReactionButtons publicationId={publication.id} isComment={false} />
            <span>{publication.viewCount || 0} views</span>
          </div>
          <div>
            <span>
              {!isLoadingCount && commentCount !== undefined ? commentCount : (publication.commentCount || 0)} comments
            </span>
          </div>
        </div>

        <div className="border-t border-b border-gray-100 py-2 my-2">
          <PublicationActions
            publicationId={publication.id}
            username={publication.user.username}
            onToggleComments={toggleComments}
            onEdit={handleEdit}
            commentCount={!isLoadingCount ? commentCount : publication.commentCount}
          />
        </div>
      </div>

      {showComments && (
        <div className="bg-gray-50 p-4 border-t border-gray-100">
          <CommentSection publicationId={publication.id} />
        </div>
      )}
    </div>
  );
};

export default PublicationCard;