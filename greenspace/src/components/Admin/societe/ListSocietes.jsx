import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useSocietes } from "../../../services/hooks";
import { useNavigate } from "react-router-dom";
import { 
  Building2 as Building, 
  MapPin, 
  PlusCircle, 
  Search, 
  Grid, 
  List, 
  ArrowUpDown 
} from "lucide-react";

const ListSocietes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [viewMode, setViewMode] = useState("grid");
  const { data: societes = [], isLoading, isError, error } = useSocietes();
  const navigate = useNavigate();
  const { theme, darkMode } = useSelector((state) => state.theme);

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

  // Filter companies based on search query
  const filteredSocietes = societes.filter((societe) =>
    `${societe.name} ${societe.adresse} ${societe.type}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Sort companies based on selected sort option
  const sortedSocietes = [...filteredSocietes].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "type-asc":
        return a.type.localeCompare(b.type);
      case "type-desc":
        return b.type.localeCompare(a.type);
      case "date-asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "date-desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleSocieteClick = (id) => {
    navigate(`/societe/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[color:var(--theme-primary)]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 0 001.414-1.414L11.414 10l1.293-1.293a1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">
                Error: {error?.message || "Failed to load companies"}
              </p>
            </div>
          </div>
        </div>
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
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header and Create Company Button */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <Building className="w-8 h-8 text-[color:var(--theme-primary)]" />
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Companies List
                </h1>
              </div>
              <button
                onClick={() => navigate("/create-societe")}
                className="flex items-center space-x-2 bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add New Company</span>
              </button>
            </div>

            {/* Search Bar and Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <div className="relative w-full sm:w-1/2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search companies by name, address, or type..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <select
                    value={sortOption}
                    onChange={handleSortChange}
                    className={`border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="type-asc">Type (A-Z)</option>
                    <option value="type-desc">Type (Z-A)</option>
                    <option value="date-asc">Created (Oldest)</option>
                    <option value="date-desc">Created (Newest)</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewModeChange("grid")}
                    className={`p-2 rounded-lg ${viewMode === "grid" ? 'bg-[color:var(--theme-primary)] text-white' : 'bg-gray-200 text-gray-600'} hover:bg-[color:var(--theme-secondary)] transition-colors`}
                    title="Grid View"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange("list")}
                    className={`p-2 rounded-lg ${viewMode === "list" ? 'bg-[color:var(--theme-primary)] text-white' : 'bg-gray-200 text-gray-600'} hover:bg-[color:var(--theme-secondary)] transition-colors`}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading & Error Handling */}
            {(isLoading) && (
              <div className="text-center py-6">
                <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-400' : ''}`}>Loading companies...</p>
              </div>
            )}
            {(isError) && (
              <div className="text-center py-6">
                <p className="text-red-600 dark:text-red-400">{error?.message || "Failed to load companies"}</p>
              </div>
            )}

            {/* Companies Display */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedSocietes.length > 0 ? (
                  sortedSocietes.map((societe) => (
                    <div
                      key={societe.id}
                      onClick={() => handleSocieteClick(societe.id)}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl cursor-pointer"
                    >
                      <div className="p-6 text-center">
                        {/* Company Icon */}
                        <div className="relative inline-block mb-4">
                          <div className="p-4 bg-[color:var(--theme-primary)]/10 rounded-full">
                            <Building className="w-12 h-12 text-[color:var(--theme-primary)]" />
                          </div>
                        </div>

                        {/* Company Info */}
                        <h5 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>
                          {societe.name}
                        </h5>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2 flex items-center justify-center`}>
                          <MapPin className="w-4 h-4 mr-1" />
                          {societe.adresse}
                        </p>
                        <div className="text-xs mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[color:var(--theme-primary)]/10 text-[color:var(--theme-primary)]`}>
                            {societe.type}
                          </span>
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                          Created: {new Date(societe.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  !isLoading && (
                    <div className="col-span-full text-center py-6">
                      <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-400' : ''}`}>No companies found.</p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedSocietes.length > 0 ? (
                    sortedSocietes.map((societe) => (
                      <div
                        key={societe.id}
                        onClick={() => handleSocieteClick(societe.id)}
                        className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="p-3 bg-[color:var(--theme-primary)]/10 rounded-full">
                            <Building className="w-8 h-8 text-[color:var(--theme-primary)]" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h5 className={`text-md font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {societe.name}
                          </h5>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                            <MapPin className="w-4 h-4 mr-1" />
                            {societe.adresse}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Type: <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[color:var(--theme-primary)]/10 text-[color:var(--theme-primary)]`}>
                              {societe.type}
                            </span>
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Created: {new Date(societe.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    !isLoading && (
                      <div className="text-center py-6">
                        <p className={`text-gray-600 ${darkMode ? 'text-gray-400' : ''}`}>No companies found.</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListSocietes;