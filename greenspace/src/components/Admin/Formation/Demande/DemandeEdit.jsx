import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDemandeById, useUpdateDemande } from '../../../../services/formation';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { toast } from 'react-toastify';

const DemandeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: demande, isLoading, error } = useDemandeById(id);
  const updateDemande = useUpdateDemande();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (demande) {
      setFormData({
        titre: demande.titre,
        description: demande.description || '',
        status: demande.status || 'PENDING',
      });
    }
  }, [demande]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateDemande.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          toast.success('Demande updated successfully!');
          navigate(`/demandes/${id}`);
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  if (isLoading || !formData) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Demande</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-lg">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="titre">
            Title
          </label>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="status">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={updateDemande.isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {updateDemande.isLoading ? 'Updating...' : 'Update Demande'}
        </button>
      </form>
    </div>
  );
};

export default DemandeEdit;