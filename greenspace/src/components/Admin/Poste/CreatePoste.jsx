import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreatePoste } from "../../../services/hooks";
import { Briefcase, Save, X, Loader2, AlertCircle } from "lucide-react";

// Theme color mapping based on CreateUser's theme settings
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

// InputField component (adapted from CreateUser)
const InputField = React.memo(({ label, name, type = "text", icon: Icon, value, onChange, optional = false, error }) => {
  const { theme } = useSelector((state) => state.theme);
  const themeColor = themeColors[theme]?.primary || '#4cd964';

  return (
    <div className="group">
      <label className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-[color:var(--theme-primary)] ${error ? 'text-red-500' : ''}`}>
        {label} {!optional && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[color:var(--theme-primary)]'} transition-colors`} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={!optional}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 hover:border-gray-400 shadow-sm ${error ? 'border-red-500' : 'border-gray-300'} ${error ? 'focus:ring-red-500' : ''}`}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500 animate-fadeIn">{error}</p>
        )}
      </div>
    </div>
  );
});

const CreatePoste = () => {
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.theme);
  const token = useSelector((state) => state.auth.token);
  const createPoste = useCreatePoste();

  // Local state
  const [formData, setFormData] = useState({
    titre: "",
  });
  const [errors, setErrors] = useState({ titre: null });
  const [formError, setFormError] = useState(null);

  // Log token for debugging
  useEffect(() => {
    console.log("Token in CreatePoste:", token);
  }, [token]);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: value.trim() ? null : "Ce champ est requis" }));
    setFormError(null);
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.titre.trim()) {
      newErrors.titre = "Le titre est requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setFormError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    if (!token) {
      setFormError("Authentification requise. Veuillez vous connecter.");
      return;
    }

    try {
      await createPoste.mutateAsync(formData, {
        onSuccess: (data) => {
          alert("Poste créé avec succès !");
          navigate(`/postes/${data.id || ''}`);
        },
      });
    } catch (error) {
      console.error("Erreur lors de la création du poste :", error);
      setFormError(error.message || "Erreur lors de la création du poste");
    }
  };

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';

  const LoadingSpinner = ({ size = 18 }) => (
    <Loader2 size={size} className="animate-spin text-gray-500" />
  );

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
                <Briefcase size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Créer un nouveau poste</h1>
                <p className="text-white/80 mt-1">Remplissez les informations ci-dessous pour créer un poste</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="p-8 space-y-10">
            {/* Poste Information */}
            <div className="space-y-6 animate-fadeIn">
              <div className="border-l-4 border-[color:var(--theme-primary)] pl-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Informations du poste</h3>
                <p className="text-gray-600">Détails de base du poste</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Titre"
                  name="titre"
                  icon={Briefcase}
                  value={formData.titre}
                  onChange={handleChange}
                  error={errors.titre}
                />
              </div>
            </div>

            {/* Error Alert */}
            {(formError || createPoste.isError || !token) && (
              <div className="border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={18} className="text-red-700" />
                  <p className="text-red-700">
                    {formError || (!token ? "Authentification requise. Veuillez vous connecter." : createPoste.error?.message || "Échec de la création du poste")}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200 animate-fadeIn">
              <button
                type="button"
                onClick={() => navigate("/postes")}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300 hover:border-gray-400 flex items-center justify-center space-x-2"
              >
                <X size={18} />
                <span>Annuler</span>
              </button>
              <button
                type="submit"
                disabled={createPoste.isLoading || Object.values(errors).some((e) => e)}
                className="px-8 py-3 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {createPoste.isLoading && <LoadingSpinner />}
                <Save size={18} />
                <span>Créer le poste</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePoste;