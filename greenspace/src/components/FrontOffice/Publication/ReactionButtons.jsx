import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useReactToPublication,
  useReactToComment,
  usePublicationReactionCounts,
  useCommentReactionCounts,
  useUserPublicationReaction,
  useUserCommentReaction,
  usePublicationReactions,
  useCommentReactions,
  useDeleteReaction,
} from '../../../services/reactions';

const reactionTypes = [
  { type: 'LIKE', emoji: '👍', label: 'Like' },
  { type: 'LOVE', emoji: '❤️', label: 'Love' },
  { type: 'HAHA', emoji: '😂', label: 'Haha' },
  { type: 'WOW', emoji: '😮', label: 'Wow' },
  { type: 'SAD', emoji: '😢', label: 'Sad' },
  { type: 'ANGRY', emoji: '😣', label: 'Angry' },
];

const ReactionButtons = ({ publicationId, commentId, isComment = false }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";
  const { data: publicationReactionCounts } = usePublicationReactionCounts(publicationId);
  const { data: commentReactionCounts } = useCommentReactionCounts(commentId);
  const { data: userPublicationReaction } = useUserPublicationReaction(publicationId);
  const { data: userCommentReaction } = useUserCommentReaction(commentId);
  const { data: reactionList, isLoading: isLoadingReactionList } = isComment
    ? useCommentReactions(commentId)
    : usePublicationReactions(publicationId);
  const { mutate: reactToPublication } = useReactToPublication();
  const { mutate: reactToComment } = useReactToComment();
  const { mutate: deleteReaction } = useDeleteReaction();
  const [showReactions, setShowReactions] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const hideTimeoutRef = useRef(null);

  if (!user) return null;

  const reactionCounts = isComment ? commentReactionCounts : publicationReactionCounts;
  const userReaction = isComment ? userCommentReaction : userPublicationReaction;

  // Get the most popular reaction for the default display
  const getDominantReaction = () => {
    if (!reactionCounts?.counts) return null;
    return Object.entries(reactionCounts.counts).reduce(
      (max, [type, count]) => (count > max.count ? { type, count } : max),
      { type: 'LIKE', count: 0 }
    ).type;
  };

  const dominantReaction = getDominantReaction();
  const defaultReaction = dominantReaction || 'LIKE';

  const handleReaction = (reactionType) => {
    if (userReaction) {
      if (userReaction.reactionType === reactionType) {
        deleteReaction(
          {
            id: userReaction.id,
            publicationId: isComment ? null : publicationId,
            commentId: isComment ? commentId : null,
          },
          {
            onSuccess: () => {
              toast.success('Reaction removed');
            },
            onError: (error) => {
              toast.error(`Failed to remove reaction: ${error.message}`);
            },
          }
        );
      } else {
        const mutate = isComment ? reactToComment : reactToPublication;
        mutate(
          { [isComment ? 'commentId' : 'publicationId']: isComment ? commentId : publicationId, reactionType },
          {
            onSuccess: () => {
              toast.success('Reaction updated');
            },
            onError: (error) => {
              toast.error(`Failed to update reaction: ${error.message}`);
            },
          }
        );
      }
    } else {
      const mutate = isComment ? reactToComment : reactToPublication;
      mutate(
        { [isComment ? 'commentId' : 'publicationId']: isComment ? commentId : publicationId, reactionType },
        {
          onSuccess: () => {
            toast.success('Reaction added');
          },
          onError: (error) => {
            toast.error(`Failed to add reaction: ${error.message}`);
          },
        }
      );
    }
    setShowReactions(false);
  };

  const totalReactions = reactionCounts
    ? Object.values(reactionCounts.counts).reduce((sum, count) => sum + count, 0)
    : 0;

  const handleMouseEnterButton = () => {
    clearTimeout(hideTimeoutRef.current);
    setShowReactions(true);
  };

  const handleMouseLeaveButton = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 300);
  };

  const handleMouseEnterReactions = () => {
    clearTimeout(hideTimeoutRef.current);
    setShowReactions(true);
  };

  const handleMouseLeaveReactions = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 300);
  };

  const toggleUserList = () => {
    setShowUserList(!showUserList);
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowReactions(!showReactions)}
          onMouseEnter={handleMouseEnterButton}
          onMouseLeave={handleMouseLeaveButton}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-3xl border-0 bg-white shadow-sm transition-all ${
            userReaction 
              ? 'text-indigo-700' 
              : 'text-gray-700 hover:text-indigo-600 hover:shadow-md'
          }`}
        >
          {/* Show actual reaction distribution */}
          <div className="flex items-center space-x-1">
            {reactionCounts?.counts && Object.entries(reactionCounts.counts)
              .filter(([type, count]) => count > 0)
              .sort(([, a], [, b]) => b - a) // Sort by count descending
              .slice(0, 3) // Show max 3 different reactions
              .map(([type, count]) => {
                const reaction = reactionTypes.find(r => r.type === type);
                return (
                  <div key={type} className="flex items-center">
                    <span className={`text-lg drop-shadow-sm ${userReaction?.reactionType === type ? 'scale-110' : ''}`}>
                      {reaction?.emoji}
                    </span>
                    {count > 1 && (
                      <span className="text-xs font-medium text-gray-600 ml-0.5">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            
            {/* Fallback when no reactions */}
            {(!reactionCounts?.counts || Object.values(reactionCounts.counts).every(count => count === 0)) && (
              <span className="text-lg drop-shadow-sm">
                {reactionTypes.find((r) => r.type === defaultReaction)?.emoji}
              </span>
            )}
          </div>
          
          {totalReactions > 0 && (
            <span className="text-sm font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
              {totalReactions}
            </span>
          )}
        </button>
        
        {totalReactions > 0 && (
          <button
            onClick={toggleUserList}
            className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors px-4 py-2 rounded-3xl bg-white shadow-sm hover:shadow-md"
          >
            View Reactions
          </button>
        )}
      </div>

      {showReactions && (
        <div
          className="absolute bottom-full left-0 mb-4 bg-white rounded-3xl shadow-sm border-0 p-3 flex space-x-3 z-50 animate-fadeIn"
          onMouseEnter={handleMouseEnterReactions}
          onMouseLeave={handleMouseLeaveReactions}
        >
          {reactionTypes.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              className={`text-2xl hover:scale-125 transform transition-all duration-200 p-2 rounded-3xl hover:bg-gray-100/50 drop-shadow-sm ${
                userReaction?.reactionType === reaction.type 
                  ? 'scale-125 bg-indigo-100/60' 
                  : 'hover:bg-white/60'
              }`}
              title={reaction.label}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}

      {showUserList && (
        <div className="absolute top-full left-0 mt-4 w-80 bg-white rounded-3xl shadow-sm border-0 py-3 z-50 max-h-96 overflow-y-auto animate-fadeIn">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Reactions</h3>
          </div>
          
          {isLoadingReactionList ? (
            <div className="px-4 py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-gray-500 mt-2">Loading reactions...</p>
            </div>
          ) : reactionList && reactionList.length > 0 ? (
            <div className="py-2">
              {reactionList.map((reaction) => (
                <button
                  key={reaction.id}
                  onClick={() => handleUserClick(reaction.user.username)}
                  className="flex items-center px-4 py-3 hover:bg-indigo-50/70 transition-colors w-full text-left group"
                >
                  <div className="relative">
                    <img
                      src={reaction.user?.photoProfile ? `${API_BASE_URL}/images/${reaction.user.photoProfile}` : '/default-avatar.png'}
                      alt={reaction.user ? `${reaction.user.firstname || ''} ${reaction.user.lastName || ''}`.trim() || 'Anonymous User' : 'Anonymous User'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                        e.target.onerror = null;
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-gray-200">
                      <span className="text-xs">
                        {reactionTypes.find((r) => r.type === reaction.reactionType)?.emoji}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {reaction.user ? `${reaction.user.firstname || ''} ${reaction.user.lastName || ''}`.trim() || 'Anonymous User' : 'Anonymous User'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {reaction.reactionType.toLowerCase()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <div className="text-4xl mb-2">😊</div>
              <p className="text-sm text-gray-500">No reactions yet</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to react!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReactionButtons;