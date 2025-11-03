import { useState } from 'react';
import PropTypes from 'prop-types';
import { usePublicationComments, useAddComment, usePublicationCommentCount } from '../../../services/comments';
import { toast } from 'react-toastify';
import CommentItem from './CommentItem';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useSelector } from 'react-redux';

const CommentSection = ({ publicationId }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [commentText, setCommentText] = useState('');
  
  const { 
    data: commentsData, 
    isLoading: isLoadingComments, 
    isError: isCommentsError, 
    error: commentsError,
    refetch: refetchComments
  } = usePublicationComments(publicationId, page, size);
  
  const {
    data: commentCount,
    isLoading: isLoadingCount
  } = usePublicationCommentCount(publicationId);
  
  const { mutate: addComment, isLoading: isAdding } = useAddComment();
  const user = useSelector((state) => state.auth.user);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    addComment(
      { publicationId, commentData: { content: commentText } },
      {
        onSuccess: () => {
          setCommentText('');
          refetchComments();
          toast.success('Comment posted successfully');
        },
        onError: (error) => {
          toast.error(`Failed to post comment: ${error.message}`);
        },
      }
    );
  };

  if (isLoadingComments) return <LoadingSpinner />;
  if (isCommentsError) return <ErrorMessage message={commentsError.message} />;

  const totalComments = commentCount || 0;
  const displayedComments = commentsData?.content?.filter(comment => !comment.parentCommentId) || [];
  const remainingComments = (commentsData?.totalElements || 0) - ((page + 1) * size);
  
  const userName = user 
    ? `${user.firstname || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous User'
    : 'Anonymous User';

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">
        Comments {!isLoadingCount && totalComments > 0 && `(${totalComments})`}
      </h3>
      
      <form onSubmit={handleSubmit} className="flex items-start space-x-3">
        <img
          src={user?.photoProfile ? `${API_BASE_URL}/images/${user.photoProfile}` : '/default-avatar.png'}
          alt={userName}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.target.src = '/default-avatar.png';
            e.target.onerror = null;
          }}
        />
        <div className="flex-1">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-4 bg-white border border-gray-200 rounded-3xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            rows={3}
            disabled={isAdding}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isAdding || !commentText.trim()}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-3xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {isAdding ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>
      
      <div className="space-y-4">
        {displayedComments.length > 0 ? (
          displayedComments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              isReply={false}
            />
          ))
        ) : (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        )}
      </div>
      
      {commentsData?.totalPages > page + 1 && remainingComments > 0 && (
        <button
          onClick={() => setPage(page + 1)}
          className="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors mt-4"
        >
          Load more comments ({remainingComments} remaining)
        </button>
      )}
    </div>
  );
};

CommentSection.propTypes = {
  publicationId: PropTypes.number.isRequired,
};

export default CommentSection;