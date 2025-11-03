import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormationRequestById, useApproveFormationRequest, useRejectFormationRequest } from '../../../../services/formation';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { toast } from 'react-toastify';

const FormationRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: formationRequest, isLoading, error } = useFormationRequestById(id);
  const approveFormationRequest = useApproveFormationRequest();
  const rejectFormationRequest = useRejectFormationRequest();
  const [adminId, setAdminId] = useState('');

  const handleApprove = () => {
    if (!adminId) {
      toast.error('Please enter an admin ID');
      return;
    }
    approveFormationRequest.mutate(
      { id, adminId },
      {
        onSuccess: () => {
          toast.success('Formation Request approved successfully!');
          navigate(`/formation-requests/${id}`);
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  const handleReject = () => {
    if (!adminId) {
      toast.error('Please enter an admin ID');
      return;
    }
    rejectFormationRequest.mutate(
      { id, adminId },
      {
        onSuccess: () => {
          toast.success('Formation Request rejected successfully!');
          navigate(`/formation-requests/${id}`);
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{formationRequest.titre}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600 mb-2"><strong>Description:</strong> {formationRequest.description || 'N/A'}</p>
        <p className="text-gray-600 mb-2"><strong>Status:</strong> {formationRequest.status}</p>
        <p className="text-gray-600 mb-2"><strong>Created:</strong> {formationRequest.dateCreation}</p>
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Actions</h2>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="adminId">
              Admin ID
            </label>
            <input
              type="text"
              name="adminId"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin ID"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleApprove}
              disabled={approveFormationRequest.isLoading || formationRequest.status !== 'PENDING'}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {approveFormationRequest.isLoading ? 'Approving...' : 'Approve'}
            </button>
            <button
              onClick={handleReject}
              disabled={rejectFormationRequest.isLoading || formationRequest.status !== 'PENDING'}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300"
            >
              {rejectFormationRequest.isLoading ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
        <button
          onClick={() => navigate(`/formation-requests/${id}/edit`)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
        >
          Edit Formation Request
        </button>
      </div>
    </div>
  );
};

export default FormationRequestDetail;