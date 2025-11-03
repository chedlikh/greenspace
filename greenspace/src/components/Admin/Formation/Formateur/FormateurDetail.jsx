import { useParams, useNavigate } from 'react-router-dom';
import { useFormateurById } from '../../../../services/formation';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const FormateurDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: formateur, isLoading, error } = useFormateurById(id);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{formateur.nom}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600 mb-2"><strong>Email:</strong> {formateur.email}</p>
        <p className="text-gray-600 mb-2"><strong>Phone:</strong> {formateur.telephone || 'N/A'}</p>
        <p className="text-gray-600 mb-2"><strong>Address:</strong> {formateur.adresse || 'N/A'}</p>
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Sessions</h2>
          {formateur.sessions?.map((session) => (
            <p key={session.id} className="text-gray-600">
              Session from {session.datedebut} (
              <span
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => navigate(`/sessions/${session.id}`)}
              >
                View
              </span>
              )
            </p>
          ))}
        </div>
        <button
          onClick={() => navigate(`/formateurs/${id}/edit`)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
        >
          Edit Formateur
        </button>
      </div>
    </div>
  );
};

export default FormateurDetail;