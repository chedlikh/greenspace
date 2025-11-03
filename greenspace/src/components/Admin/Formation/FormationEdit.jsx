import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormationById, useUpdateFormation } from '../../../services/formation';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { toast } from 'react-toastify';

const FormationEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: formation, isLoading, error } = useFormationById(id);
  const updateFormation = useUpdateFormation();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (formation) {
      setFormData({
        titre: formation.titre,
        description: formation.description || '',
        mode: formation.mode || 'ONLINE',
        status: formation.status || 'COMING_SOON',
      });
    }
  }, [formation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFormation.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          toast.success('Formation updated successfully!');
          navigate(`/formations/${id}`);
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  if (isLoading || !formData) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
        <div className="main-content bg-lightblue theme-dark-bg right-chat-active">

    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Formation</h1>
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
          <label className="block text-gray-700 font-medium mb-2" htmlFor="mode">
            Mode
          </label>
          <select
            name="mode"
            value={formData.mode}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ONLINE">Online</option>
            <option value="IN_PERSON">In Person</option>
          </select>
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
            <option value="COMING_SOON">Coming Soon</option>
            <option value="STARTED">Started</option>
            <option value="FINISHED">Finished</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={updateFormation.isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {updateFormation.isLoading ? 'Updating...' : 'Update Formation'}
        </button>
      </form>
    </div>
    </div>
  );
};

export default FormationEdit;