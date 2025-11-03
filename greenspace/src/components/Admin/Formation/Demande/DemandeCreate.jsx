import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateDemande } from '../../../../services/formation';
import { toast } from 'react-toastify';

const DemandeCreate = () => {
  const navigate = useNavigate();
  const createDemande = useCreateDemande();
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    status: 'PENDING',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createDemande.mutate(formData, {
      onSuccess: (data) => {
        toast.success('Demande created successfully!');
        navigate(`/demandes/${data.id}`);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Demande</h1>
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
          disabled={createDemande.isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {createDemande.isLoading ? 'Creating...' : 'Create Demande'}
        </button>
      </form>
    </div>
  );
};

export default DemandeCreate;