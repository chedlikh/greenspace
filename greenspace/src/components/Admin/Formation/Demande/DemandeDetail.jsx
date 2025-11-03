import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDemandeById, useApproveDemande, useRejectDemande } from '../../../../services/formation';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { toast } from 'react-toastify';

const DemandeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: demande, isLoading, error } = useDemandeById(id);
  const approveDemande = useApproveDemande();
  const rejectDemande = useRejectDemande();
  const [adminId, setAdminId] = useState('');

  const handleApprove = () => {
    if (!adminId) {
      toast.error('Please enter an admin ID');
      return;
    }
    approveDemande.mutate(
      { id, adminId },
      {
        onSuccess: () => {
          toast.success('Demande approved successfully!');
          navigate(`/demandes/${id}`);
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
    rejectDemande.mutate(
      { id, adminId },
      {
        onSuccess: () => {
          toast.success('Demande rejected successfully!');
          navigate(`/demandes/${id}`);
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{demande.titre}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600 mb-2"><strong>Description:</strong> {demande.description || 'N/A'}</p>
        <p className="text-gray-600 mb-2"><strong>Status:</strong> {demande.status}</p>
        <p className="text-gray-600 mb-2"><strong>Created:</strong> {demande.dateCreation}</p>
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
              disabled={approveDemande.isLoading || demande.status !== 'PENDING'}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {approveDemande.isLoading ? 'Approving...' : 'Approve'}
            </button>
            <button
              onClick={handleReject}
              disabled={rejectDemande.isLoading || demande.status !== 'PENDING'}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300"
            >
              {rejectDemande.isLoading ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
        <button
          onClick={() => navigate(`/demandes/${id}/edit`)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
        >
          Edit Demande
        </button>
      </div>
    </div>
  );
};

export default DemandeDetail;