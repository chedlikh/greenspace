import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateGservice } from "../../../services/hooks";
import { Briefcase, Save, X, Loader2, AlertCircle } from "lucide-react";

// Theme color mapping with dark mode support
const themeColors = {
  red: {
    primary: '#ff3b30',
    secondary: '#ff2d55',
    bgLight: '#fef2f2',
    bgDark: '#3f0a0a',
    textLight: '#1f2937',
    textDark: '#f3f4f6',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  green: {
    primary: '#4cd964',
    secondary: '#34c759',
    bgLight: '#f0fdf4',
    bgDark: '#052e16',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  blue: {
    primary: '#132977',
    secondary: '#007aff',
    bgLight: '#eff6ff',
    bgDark: '#1e3a8a',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  pink: {
    primary: '#ff2d55',
    secondary: '#ff69b4',
    bgLight: '#fff1f2',
    bgDark: '#3f0713',
    textLight: '#1f2937',
    textDark: '#f3f4f6',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  yellow: {
    primary: '#ffcc00',
    secondary: '#ff9500',
    bgLight: '#fefce8',
    bgDark: '#3f2c00',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  orange: {
    primary: '#ff9500',
    secondary: '#ff7f50',
    bgLight: '#fff7ed',
    bgDark: '#3f2d0f',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  gray: {
    primary: '#8e8e93',
    secondary: '#a9a9a9',
    bgLight: '#f9fafb',
    bgDark: '#374151',
    textLight: '#1f2937',
    textDark: '#d1d5db',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  brown: {
    primary: '#D2691E',
    secondary: '#8B4513',
    bgLight: '#fef7ed',
    bgDark: '#2f1c0a',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  darkgreen: {
    primary: '#228B22',
    secondary: '#006400',
    bgLight: '#f0fdf4',
    bgDark: '#092709',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  deeppink: {
    primary: '#FFC0CB',
    secondary: '#FF69B4',
    bgLight: '#fff1f2',
    bgDark: '#3f0b1e',
    textLight: '#1f2937',
    textDark: '#f3f4f6',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  cadetblue: {
    primary: '#5f9ea0',
    secondary: '#4682b4',
    bgLight: '#f0f9ff',
    bgDark: '#1c2f3a',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  darkorchid: {
    primary: '#9932cc',
    secondary: '#9400d3',
    bgLight: '#f5f3ff',
    bgDark: '#2e1a3f',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
};

// InputField component with dark mode support
const InputField = React.memo(({ label, name, type = "text", icon: Icon, value, onChange, onBlur, optional = false }) => {
  const { theme, darkMode } = useSelector((state) => state.theme);
  const themeColor = themeColors[theme]?.primary || '#4cd964';
  const textColor = darkMode ? themeColors[theme]?.textDark : themeColors[theme]?.textLight;
  const borderColor = darkMode ? themeColors[theme]?.borderDark : themeColors[theme]?.borderLight;

  return (
    <div className="group">
      <label
        className={`block text-sm font-semibold mb-2 transition-colors group-focus-within:text-[${themeColor}] ${
          darkMode ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        {label} {!optional && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} group-focus-within:text-[${themeColor}] transition-colors`}
            />
          </div>
        )}
        {type === "textarea" ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            required={!optional}
            rows={4}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[${themeColor}] focus:border-[${themeColor}] transition-all duration-200 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
            } hover:border-[${themeColors[theme]?.secondary || '#34c759'}] shadow-sm`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            required={!optional}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[${themeColor}] focus:border-[${themeColor}] transition-all duration-200 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
            } hover:border-[${themeColors[theme]?.secondary || '#34c759'}] shadow-sm`}
          />
        )}
      </div>
    </div>
  );
});

const GserviceCreate = () => {
  const navigate = useNavigate();
  const { theme, darkMode } = useSelector((state) => state.theme);
  const token = useSelector((state) => state.auth.token);
  const createService = useCreateGservice();

  // Local state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [touched, setTouched] = useState({ name: false });
  const [formError, setFormError] = useState(null);

  // Log token for debugging
  useEffect(() => {
    console.log("Token in GserviceCreate:", token);
  }, [token]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFormError(null);
  };

  // Handle blur for validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true });

    if (!formData.name.trim()) {
      setFormError("Veuillez remplir le champ Nom");
      return;
    }

    if (!token) {
      setFormError("Authentication required. Please log in.");
      return;
    }

    try {
      await createService.mutateAsync(formData, {
        onSuccess: (data) => {
          alert("Service créé avec succès !");
          navigate(`/services/${data.id}`);
        },
      });
    } catch (error) {
      console.error("Erreur lors de la création du service :", error);
      setFormError(error.message || "Erreur lors de la création du service");
    }
  };

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';
  const bgColor = darkMode ? themeColors[theme]?.bgDark : themeColors[theme]?.bgLight;
  const textColor = darkMode ? themeColors[theme]?.textDark : themeColors[theme]?.textLight;
  const borderColor = darkMode ? themeColors[theme]?.borderDark : themeColors[theme]?.borderLight;

  const LoadingSpinner = ({ size = 18 }) => (
    <Loader2 size={size} className={`animate-spin ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
  );

  return (
    <div
      className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${
        darkMode ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}
      style={{ marginTop: '80px', marginLeft: '250px' }}
    >
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
          }
        `}
      </style>
      <div className="max-w-5xl mx-auto">
        <div className={`rounded-2xl shadow-xl overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex items-center space-x-4">
              <div className={`p-3 ${darkMode ? 'bg-gray-700/30' : 'bg-white/20'} rounded-full`}>
                <Briefcase size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Créer un nouveau service</h1>
                <p className="text-white/80 mt-1">Remplissez les informations ci-dessous pour créer un service</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-10">
            {/* Service Information */}
            <div className="space-y-6">
              <div className="border-l-4 border-[color:var(--theme-primary)] pl-4">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'} mb-1`}>Informations du service</h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Détails de base du service</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Nom"
                  name="name"
                  icon={Briefcase}
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                <InputField
                  label="Description"
                  name="description"
                  type="text"
                  icon={AlertCircle}
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  optional={true}
                />
              </div>
            </div>

            {/* Error Alert */}
            {(formError || createService.isError || !token) && (
              <div className={`border-l-4 border-red-500 p-4 rounded-lg animate-fadeIn ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                <p className={darkMode ? 'text-red-400' : 'text-red-700'}>
                  {formError || (!token ? "Authentication required. Please log in." : createService.error?.message || "Failed to create service")}
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className={`flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={() => navigate("/services")}
                className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium border flex items-center justify-center space-x-2 ${
                  darkMode
                    ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400'
                }`}
              >
                <X size={18} />
                <span>Annuler</span>
              </button>
              <button
                type="submit"
                disabled={createService.isLoading}
                className="px-6 py-3 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {createService.isLoading && <LoadingSpinner />}
                <Save size={18} />
                <span>Créer le service</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default GserviceCreate;
