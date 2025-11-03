import { useMemberStats } from '../../../services/group';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const MemberStatsModal = ({ groupId, username, onClose }) => {
  const { data: stats, isLoading, isError, error } = useMemberStats(groupId, username);

  if (isLoading) return (
    <div className="modal-popup-wrap fixed inset-0 bg-black bg-opacity-50 d-flex align-items-center justify-content-center">
      <div className="bg-white p-4 rounded-xxl shadow-xss">
        <LoadingSpinner />
      </div>
    </div>
  );

  if (isError) return (
    <div className="modal-popup-wrap fixed inset-0 bg-black bg-opacity-50 d-flex align-items-center justify-content-center">
      <div className="bg-white p-4 rounded-xxl shadow-xss w-100" style={{ maxWidth: '400px' }}>
        <ErrorMessage message={error.message} />
        <button
          className="mt-3 p-2 bg-primary text-white font-xssss fw-600 rounded-3 w-100 text-center"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="modal-popup-wrap fixed inset-0 bg-black bg-opacity-50 d-flex align-items-center justify-content-center">
      <div className="modal-popup-body bg-white p-4 rounded-xxl shadow-xss w-100" style={{ maxWidth: '400px' }}>
        <div className="card-body p-0 d-flex align-items-center border-bottom-xs">
          <h3 className="fw-700 text-grey-900 font-xsss mb-0">{username}'s Stats</h3>
          <a href="#" className="ms-auto font-xssss text-grey-500" onClick={onClose}>
            <i className="ti-close font-xss"></i>
          </a>
        </div>
        <div className="card-body p-0 pt-3">
          <div className="d-flex mb-2">
            <i className="feather-file-text text-grey-500 me-3 font-lg"></i>
            <p className="fw-500 text-grey-900 font-xssss">
              <strong>Publications:</strong> {stats.publicationCount}
            </p>
          </div>
          <div className="d-flex mb-2">
            <i className="feather-message-circle text-grey-500 me-3 font-lg"></i>
            <p className="fw-500 text-grey-900 font-xssss">
              <strong>Comments:</strong> {stats.commentCount}
            </p>
          </div>
          <div className="d-flex mb-2">
            <i className="feather-thumbs-up text-grey-500 me-3 font-lg"></i>
            <p className="fw-500 text-grey-900 font-xssss">
              <strong>Reactions:</strong> {stats.reactionCount}
            </p>
          </div>
          <div className="d-flex mb-2">
            <i className="feather-calendar text-grey-500 me-3 font-lg"></i>
            <p className="fw-500 text-grey-900 font-xssss">
              <strong>Join Date:</strong> {new Date(stats.joinDate).toLocaleDateString()}
            </p>
          </div>
          <div className="d-flex mb-2">
            <i className="feather-message-square text-grey-500 me-3 font-lg"></i>
            <p className="fw-500 text-grey-900 font-xssss">
              <strong>Last Comment:</strong> {stats.lastCommentDate ? new Date(stats.lastCommentDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="d-flex mb-2">
            <i className="feather-edit text-grey-500 me-3 font-lg"></i>
            <p className="fw-500 text-grey-900 font-xssss">
              <strong>Last Publication:</strong> {stats.lastPublicationDate ? new Date(stats.lastPublicationDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        <div className="card-body p-0 pt-3">
          <button
            className="p-2 bg-primary text-white font-xssss fw-600 rounded-3 w-100 text-center"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberStatsModal;