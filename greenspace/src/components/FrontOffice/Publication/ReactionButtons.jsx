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
  useDeleteReaction,
  
} from '../../../services/reactions';
import {useUserReactionForPublication,
  useUserReactionForComment,} from '../../../services/publications'
import UserAvatar from './UserAvatar';

// Define reaction types
const reactionTypes = [
  { type: 'LIKE', emoji: '👍', label: 'Like' },
  { type: 'LOVE', emoji: '❤️', label: 'Love' },
  { type: 'HAHA', emoji: '😂', label: 'Haha' },
  { type: 'WOW', emoji: '😮', label: 'Wow' },
  { type: 'SAD', emoji: '😢', label: 'Sad' },
  { type: 'ANGRY', emoji: '😣', label: 'Angry' },
];

const ReactionButtons = ({ publicationId, commentId, isComment = false }) => {
  const { data: publicationReactionCounts } = usePublicationReactionCounts(publicationId, { enabled: !isComment });
  const { data: commentReactionCounts } = useCommentReactionCounts(commentId, { enabled: isComment });
  const { data: userPublicationReaction } = useUserPublicationReaction(publicationId, { enabled: !isComment });
  const { data: userCommentReaction } = useUserCommentReaction(commentId, { enabled: isComment });
  const { data: userReactionList, isLoading: isLoadingUserReactionList } = isComment
    ? useUserReactionForComment(commentId)
    : useUserReactionForPublication(publicationId);
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
      <div className="flex items-center space-x-1">
        <button
          onClick={() => setShowReactions(!showReactions)}
          onMouseEnter={handleMouseEnterButton}
          onMouseLeave={handleMouseLeaveButton}
          className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
            userReaction ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {userReaction ? (
            <span>{reactionTypes.find((r) => r.type === userReaction.reactionType)?.emoji}</span>
          ) : (
            <span>👍</span>
          )}
          {totalReactions > 0 && <span className="text-sm">{totalReactions}</span>}
        </button>
        {totalReactions > 0 && (
          <button
            onClick={toggleUserList}
            className="text-sm text-gray-600 hover:text-indigo-600"
          >
            View
          </button>
        )}
      </div>

      {showReactions && (
        <div
          className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg p-1 flex space-x-1 z-10"
          onMouseEnter={handleMouseEnterReactions}
          onMouseLeave={handleMouseLeaveReactions}
        >
          {reactionTypes.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              className="text-2xl hover:scale-125 transform transition-transform"
              title={reaction.label}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}

      {showUserList && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-10 border border-gray-200">
          {isLoadingUserReactionList ? (
            <p className="px-4 py-2 text-sm text-gray-500">Loading...</p>
          ) : userReactionList && userReactionList.length > 0 ? (
            userReactionList.map((reaction) => (
              <div
                key={reaction.user.id}
                className="flex items-center px-4 py-2 hover:bg-gray-100"
              >
                <UserAvatar user={reaction.user} size="sm" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
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