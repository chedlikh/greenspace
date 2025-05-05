import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
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
import UserAvatar from './UserAvatar';

const reactionTypes = [
  { type: 'LIKE', emoji: '👍', label: 'Like' },
  { type: 'LOVE', emoji: '❤️', label: 'Love' },
  { type: 'HAHA', emoji: '😂', label: 'Haha' },
  { type: 'WOW', emoji: '😮', label: 'Wow' },
  { type: 'SAD', emoji: '😢', label: 'Sad' },
  { type: 'ANGRY', emoji: '😣', label: 'Angry' },
];

const ReactionButtons = ({ publicationId, commentId, isComment = false }) => {
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

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowReactions(!showReactions)}
          onMouseEnter={handleMouseEnterButton}
          onMouseLeave={handleMouseLeaveButton}
          className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-all ${
            userReaction ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          <span className="text-lg">
            {userReaction 
              ? reactionTypes.find((r) => r.type === userReaction.reactionType)?.emoji
              : reactionTypes.find((r) => r.type === defaultReaction)?.emoji}
          </span>
          {totalReactions > 0 && <span className="text-sm font-medium">{totalReactions}</span>}
        </button>
        {totalReactions > 0 && (
          <button
            onClick={toggleUserList}
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Reactions
          </button>
        )}
      </div>

      {showReactions && (
        <div
          className="absolute bottom-full left-0 mb-3 bg-white rounded-full shadow-xl p-2 flex space-x-2 z-50 animate-fadeIn"
          onMouseEnter={handleMouseEnterReactions}
          onMouseLeave={handleMouseLeaveReactions}
        >
          {reactionTypes.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              className={`text-2xl hover:scale-125 transform transition-transform duration-200 ${
                userReaction?.reactionType === reaction.type ? 'scale-125' : ''
              }`}
              title={reaction.label}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}

      {showUserList && (
        <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-xl shadow-xl py-3 z-50 border border-gray-200 max-h-96 overflow-y-auto animate-fadeIn">
          {isLoadingReactionList ? (
            <p className="px-4 py-2 text-sm text-gray-500">Loading...</p>
          ) : reactionList && reactionList.length > 0 ? (
            reactionList.map((reaction) => (
              <div
                key={reaction.id}
                className="flex items-center px-4 py-3 hover:bg-indigo-50 transition-colors"
              >
                <UserAvatar user={reaction.user} size="sm" />
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {reaction.user.firstname} {reaction.user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {reactionTypes.find((r) => r.type === reaction.reactionType)?.emoji}{' '}
                    {reaction.reactionType}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="px-4 py-2 text-sm text-gray-500">No reactions yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReactionButtons;