
import React from "react";
import { useSites, useSocietes } from "../../../services/hooks";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Building2, Plus, AlertTriangle } from "lucide-react";

const ListSites = () => {
  const { data: sites = [], isLoading: sitesLoading, isError: sitesError, error: sitesErrorData } = useSites();
  const { data: societes = [], isLoading: societesLoading, isError: societesError, error: societesErrorData } = useSocietes();
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

  // Group sites by société
  const groupedSites = societes.reduce((acc, societe) => {
    acc[societe.id] = sites.filter((site) => site.societe?.id === societe.id);
    return acc;
  }, {});
  const standaloneSites = sites.filter((site) => !site.societe);

  const handleSiteClick = (id) => {
    navigate(`/site/${id}`);
  };

  if (sitesLoading || societesLoading) {
    return (
      <div className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[color:var(--theme-primary)]"></div>
      </div>
    );
  }

  if (sitesError || societesError) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-2xl max-w-3xl mx-auto`}>
        <AlertTriangle className="text-red-500 w-16 h-16 mb-4" />
        <p className={`text-red-600 dark:text-red-300 text-lg font-semibold text-center`}>
          Error: {sitesErrorData?.message || societesErrorData?.message || "Unknown error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="main-content right-chat-active" style={{ marginTop: '80px' }}>
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
          }
        `}
      </style>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4 py-8 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Sites Management
            </h1>
            <button
              onClick={() => navigate("/create-site")}
              className={`flex items-center space-x-2 bg-[color:var(--theme-primary)] text-white hover:bg-[color:var(--theme-secondary)] px-5 py-2.5 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] shadow-sm`}
            >
              <Plus className="w-5 h-5" />
              <span>Create New Site</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {societes.map((societe) => (
              <div
                key={societe.id}
                className={`rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}
              >
                <div className={`p-6 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                  <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center space-x-2`}>
                    <Building2 className="w-5 h-5 text-[color:var(--theme-primary)]" />
                    <span>{societe.name || "Société " + societe.id}</span>
                  </h2>
                </div>
                <div className="p-6">
                  {groupedSites[societe.id]?.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {groupedSites[societe.id].map((site) => (
                        <div
                          key={site.id}
                          onClick={() => handleSiteClick(site.id)}
                          className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-200 bg-white hover:bg-gray-50'} cursor-pointer transition-all shadow-sm hover:shadow-md`}
                        >
                          <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-1`}>
                            {site.nom || "N/A"}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {site.adresse || "No address"}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Type: {site.type || "N/A"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
                      No sites assigned to this société.
                    </p>
                  )}
                </div>
              </div>
            ))}
            {standaloneSites.length > 0 && (
              <div
                className={`rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}
              >
                <div className={`p-6 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                  <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center space-x-2`}>
                    <Building2 className="w-5 h-5 text-[color:var(--theme-primary)]" />
                    <span>Sites Without Société</span>
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {standaloneSites.map((site) => (
                      <div
                        key={site.id}
                        onClick={() => handleSiteClick(site.id)}
                        className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-200 bg-white hover:bg-gray-50'} cursor-pointer transition-all shadow-sm hover:shadow-md`}
                      >
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-1`}>
                          {site.nom || "N/A"}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {site.adresse || "No address"}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Type: {site.type || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* No Data State */}
            {societes.length === 0 && standaloneSites.length === 0 && (
              <div className={`text-center p-12 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <Building2 className={`mx-auto w-16 h-16 mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  No sites or sociétés found. Create your first site!
                </p>
                <button
                  onClick={() => navigate("/create-site")}
                  className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white bg-[color:var(--theme-primary)] hover:bg-[color:var(--theme-secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] shadow-sm`}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Site
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListSites;
