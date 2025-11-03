import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useSiteById,
  useUpdateSite,
  useDeleteSite,
  useAssignSiteToSociete,
  useUnassignSiteFromSociete,
  useAssignSiteToService,
  useUnassignSiteFromService,
  useUnassignedSocietes,
  useUnassignedServices,
  useAssignedServices,
} from "../../../services/siteHooks";
import {
  ArrowLeft,
  Building2,
  Save,
  Trash2,
  AlertTriangle,
  Link2,
  Unlink,
  CheckCircle,
  X,
} from "lucide-react";

const SiteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, darkMode } = useSelector((state) => state.theme);

  // Theme color mapping
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

  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';

  // Fetch data
  const { data: site, isLoading: isSiteLoading, isError: isSiteError, error: siteError } = useSiteById(id);
  const { data: assignedServices = [], isLoading: isServicesLoading, isError: isServicesError, error: servicesError } = useAssignedServices(id);
  const updateSiteMutation = useUpdateSite(id);
  const deleteSiteMutation = useDeleteSite(id);
  const assignSocieteMutation = useAssignSiteToSociete();
  const unassignSocieteMutation = useUnassignSiteFromSociete(id);
  const assignServiceMutation = useAssignSiteToService();
  const unassignServiceMutation = useUnassignSiteFromService(id);
  const { data: unassignedSocietes = [] } = useUnassignedSocietes(id);
  const { data: unassignedServices = [] } = useUnassignedServices(id);

  // Local state
  const [editableSite, setEditableSite] = useState({
    nom: "",
    adresse: "",
    type: "",
  });
  const [selectedSociete, setSelectedSociete] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [touched, setTouched] = useState({ nom: false, adresse: false, type: false });
  const [errorDismissed, setErrorDismissed] = useState({});

  useEffect(() => {
    if (site) {
      setEditableSite({
        nom: site.nom || "",
        adresse: site.adresse || "",
        type: site.type || "",
      });
    }
  }, [site]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableSite((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setTouched({ nom: true, adresse: true, type: true });
    if (editableSite.nom && editableSite.adresse && editableSite.type) {
      updateSiteMutation.mutate(editableSite);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${editableSite.nom}?`)) {
      deleteSiteMutation.mutate(null, {
        onSuccess: () => navigate("/sites"),
      });
    }
  };

  const handleAssignSociete = () => {
    if (selectedSociete && id) {
      assignSocieteMutation.mutate(
        { siteId: id, societeId: selectedSociete },
        {
          onSuccess: () => setSelectedSociete(""),
        }
      );
    }
  };

  const handleUnassignSociete = () => {
    unassignSocieteMutation.mutate();
  };

  const handleAssignService = () => {
    if (selectedService && id) {
      assignServiceMutation.mutate(
        { siteId: id, gserviceId: selectedService },
        {
          onSuccess: () => setSelectedService(""),
        }
      );
    }
  };

  const handleUnassignService = (gserviceId) => {
    unassignServiceMutation.mutate(gserviceId);
  };

  const isFieldValid = (field) => editableSite[field] && touched[field];

  const dismissError = (mutationKey) => {
    setErrorDismissed((prev) => ({ ...prev, [mutationKey]: true }));
  };

  if (isSiteLoading || isServicesLoading) {
    return (
      <div className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[color:var(--theme-primary)]"></div>
      </div>
    );
  }

  if (isSiteError || isServicesError) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} max-w-3xl mx-auto`}>
        <AlertTriangle className="text-red-500 w-12 h-12 mb-4" />
        <p className={`text-red-600 dark:text-red-300 text-base font-semibold text-center`}>
          Error: {siteError?.message || servicesError?.message || "Unknown error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active" style={{ marginTop: '80px' }}>
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
          }
        `}
      </style>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} px-4 py-6 sm:px-6 lg:px-8`}>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/sites")}
              className={`flex items-center text-[color:var(--theme-primary)] hover:text-[color:var(--theme-secondary)] transition-colors text-sm font-medium`}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sites
            </button>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} truncate max-w-xs sm:max-w-md`}>
              {editableSite.nom || "Site Details"}
            </h1>
            <div className="w-20"></div>
          </div>

          {/* Main Card */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${updateSiteMutation.isLoading || deleteSiteMutation.isLoading ? 'opacity-75 pointer-events-none' : ''}`}>
            <div className="p-4 bg-[color:var(--theme-primary)]">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-white" />
                <h2 className="text-base font-semibold text-white">Site Information</h2>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Site Details Form */}
              <form onSubmit={handleUpdate}>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="nom" className={`block text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Name
                    </label>
                    <div className="relative">
                      <input
                        id="nom"
                        type="text"
                        name="nom"
                        value={editableSite.nom}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-3 pr-8 py-1.5 border ${touched.nom && !editableSite.nom ? 'border-red-500' : darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] text-sm transition-all`}
                        required
                      />
                      {isFieldValid('nom') && (
                        <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-[color:var(--theme-primary)]" />
                      )}
                    </div>
                    {touched.nom && !editableSite.nom && (
                      <p className="mt-1 text-xs text-red-500 dark:text-red-400">Name is required</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="adresse" className={`block text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Address
                    </label>
                    <div className="relative">
                      <input
                        id="adresse"
                        type="text"
                        name="adresse"
                        value={editableSite.adresse}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-3 pr-8 py-1.5 border ${touched.adresse && !editableSite.adresse ? 'border-red-500' : darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] text-sm transition-all`}
                        required
                      />
                      {isFieldValid('adresse') && (
                        <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-[color:var(--theme-primary)]" />
                      )}
                    </div>
                    {touched.adresse && !editableSite.adresse && (
                      <p className="mt-1 text-xs text-red-500 dark:text-red-400">Address is required</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="type" className={`block text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Type
                    </label>
                    <div className="relative">
                      <select
                        id="type"
                        name="type"
                        value={editableSite.type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-3 pr-8 py-1.5 border ${touched.type && !editableSite.type ? 'border-red-500' : darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] text-sm transition-all appearance-none`}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="MAGASIN">Magasin</option>
                        <option value="SIEGE">Siege</option>
                      </select>
                      {isFieldValid('type') && (
                        <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-[color:var(--theme-primary)]" />
                      )}
                    </div>
                    {touched.type && !editableSite.type && (
                      <p className="mt-1 text-xs text-red-500 dark:text-red-400">Type is required</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => navigate("/sites")}
                    className={`px-3 py-1.5 border ${darkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] transition-all`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateSiteMutation.isLoading}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[color:var(--theme-primary)] hover:bg-[color:var(--theme-secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${updateSiteMutation.isLoading ? 'opacity-75 cursor-not-allowed' : ''} transition-all`}
                  >
                    {updateSiteMutation.isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="-ml-1 mr-1 h-3.5 w-3.5" />
                        Save
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteSiteMutation.isLoading}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${deleteSiteMutation.isLoading ? 'opacity-75 cursor-not-allowed' : ''} transition-all`}
                  >
                    <Trash2 className="-ml-1 mr-1 h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </form>

              {/* Societe Assignment */}
              <div className="pt-4">
                <h3 className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Societe Assignment
                </h3>
                {site?.societe ? (
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-xs">
                    <span className={`text-gray-700 dark:text-gray-300 truncate max-w-xs`}>
                      {site.societe.name}
                    </span>
                    <button
                      onClick={handleUnassignSociete}
                      disabled={unassignSocieteMutation.isLoading}
                      className={`flex items-center text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 focus:outline-none ${unassignSocieteMutation.isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      <Unlink className="h-3.5 w-3.5 mr-1" />
                      Unassign
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <select
                      value={selectedSociete}
                      onChange={(e) => setSelectedSociete(e.target.value)}
                      className={`block w-full sm:w-40 pl-2 pr-6 py-1.5 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] text-xs transition-all`}
                    >
                      <option value="">Select Societe</option>
                      {unassignedSocietes.map((societe) => (
                        <option key={societe.id} value={societe.id}>
                          {societe.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignSociete}
                      disabled={!selectedSociete || assignSocieteMutation.isLoading}
                      className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[color:var(--theme-primary)] hover:bg-[color:var(--theme-secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${!selectedSociete || assignSocieteMutation.isLoading ? 'opacity-75 cursor-not-allowed' : ''} transition-all`}
                    >
                      <Link2 className="-ml-1 mr-1 h-3.5 w-3.5" />
                      Assign
                    </button>
                  </div>
                )}
              </div>

              {/* Services Assignment */}
              <div className="pt-4">
                <h3 className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Service Assignments
                </h3>
                {assignedServices.length > 0 ? (
                  <div className="space-y-1.5">
                    {assignedServices.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-xs">
                        <span className={`text-gray-700 dark:text-gray-300 truncate max-w-xs`}>
                          {service.name}
                        </span>
                        <button
                          onClick={() => handleUnassignService(service.id)}
                          disabled={unassignServiceMutation.isLoading}
                          className={`flex items-center text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 focus:outline-none ${unassignServiceMutation.isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                          <Unlink className="h-3.5 w-3.5 mr-1" />
                          Unassign
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No services assigned.
                  </p>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className={`block w-full sm:w-40 pl-2 pr-6 py-1.5 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] text-xs transition-all`}
                  >
                    <option value="">Select Service</option>
                    {unassignedServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignService}
                    disabled={!selectedService || assignServiceMutation.isLoading}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[color:var(--theme-primary)] hover:bg-[color:var(--theme-secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${!selectedService || assignServiceMutation.isLoading ? 'opacity-75 cursor-not-allowed' : ''} transition-all`}
                  >
                    <Link2 className="-ml-1 mr-1 h-3.5 w-3.5" />
                    Assign
                  </button>
                </div>
              </div>

              {/* Error Alerts */}
              {[
                { mutation: updateSiteMutation, key: 'update', error: updateSiteMutation.error },
                { mutation: deleteSiteMutation, key: 'delete', error: deleteSiteMutation.error },
                { mutation: assignSocieteMutation, key: 'assignSociete', error: assignSocieteMutation.error },
                { mutation: unassignSocieteMutation, key: 'unassignSociete', error: unassignSocieteMutation.error },
                { mutation: assignServiceMutation, key: 'assignService', error: assignServiceMutation.error },
                { mutation: unassignServiceMutation, key: 'unassignService', error: unassignServiceMutation.error },
              ].map(({ mutation, key, error }) => (
                mutation.isError && !errorDismissed[key] && (
                  <div key={key} className="mt-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-2 flex items-start rounded-md text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5" />
                    <p className="ml-2 text-red-700 dark:text-red-300 flex-1">
                      {error?.message || "An error occurred"}
                    </p>
                    <button
                      onClick={() => dismissError(key)}
                      className="text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDetails;