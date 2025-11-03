import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateSociete } from "../../../services/hooks";
import { 
  ArrowLeft, 
  Building2 as Building, 
  MapPin, 
  Save, 
  Briefcase, 
  X 
} from "lucide-react";

const CreateSociete = () => {
  const navigate = useNavigate();
  const createSociete = useCreateSociete();
  const { theme, darkMode } = useSelector((state) => state.theme);
  const [formData, setFormData] = useState({
    name: "",
    adresse: "",
    type: ""
  });
  const [errorDismissed, setErrorDismissed] = useState(false);

  // Theme color mapping based on Navbar's theme settings
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

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createSociete.mutate(formData, {
      onSuccess: () => {
        navigate("/societe");
      }
    });
  };

  const handleDismissError = () => {
    setErrorDismissed(true);
  };

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
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/societe")}
              className={`flex items-center text-[color:var(--theme-primary)] hover:text-[color:var(--theme-secondary)] dark:text-[color:var(--theme-primary)] dark:hover:text-[color:var(--theme-secondary)] transition-colors`}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Companies
            </button>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Create New Company</h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>

          {/* Form Card */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden ${createSociete.isLoading ? 'opacity-75 pointer-events-none' : ''}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Building className="h-6 w-6 text-[color:var(--theme-primary)] mr-2" />
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Company Information</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Name Field */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Company Name
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                      required
                    />
                  </div>
                </div>

                {/* Type Field */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Company Type
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="MAGASIN">Magasin</option>
                      <option value="SIEGE">Siege</option>
                      <option value="SUBSIDIARY">Subsidiary</option>
                      <option value="PARTNER">Partner</option>
                    </select>
                  </div>
                </div>

                {/* Address Field */}
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Address
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/societe")}
                  className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium ${darkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-white hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)]`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSociete.isLoading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[color:var(--theme-primary)] hover:bg-[color:var(--theme-secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${createSociete.isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {createSociete.isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      Create Company
                    </>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {createSociete.isError && !errorDismissed && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 0 001.414-1.414L11.414 10l1.293-1.293a1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Error creating company: {createSociete.error?.message || "Unknown error occurred"}
                    </p>
                  </div>
                  <button
                    onClick={handleDismissError}
                    className="ml-2 text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSociete;