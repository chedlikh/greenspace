import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MapPin,
  Save,
  X,
  Loader2,
  Building,
  Briefcase,
  Home,
} from "lucide-react";
import {
  useCreateSite,
  useAssignSiteToSociete,
  useAssignSiteToService,
 
} from "../../../services/siteHooks";
import {useSocietes,
  useGservices} from '../../../services/hooks';

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
const InputField = React.memo(({ label, name, type = "text", icon: Icon, options, value, onChange, optional = false }) => {
  const isSelect = type === "select";
  const { theme, darkMode } = useSelector((state) => state.theme);
  const themeColor = themeColors[theme]?.primary || '#4cd964';
  const textColor = darkMode ? themeColors[theme]?.textDark : themeColors[theme]?.textLight;
  const borderColor = darkMode ? themeColors[theme]?.borderDark : themeColors[theme]?.borderLight;
  const bgColor = darkMode ? '#374151' : '#ffffff';

  return (
    <div className="group">
      <label className={`block text-sm font-semibold mb-2 transition-colors group-focus-within:text-[color:var(--theme-primary)] ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        {label} {!optional && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} group-focus-within:text-[color:var(--theme-primary)] transition-colors`} />
          </div>
        )}
        {isSelect ? (
          <select
            name={name}
            value={value ?? ""}
            onChange={onChange}
            required={!optional}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'} hover:border-[color:var(--theme-secondary)] shadow-sm`}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className={darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={!optional}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'} hover:border-[color:var(--theme-secondary)] shadow-sm`}
          />
        )}
      </div>
    </div>
  );
});

const CreateSite = () => {
  const navigate = useNavigate();
  const { theme, darkMode } = useSelector((state) => state.theme);

  // Local state for site data
  const [siteData, setSiteData] = useState({
    nom: "",
    adresse: "",
    type: "MAGASIN",
    societeId: "",
    serviceId: "",
  });

  const [formError, setFormError] = useState(null);

  // Mutations
  const createSiteMutation = useCreateSite();
  const assignSiteToSocieteMutation = useAssignSiteToSociete();
  const assignSiteToServiceMutation = useAssignSiteToService();

  // Fetch data
  const { data: societes = [], isLoading: societesLoading, error: societesError } = useSocietes();
  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useGservices();

  // Filter unassigned societes and services
  const unassignedSocietes = societes.filter(societe => !societe.siteId);
  const unassignedServices = services.filter(service => !service.siteId);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSiteData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError(null);
  };

  // Reset form
  const resetForm = () => {
    setSiteData({
      nom: "",
      adresse: "",
      type: "MAGASIN",
      societeId: "",
      serviceId: "",
    });
    setFormError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      { name: "nom", label: "Nom" },
      { name: "adresse", label: "Adresse" },
      { name: "type", label: "Type" },
    ];

    const missingFields = requiredFields.filter(({ name }) => !siteData[name].trim());
    if (missingFields.length > 0) {
      setFormError(`Veuillez remplir les champs suivants : ${missingFields.map(f => f.label).join(", ")}`);
      return;
    }

    try {
      // Create site
      const newSite = await createSiteMutation.mutateAsync({
        nom: siteData.nom,
        adresse: siteData.adresse,
        type: siteData.type,
      });

      // Assign to societe if selected
      if (siteData.societeId) {
        await assignSiteToSocieteMutation.mutateAsync({
          siteId: newSite.id,
          societeId: siteData.societeId,
        });
      }

      // Assign to service if selected
      if (siteData.serviceId) {
        await assignSiteToServiceMutation.mutateAsync({
          siteId: newSite.id,
          gserviceId: siteData.serviceId,
        });
      }

      alert("Site créé avec succès !");
      resetForm();
      navigate("/sites");
    } catch (error) {
      console.error("Erreur lors de la création du site :", error);
      setFormError(error.message || "Erreur lors de la création du site");
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
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`} style={{ marginTop: '80px', marginLeft: '250px' }}>
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
          <div className={`bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] px-8 py-8`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 ${darkMode ? 'bg-gray-700/30' : 'bg-white/20'} rounded-full`}>
                <Home size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Créer un nouveau site</h1>
                <p className="text-white/80 mt-1">Remplissez les informations ci-dessous pour créer un site</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="p-8 space-y-10">
            {/* Site Information */}
            <div className="space-y-6">
              <div className={`border-l-4 border-[color:var(--theme-primary)] pl-4`}>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'} mb-1`}>Informations du site</h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Détails de base du site</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Nom"
                  name="nom"
                  icon={Home}
                  value={siteData.nom}
                  onChange={handleChange}
                />
                <InputField
                  label="Adresse"
                  name="adresse"
                  icon={MapPin}
                  value={siteData.adresse}
                  onChange={handleChange}
                />
                <InputField
                  label="Type"
                  name="type"
                  type="select"
                  icon={Building}
                  value={siteData.type}
                  onChange={handleChange}
                  options={[
                    { label: "Sélectionner le type", value: "" },
                    { label: "Magasin", value: "MAGASIN" },
                    { label: "Siège", value: "SIEGE" },
                  ]}
                />
              </div>
            </div>

            {/* Organization Assignment Section */}
            <div className="space-y-6">
              <div className={`border-l-4 border-[color:var(--theme-secondary)] pl-4`}>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'} mb-1`}>Affectation organisationnelle</h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Assignez le site à une société ou un service</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Société */}
                <div className="group">
                  <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2 transition-colors group-focus-within:text-[color:var(--theme-secondary)]`}>
                    Société (Facultatif)
                  </label>
                  <div className="relative">
                    <Building className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} group-focus-within:text-[color:var(--theme-secondary)] transition-colors`} />
                    <select
                      name="societeId"
                      value={siteData.societeId}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-secondary)] focus:border-[color:var(--theme-secondary)] transition-all duration-200 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'} hover:border-[color:var(--theme-secondary)] shadow-sm`}
                      disabled={societesLoading || societesError}
                    >
                      <option value="" className={darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}>Sélectionner une société</option>
                      {unassignedSocietes.length > 0 ? (
                        unassignedSocietes.map((societe) => (
                          <option key={societe.id} value={societe.id} className={darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}>
                            {societe.nom || societe.name || "Société sans nom"}
                          </option>
                        ))
                      ) : (
                        <option disabled className={darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}>Aucune société disponible</option>
                      )}
                    </select>
                    {societesLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <LoadingSpinner size={16} />
                      </div>
                    )}
                  </div>
                  {societesError && (
                    <p className="mt-1 text-sm text-red-500">Erreur lors du chargement des sociétés</p>
                  )}
                </div>

                {/* Service */}
                <div className="group">
                  <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2 transition-colors group-focus-within:text-[color:var(--theme-secondary)]`}>
                    Service (Facultatif)
                  </label>
                  <div className="relative">
                    <Briefcase className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} group-focus-within:text-[color:var(--theme-secondary)] transition-colors`} />
                    <select
                      name="serviceId"
                      value={siteData.serviceId}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-secondary)] focus:border-[color:var(--theme-secondary)] transition-all duration-200 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'} hover:border-[color:var(--theme-secondary)] shadow-sm`}
                      disabled={servicesLoading || servicesError}
                    >
                      <option value="" className={darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}>Sélectionner un service</option>
                      {unassignedServices.length > 0 ? (
                        unassignedServices.map((service) => (
                          <option key={service.id} value={service.id} className={darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}>
                            {service.nom || service.name || "Service sans nom"}
                          </option>
                        ))
                      ) : (
                        <option disabled className={darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}>Aucun service disponible</option>
                      )}
                    </select>
                    {servicesLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <LoadingSpinner size={16} />
                      </div>
                    )}
                  </div>
                  {servicesError && (
                    <p className="mt-1 text-sm text-red-500">Erreur lors du chargement des services</p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {formError && (
              <div className={`border-l-4 border-red-500 p-4 rounded-lg animate-fadeIn ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                <p className={darkMode ? 'text-red-400' : 'text-red-700'}>{formError}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className={`flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={() => navigate("/sites")}
                className={`px-8 py-3 rounded-lg transition-all duration-200 font-medium border flex items-center justify-center space-x-2 ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-gray-500' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400'}`}
              >
                <X size={18} />
                <span>Annuler</span>
              </button>
              <button
                type="submit"
                disabled={
                  createSiteMutation.isLoading ||
                  assignSiteToSocieteMutation.isLoading ||
                  assignSiteToServiceMutation.isLoading ||
                  societesLoading ||
                  servicesLoading
                }
                className={`px-8 py-3 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
              >
                {(createSiteMutation.isLoading ||
                  assignSiteToSocieteMutation.isLoading ||
                  assignSiteToServiceMutation.isLoading) && (
                  <LoadingSpinner />
                )}
                <Save size={18} />
                <span>Créer le site</span>
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

export default CreateSite;