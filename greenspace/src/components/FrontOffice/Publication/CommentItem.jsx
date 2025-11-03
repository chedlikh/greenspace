import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow, isValid } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useReplyToComment, useUpdateComment, useDeleteComment, useCommentReplies } from '../../../services/comments';
import { toast } from 'react-toastify';
import ReactionButtons from './ReactionButtons';

const CommentItem = ({ comment, isReply = false }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replies, setReplies] = useState([]);
  
  const replyFormRef = useRef(null);
  
  const { mutate: replyToComment, isLoading: isReplying } = useReplyToComment();
  const { mutate: updateComment, isLoading: isUpdating } = useUpdateComment();
  const { mutate: deleteComment, isLoading: isDeleting } = useDeleteComment();
  const { 
    data: repliesData, 
    isLoading: isLoadingReplies,
    refetch: refetchReplies 
  } = useCommentReplies(comment.id);
  
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const isCurrentUser = user?.username === comment.user?.username;

  const fullName = comment.user 
    ? `${comment.user.firstname || ''} ${comment.user.lastName || ''}`.trim() || comment.user.username || 'Anonymous User'
    : 'Anonymous User';

  useEffect(() => {
    if (repliesData && showReplies) {
      setReplies(repliesData);
    }
  }, [repliesData, showReplies]);

  useEffect(() => {
    if (showReplyForm && showReplies && replyFormRef.current) {
      setTimeout(() => {
        replyFormRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        const textarea = replyFormRef.current.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }, 300);
    }
  }, [showReplyForm, showReplies, replies.length]);

  const toggleReplies = () => {
    setShowReplies(!showReplies);
    if (!showReplies && !replies.length) {
      refetchReplies();
    }
  };
  
  const toggleReplyForm = (replyToUser = null) => {
    setShowReplyForm(true);
    setShowReplies(true);
    
    if (!replies.length && !isLoadingReplies) {
      refetchReplies();
    }
    
    if (replyToUser) {
      setReplyingTo(replyToUser);
      const fullName = replyToUser.firstname && replyToUser.lastName 
        ? `${replyToUser.firstname} ${replyToUser.lastName}`.trim()
        : replyToUser.username || 'user';
      setReplyText(`@${fullName} `);
    } else {
      setReplyingTo(null);
      setReplyText('');
    }
  };

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
        commentDatatip: { content: editedContent },
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

  const renderContentWithMentions = (content, commentUser) => {
    if (!content) return content;

    const mentionRegex = /@([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/g;
    const parts = content.split(mentionRegex).map((part, index) => {
      if (index % 2 === 1) {
        const username = commentUser?.username || 'unknown';
        return (
          <a
            key={index}
            href={`/profile/${username}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/profile/${username}`);
            }}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            @{part}
          </a>
        );
      }
      return part;
    });

    return <span>{parts}</span>;
  };

  const replyCount = comment.replyCount || (repliesData?.length || 0);
  const createdDate = comment.createDate ? new Date(comment.createDate) : null;
  const isValidDate = createdDate && isValid(createdDate);
  const formattedDate = isValidDate
    ? formatDistanceToNow(createdDate, { addSuffix: true })
    : 'Unknown time';
  
  if (!comment) {
    return <p className="text-sm text-gray-500">Comment data unavailable</p>;
  }

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-start space-x-3">
        <img
          src={comment.user?.photoProfile ? `${API_BASE_URL}/images/${comment.user.photoProfile}` : '/default-avatar.png'}
          alt={fullName}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.target.src = '/default-avatar.png';
            e.target.onerror = null;
          }}
        />
        <div className="flex-1">
          <div className="bg-white rounded-3xl p-4 shadow-sm">
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
                    className="text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                    disabled={isDeleting}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-3xl shadow-sm py-2 z-50 border-0 animate-fadeIn">
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
                  className="w-full p-3 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  rows={3}
                  disabled={isUpdating}
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-3xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    disabled={isUpdating || !editedContent.trim()}
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-gray-800">{renderContentWithMentions(comment.content, comment.user)}</p>
            )}

            <div className="flex items-center mt-3 space-x-4">
              <ReactionButtons commentId={comment.id} isComment={true} />
              <button
                onClick={() => toggleReplyForm()}
                className="text-sm text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Reply
              </button>
              {replyCount > 0 && (
                <button
                  onClick={toggleReplies}
                  className="text-sm text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  {showReplies ? 'Hide replies' : `Show replies (${replyCount})`}
                </button>
              )}
            </div>
          </div>

          {showReplies && (
            <div className="mt-4 space-y-3">
              {isLoadingReplies ? (
                <p className="text-sm text-gray-500">Loading replies...</p>
              ) : replies && replies.length > 0 ? (
                replies.map((reply) => (
                  <div key={reply.id} className="flex items-start space-x-3 ml-6">
                    <img
                      src={reply.user?.photoProfile ? `${API_BASE_URL}/images/${reply.user.photoProfile}` : '/default-avatar.png'}
                      alt={reply.user ? `${reply.user.firstname || ''} ${reply.user.lastName || ''}`.trim() : 'Anonymous User'}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                        e.target.onerror = null;
                      }}
                    />
                    <div className="flex-1">
                      <div className="bg-white rounded-3xl p-3 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {reply.user 
                                ? `${reply.user.firstname || ''} ${reply.user.lastName || ''}`.trim() || reply.user.username || 'Anonymous User'
                                : 'Anonymous User'
                              }
                            </h4>
                            <p className="text-xs text-gray-500">
                              {reply.createDate ? formatDistanceToNow(new Date(reply.createDate), { addSuffix: true }) : 'Unknown time'}
                              {reply.isEdited && <span className="ml-1">· Edited</span>}
                            </p>
                          </div>
                          {user?.username === reply.user?.username && (
                            <div className="relative">
                              <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                              >
                                <MoreHorizontal size={14} />
                              </button>
                              {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-3xl shadow-sm py-2 z-50 border-0 animate-fadeIn">
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
                        <p className="mt-1 text-gray-800 text-sm">{renderContentWithMentions(reply.content, reply.user)}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <ReactionButtons commentId={reply.id} isComment={true} />
                          <button
                            onClick={() => toggleReplyForm(reply.user)}
                            className="text-xs text-gray-700 hover:text-indigo-600 transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No replies yet</p>
              )}
              {showReplyForm && (
                <div ref={replyFormRef} className="mt-4 ml-6 animate-fadeIn">
                  <form onSubmit={handleReplySubmit} className="flex items-start space-x-3">
                    <img
                      src={user?.photoProfile ? `${API_BASE_URL}/images/${user.photoProfile}` : '/default-avatar.png'}
                      alt={user ? `${user.firstname || ''} ${user.lastName || ''}`.trim() : 'Current User'}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                        e.target.onerror = null;
                      }}
                    />
                    <div className="flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full p-3 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        rows={2}
                        disabled={isReplying}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setShowReplyForm(false)}
                          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors"
                          disabled={isReplying}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isReplying || !replyText.trim()}
                          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-3xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                          {isReplying ? 'Posting...' : 'Reply'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CommentItem.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    createDate: PropTypes.string,
    isEdited: PropTypes.bool,
    user: PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string,
      firstname: PropTypes.string,
      lastName: PropTypes.string,
      photoProfile: PropTypes.string,
    }),
    publicationId: PropTypes.number,
    parentCommentId: PropTypes.number,
    replyCount: PropTypes.number,
  }).isRequired,
  isReply: PropTypes.bool,
};

export default CommentItem;