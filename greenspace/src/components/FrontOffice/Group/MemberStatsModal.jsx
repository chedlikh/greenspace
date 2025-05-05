import { useMemberStats } from '../../../services/group';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const MemberStatsModal = ({ groupId, username, onClose }) => {
  const { data: stats, isLoading, isError, error } = useMemberStats(groupId, username);

  if (isLoading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <LoadingSpinner />
      </div>
    </div>
  );

  if (isError) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <ErrorMessage message={error.message} />
        <button
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{username}'s Stats</h3>
        <div className="space-y-2">
          <p><strong>Publications:</strong> {stats.publicationCount}</p>
          <p><strong>Comments:</strong> {stats.commentCount}</p>
          <p><strong>Reactions:</strong> {stats.reactionCount}</p>
          <p><strong>Join Date:</strong> {new Date(stats.joinDate).toLocaleDateString()}</p>
          <p><strong>Last Comment:</strong> {stats.lastCommentDate ? new Date(stats.lastCommentDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Last Publication:</strong> {stats.lastPublicationDate ? new Date(stats.lastPublicationDate).toLocaleDateString() : 'N/A'}</p>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MemberStatsModal;