import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormateurById, useUpdateFormateur } from '../../../../services/formation';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { toast } from 'react-toastify';

const FormateurEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: formateur, isLoading, error } = useFormateurById(id);
  const updateFormateur = useUpdateFormateur();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (formateur) {
      setFormData({
        nom: formateur.nom,
        email: formateur.email,
        telephone: formateur.telephone || '',
        adresse: formateur.adresse || '',
      });
    }
  }, [formateur]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFormateur.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          toast.success('Formateur updated successfully!');
          navigate(`/formateurs/${id}`);
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  if (isLoading || !formData) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Formateur</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-lg">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="nom">
            Name
          </label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="telephone">
            Phone
          </label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="adresse">
            Address
          </label>
          <textarea
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={updateFormateur.isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {updateFormateur.isLoading ? 'Updating...' : 'Update Formateur'}
        </button>
      </form>
    </div>
  );
};

export default FormateurEdit;