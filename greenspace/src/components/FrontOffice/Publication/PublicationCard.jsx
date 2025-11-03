import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import MediaGallery from './MediaGallery';
import ReactionButtons from './ReactionButtons';
import CommentSection from './CommentSection';
import PublicationActions from './PublicationActions';
import { usePublicationCommentCount } from '../../../services/comments';
import { useUpdatePublication } from '../../../services/publications';
import { useSelector } from 'react-redux';

const PublicationCard = ({ publication, group }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";
  const currentUser = useSelector((state) => state.auth.user);
  
  // State management
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(publication?.content || '');
  const [showOptions, setShowOptions] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // API hooks
  const { mutate: updatePublication, isPending: isUpdating } = useUpdatePublication();
  const { data: commentCount, isLoading: isLoadingCount } = usePublicationCommentCount(publication?.id);

  // Enhanced publication data with media
  const publicationWithMedia = {
    ...publication,
    media: publication?.mediaItems || [],
  };

  // User data with fallbacks
  const user = {
    id: publication?.user?.id || null,
    username: publication?.user?.username || 'unknown',
    firstname: publication?.user?.firstname || 'Unknown',
    lastName: publication?.user?.lastName || 'User',
    photoProfile: publication?.user?.photoProfile || null,
  };

  // Check if current user is the post author
  const isOwnPost = currentUser?.id === user.id;

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

  const getFeelingIcon = (feeling) => {
    const icons = {
      happy: '😊',
      excited: '🎉',
      sad: '😢',
      angry: '😠'
    };
    return icons[feeling] || null;
  };

  const getFeelingColors = (feeling) => {
    const colors = {
      happy: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200',
      excited: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-yellow-200',
      sad: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200',
      angry: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200'
    };
    return colors[feeling] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border-0 p-4 mb-4 w-full">
      {/* Header */}
      <div className="flex items-start mb-4">
        {/* Profile Picture */}
        <Link to={`/profile/${user.username}`} className="flex-shrink-0 mr-3">
          <img
            src={user.photoProfile ? `${API_BASE_URL}/images/${user.photoProfile}` : '/default-avatar.png'}
            alt={`${user.firstname} ${user.lastName}`}
            className="w-11 h-11 rounded-full object-cover shadow-sm"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
              e.target.onerror = null;
            }}
          />
        </Link>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            {group && (
              <>
                <Link
                  to={`/profile/${user.username}`}
                  className="font-bold text-gray-900 hover:underline text-sm leading-tight"
                >
                  {user.firstname} {user.lastName}
                </Link>
                <span className="text-gray-500 text-sm">in</span>
                <Link
                  to={`/groups/${group.id}`}
                  className="font-bold text-gray-900 hover:underline text-sm"
                >
                  {group.name}
                </Link>
              </>
            )}
            {!group && (
              <Link
                to={`/profile/${user.username}`}
                className="font-bold text-gray-900 hover:underline text-sm leading-tight"
              >
                {user.firstname} {user.lastName}
              </Link>
            )}
            {publication?.feeling && (
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getFeelingColors(publication.feeling)} ml-2`}>
                <span className="text-xs">{getFeelingIcon(publication.feeling)}</span>
                <span>feeling {publication.feeling}</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 text-xs font-medium text-gray-500 mt-1 leading-tight">
            <time>{formattedDate}</time>
            {publication?.isEdited && (
              <>
                <span>•</span>
                <span>Edited</span>
              </>
            )}
            {publication?.location && (
              <>
                <span>•</span>
                <span className="inline-flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>{publication.location}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Options Menu */}
        {isOwnPost && (
          <div className="relative ml-auto">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"/>
              </svg>
            </button>
            
            {showOptions && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-3xl shadow-lg border border-gray-200 py-4 z-10">
                <div className="px-4 py-2 flex items-center hover:bg-gray-50 cursor-pointer" onClick={handleEdit}>
                  <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Edit Post</h4>
                    <span className="text-xs text-gray-500 block">Make changes to your post</span>
                  </div>
                </div>
                <div className="px-4 py-2 flex items-center hover:bg-gray-50 cursor-pointer">
                  <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Save Post</h4>
                    <span className="text-xs text-gray-500 block">Add this to your saved items</span>
                  </div>
                </div>
                <div className="px-4 py-2 flex items-center hover:bg-gray-50 cursor-pointer">
                  <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-3.122-3.122l4.243-4.243" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Hide Post</h4>
                    <span className="text-xs text-gray-500 block">Don't show me posts like this</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        {isEditing ? (
          <div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              rows={3}
              placeholder="What's on your mind?"
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editedContent)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mr-12">
            <p className={`text-gray-500 font-medium text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
              {publication?.content}
            </p>
            {publication?.content?.length > 150 && (
              <button
                onClick={toggleExpand}
                className="text-blue-600 font-semibold text-sm mt-2 hover:underline"
              >
                {isExpanded ? 'See less' : 'See more'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Media Gallery */}
      {publicationWithMedia?.media?.length > 0 && (
        <div className="mb-4">
          <div className="px-2">
            <MediaGallery media={publicationWithMedia.media} />
          </div>
        </div>
      )}

      {/* Reactions and Actions */}
      <div className="flex items-center justify-between mt-3">
        {/* Reaction Button */}
        <div className="flex items-center">
          <ReactionButtons publicationId={publication?.id} isComment={false} />
        </div>

        {/* Comment Button */}
        <button 
          onClick={toggleComments}
          className="flex items-center text-gray-900 font-semibold text-sm hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5 mr-2 p-1 rounded-full bg-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="hidden sm:inline">
            {!isLoadingCount && commentCount !== undefined
              ? commentCount
              : publication?.commentCount || 0} Comment{(commentCount !== 1) ? 's' : ''}
          </span>
        </button>

        {/* Share Button */}
        <div className="relative">
          <button 
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center text-gray-900 font-semibold text-sm hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2 p-1 rounded-full bg-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="absolute right-0 bottom-full mb-2 w-80 bg-white rounded-3xl shadow-lg border border-gray-200 p-4 z-10">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-gray-900">Share</h4>
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Social Media Icons */}
              <div className="flex justify-between mb-4">
                <button className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center hover:bg-blue-800 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center hover:bg-pink-600 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.404-5.958 1.404-5.958s-.359-.719-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.082.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.74-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
              </div>
              
              {/* Copy Link */}
              <div>
                <h4 className="font-bold text-xs text-gray-500 mb-2">Copy Link</h4>
                <div className="relative">
                  <input
                    type="text"
                    value={`https://yoursite.com/post/${publication?.id}`}
                    readOnly
                    className="w-full bg-gray-100 text-gray-500 text-xs border-0 rounded-xl p-2 pr-8 font-semibold"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <CommentSection publicationId={publication?.id} />
        </div>
      )}
    </div>
  );
};

export default PublicationCard;