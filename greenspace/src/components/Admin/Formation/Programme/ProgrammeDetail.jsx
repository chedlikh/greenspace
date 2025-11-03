import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useProgrammeById } from '../../../../services/formation';
import { Edit, Loader2, AlertCircle, BookOpen } from "lucide-react";

// Theme color mapping from CreatePoste
const themeColors = {
  red: { primary: '#ff3b30', secondary: '#ff2d55' },
  green: { primary: '#4cd964', secondary: '#34c759' },
  blue: { primary: '#132977', secondary: '#007aff' },
  pink: { primary: '#ff2d55', secondary: '#ff69b4' },
  yellow: { primary: '#ffcc00', secondary: '#ff9500' },
  orange: { primary: '#ff9500', secondary: '#ff7f50' },
  gray: { primary: '#8e8e93', secondary: '#a9a9a9' },
  brown: { primary: '#D2691E', secondary: '#8B4513' },
  darkgreen: { primary: '#228B22', secondary: '#006400' },
  deeppink: { primary: '#FFC0CB', secondary: '#FF69B4' },
  cadetblue: { primary: '#5f9ea0', secondary: '#4682b4' },
  darkorchid: { primary: '#9932cc', secondary: '#9400d3' },
};

const LoadingSpinner = ({ size = 24 }) => (
  <Loader2 size={size} className="animate-spin text-gray-500" />
);

const ProgrammeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.theme);
  const { data: programme, isLoading, error } = useProgrammeById(id);

  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center" style={{ marginTop: '80px', marginLeft: '250px' }}>
        <LoadingSpinner size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center" style={{ marginTop: '80px', marginLeft: '250px' }}>
        <div className="border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertCircle size={18} className="text-red-700" />
            <p className="text-red-700 mont-font">{error.message || 'Erreur inconnue'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8" style={{ marginTop: '80px', marginLeft: '250px' }}>
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] px-8 py-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <BookOpen size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mont-font">{programme.titre}</h1>
                <p className="text-white/80 mt-1 mont-font">Détails du programme</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 animate-fadeIn">
            <div className="border-l-4 border-[color:var(--theme-primary)] pl-4">
              <h3 className="text-xl font-bold text-gray-900 mb-1 mont-font">Informations du programme</h3>
              <p className="text-gray-600 mont-font">Détails du programme sélectionné</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mont-font">Durée</h4>
                <p className="text-gray-600 mt-1 mont-font">{programme.duree ? `${programme.duree} heures` : 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mont-font">Description</h4>
                <p className="text-gray-600 mt-1 mont-font">{programme.description || 'N/A'}</p>
              </div>
              {programme.nbrdheureparjour && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mont-font">Heures par jour</h4>
                  <p className="text-gray-600 mt-1 mont-font">{programme.nbrdheureparjour} heures</p>
                </div>
              )}
              {programme.heuredebut && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mont-font">Heure de début</h4>
                  <p className="text-gray-600 mt-1 mont-font">{programme.heuredebut}</p>
                </div>
              )}
              {programme.heurefin && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mont-font">Heure de fin</h4>
                  <p className="text-gray-600 mt-1 mont-font">{programme.heurefin}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate(`/programmes/${id}/edit`)}
                className="px-8 py-3 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 font-medium shadow-lg hover:shadow-xl mont-font flex items-center justify-center space-x-2"
              >
                <Edit size={18} />
                <span>Modifier le programme</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgrammeDetail;
