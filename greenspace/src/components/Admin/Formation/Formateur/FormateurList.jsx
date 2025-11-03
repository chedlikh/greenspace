import { useAllFormateurs } from '../../../../services/formation';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const FormateurList = () => {
  const { data: formateurs, isLoading, error } = useAllFormateurs(0, 10);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Formateurs</h1>
        <Link
          to="/formateurs/create"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Formateur
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formateurs.map((formateur) => (
          <div
            key={formateur.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800">{formateur.nom}</h2>
            <p className="text-gray-600 mt-2">Email: {formateur.email}</p>
            <p className="text-gray-600 mt-2">Phone: {formateur.telephone || 'N/A'}</p>
            <div className="mt-4 flex space-x-2">
              <Link
                to={`/formateurs/${formateur.id}`}
                className="text-blue-500 hover:underline"
              >
                View
              </Link>
              <Link
                to={`/formateurs/${formateur.id}/edit`}
                className="text-green-500 hover:underline"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormateurList;