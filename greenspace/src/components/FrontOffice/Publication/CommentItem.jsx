import { useState, useEffect } from 'react';
import { formatDistanceToNow, isValid } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useReplyToComment, useUpdateComment, useDeleteComment, useCommentReplies } from '../../../services/comments';
import { toast } from 'react-toastify';
import UserAvatar from './UserAvatar';
import ReactionButtons from './ReactionButtons';

const CommentItem = ({ comment, isReply = false }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  
  const { mutate: replyToComment, isLoading: isReplying } = useReplyToComment();
  const { mutate: updateComment, isLoading: isUpdating } = useUpdateComment();
  const { mutate: deleteComment, isLoading: isDeleting } = useDeleteComment();
  const { 
    data: repliesData, 
    isLoading: isLoadingReplies,
    refetch: refetchReplies 
  } = useCommentReplies(comment.id);
  
  const user = useSelector((state) => state.auth.user);
  const isCurrentUser = user?.username === comment.user?.username;

  const fullName = comment.user 
    ? `${comment.user.firstname || ''} ${comment.user.lastName || ''}`.trim() 
    : 'Anonymous User';

  useEffect(() => {
    if (repliesData && showReplies) {
      setReplies(repliesData);
    }
  }, [repliesData, showReplies]);

  const toggleReplies = () => {
    setShowReplies(!showReplies);
    if (!showReplies && !replies.length) {
      refetchReplies();
    }
  };
  
  const toggleReplyForm = () => setShowReplyForm(!showReplyForm);

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleDelete = () => {
    deleteComment(
      {
        id: comment.id,
        publicationId: comment.publicationId,
        parentCommentId: comment.parentCommentId,
      },
      {
        onSuccess: () => {
          toast.success('Comment deleted successfully');
        },
        onError: (error) => {
          toast.error(`Failed to delete comment: ${error.message}`);
        },
      }
    );
    setShowMenu(false);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    replyToComment(
      {
        parentCommentId: comment.id,
        replyData: { content: replyText },
      },
      {
        onSuccess: () => {
          setReplyText('');
          setShowReplyForm(false);
          setShowReplies(true);
          refetchReplies();
          toast.success('Reply posted successfully');
        },
        onError: (error) => {
          toast.error(`Failed to post reply: ${error.message}`);
        },
      }
    );
  };

  const handleSaveEdit = () => {
    if (!editedContent.trim()) {
      toast.error('Comment content cannot be empty');
      return;
    }

    updateComment(
      {
        id: comment.id,
        commentData: { content: editedContent },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success('Comment updated successfully');
        },
        onError: (error) => {
          toast.error(`Failed to update comment: ${error.message}`);
        },
      }
    );
  };

  const replyCount = comment.replyCount || (repliesData?.length || 0);
  const createdDate = comment.createDate ? new Date(comment.createDate) : null;
  const isValidDate = createdDate && isValid(createdDate);
  const formattedDate = isValidDate
    ? formatDistanceToNow(createdDate, { addSuffix: true })
    : 'Unknown time';

  return (
    <div className={`bg-gray-100 rounded-xl p-4 ${isReply ? 'ml-6' : ''} transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-start space-x-3">
        <UserAvatar user={comment.user} size="sm" />
        <div className="flex-1">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{fullName}</h4>
                <p className="text-xs text-gray-500">
                  {formattedDate}
                  {comment.isEdited && <span className="ml-1">· Edited</span>}
                </p>
              </div>
              {isCurrentUser && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-gray-500 hover:text-indigo-600 transition-colors"
                    disabled={isDeleting}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200 animate-fadeIn">
                      <button
                        onClick={handleEdit}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="mt-3">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  rows={3}
                  disabled={isUpdating}
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    disabled={isUpdating || !editedContent.trim()}
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-gray-800">{comment.content}</p>
            )}

            <div className="flex items-center mt-3 space-x-4">
              <ReactionButtons commentId={comment.id} isComment={true} />
              <button
                onClick={toggleReplyForm}
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Reply
              </button>
              {replyCount > 0 && (
                <button
                  onClick={toggleReplies}
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {showReplies ? 'Hide replies' : `Show replies (${replyCount})`}
                </button>
              )}
            </div>
          </div>

          {showReplyForm && (
            <div className="mt-4 ml-6">
              <form onSubmit={handleReplySubmit} className="flex items-start space-x-3">
                <UserAvatar user={user} size="xs" />
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    rows={2}
                    disabled={isReplying}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      type="button"
                      onClick={toggleReplyForm}
                      className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={isReplying}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isReplying || !replyText.trim()}
                      className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {isReplying ? 'Posting...' : 'Reply'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {showReplies && (
            <div className="mt-4 ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
              {isLoadingReplies ? (
                <p className="text-sm text-gray-500">Loading replies...</p>
              ) : replies && replies.length > 0 ? (
                replies.map((reply) => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply} 
                    isReply={true} 
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">No replies yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;