import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAllProgrammes } from '../../../../services/formation';
import { Search, PlusCircle, Calendar, Grid, List, ArrowUpDown } from "lucide-react";
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

// Theme color mapping from Navbar
const themeColors = {
  red: { primary: '#ff3b30', secondary: '#ff2d55', bgLight: '#fef2f2', bgDark: '#3f0a0a', textLight: '#1f2937', textDark: '#f3f4f6', border: '#344054' },
  green: { primary: '#4cd964', secondary: '#34c759', bgLight: '#f0fdf4', bgDark: '#052e16', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  blue: { primary: '#132977', secondary: '#007aff', bgLight: '#eff6ff', bgDark: '#1e3a8a', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  pink: { primary: '#ff2d55', secondary: '#ff69b4', bgLight: '#fff1f2', bgDark: '#3f0713', textLight: '#1f2937', textDark: '#f3f4f6', border: '#344054' },
  yellow: { primary: '#ffcc00', secondary: '#ff9500', bgLight: '#fefce8', bgDark: '#3f2c00', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  orange: { primary: '#ff9500', secondary: '#ff7f50', bgLight: '#fff7eb', bgDark: '#3f2d0f', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  gray: { primary: '#8e8e93', secondary: '#a9a9a9', bgLight: '#f9fafb', bgDark: '#374151', textLight: '#1f2937', textDark: '#d1d5db', border: '#344054' },
  brown: { primary: '#D2691E', secondary: '#8B4513', bgLight: '#fef7e7', bgDark: '#2f1c0a', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  darkgreen: { primary: '#228B22', secondary: '#006400', bgLight: '#f0fdf4', bgDark: '#092e16', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  deeppink: { primary: '#FFC0CB', secondary: '#FF69B4', bgLight: '#fff1f2', bgDark: '#3f0f1e', textLight: '#1f2937', textDark: '#f3f4f6', border: '#344054' },
  cadetblue: { primary: '#5f9ea0', secondary: '#4682b4', bgLight: '#f0f9ff', bgDark: '#1c2f3a', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  darkorchid: { primary: '#9932cc', secondary: '#9400d3', bgLight: '#f5f3ff', bgDark: '#2e1a3f', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
};

const ProgrammeList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("titre-asc");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();
  const { data: programmes = [], isLoading, error } = useAllProgrammes();
  const { theme, darkMode } = useSelector((state) => state.theme);

  // Apply theme colors
  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

  // Filter programmes based on search query
  const filteredProgrammes = programmes.filter((programme) =>
    `${programme.titre} ${programme.duree} ${programme.nbrdheureparjour}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Sort programmes based on selected sort option
  const sortedProgrammes = [...filteredProgrammes].sort((a, b) => {
    switch (sortOption) {
      case "titre-asc":
        return (a.titre || "").localeCompare(b.titre || "");
      case "titre-desc":
        return (b.titre || "").localeCompare(a.titre || "");
      case "duree-asc":
        return (a.duree || 0) - (b.duree || 0);
      case "duree-desc":
        return (b.duree || 0) - (a.duree || 0);
      case "hours-asc":
        return (a.nbrdheureparjour || 0) - (b.nbrdheureparjour || 0);
      case "hours-desc":
        return (b.nbrdheureparjour || 0) - (a.nbrdheureparjour || 0);
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

  const handleCardClick = (id) => {
    navigate(`/programmes/${id}`);
  };

  return (
    <div className={`main-content mont-font ${darkMode ? 'theme-dark' : 'bg-lightblue'} right-chat-active`} style={{ marginTop: '80px' }}>
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
            --theme-bg: ${darkMode ? themeColors[theme]?.bgDark || '#374151' : themeColors[theme]?.bgLight || '#f9fafb'};
            --theme-text: ${darkMode ? themeColors[theme]?.textDark || '#d1d5db' : themeColors[theme]?.textLight || '#1f2937'};
            --theme-border: ${themeColors[theme]?.border || '#344054'};
          }
          .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            border-image: linear-gradient(45deg, var(--theme-primary), var(--theme-secondary)) 1;
          }
          .btn-gradient {
            background: linear-gradient(45deg, var(--theme-primary), var(--theme-secondary));
            transition: all 0.3s ease;
          }
          .btn-gradient:hover {
            background: linear-gradient(45deg, var(--theme-secondary), var(--theme-primary));
            transform: translateY(-2px);
          }
          .select-focus:focus {
            box-shadow: 0 0 0 3px rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.5);
          }
        `}
      </style>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 transition-colors duration-300`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header and Create Programme Button */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-[color:var(--theme-primary)]" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mont-font">Liste des Programmes</h1>
              </div>
              <Link
                to="/programmes/create"
                className="flex items-center space-x-2 btn-gradient text-white px-5 py-2.5 rounded-xl font-medium mont-font hover:shadow-lg"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Créer un Programme
              </Link>
            </div>

            {/* Search Bar and Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <div className="relative w-full sm:w-1/2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher des programmes par titre, durée ou heures par jour..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className={`w-full pl-10 pr-4 py-2.5 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all mont-font`}
                  aria-label="Rechercher des programmes"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <select
                    value={sortOption}
                    onChange={handleSortChange}
                    className={`border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl py-2 px-3 focus:ring-2 focus:ring-[color:var(--theme-primary)] select-focus transition-all mont-font`}
                    aria-label="Trier les programmes"
                  >
                    <option value="titre-asc">Titre (A-Z)</option>
                    <option value="titre-desc">Titre (Z-A)</option>
                    <option value="duree-asc">Durée (Croissant)</option>
                    <option value="duree-desc">Durée (Décroissant)</option>
                    <option value="hours-asc">Heures par jour (Croissant)</option>
                    <option value="hours-desc">Heures par jour (Décroissant)</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewModeChange("grid")}
                    className={`p-2 rounded-xl ${viewMode === "grid" ? "bg-[color:var(--theme-primary)] text-white" : darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-600"} hover:bg-[color:var(--theme-secondary)] transition-colors`}
                    title="Vue en grille"
                    aria-label="Vue en grille"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange("list")}
                    className={`p-2 rounded-xl ${viewMode === "list" ? "bg-[color:var(--theme-primary)] text-white" : darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-600"} hover:bg-[color:var(--theme-secondary)] transition-colors`}
                    title="Vue en liste"
                    aria-label="Vue en liste"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading & Error Handling */}
            {isLoading && (
              <div className="text-center py-8">
                <p className={`text-lg mont-font ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chargement des programmes...</p>
              </div>
            )}
            {error && (
              <div className="text-center py-8">
                <ErrorMessage message={error.message} />
              </div>
            )}

            {/* Programmes Display */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedProgrammes.length > 0 ? (
                  sortedProgrammes.map((programme) => (
                    <div
                      key={programme.id}
                      onClick={() => handleCardClick(programme.id)}
                      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden card-hover transition-all cursor-pointer p-6`}
                    >
                      <h5 className="text-lg font-bold text-gray-800 dark:text-gray-100 mont-font mb-3 truncate">
                        {programme.titre || `Programme ${programme.id}`}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2">Durée: {programme.duree ? `${programme.duree} heures` : 'N/A'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2">Heures par jour: {programme.nbrdheureparjour ? `${programme.nbrdheureparjour} h/jour` : 'N/A'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2">Heure de début: {programme.heuredebut || 'N/A'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2">Heure de fin: {programme.heurefin || 'N/A'}</p>
                      <div className="mt-4 flex space-x-2">
                        <Link
                          to={`/programmes/${programme.id}/edit`}
                          className="text-green-500 hover:text-green-600 dark:hover:text-green-400 text-sm mont-font font-medium hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Modifier
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  !isLoading && (
                    <div className="col-span-full text-center py-8">
                      <p className={`text-lg mont-font ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aucun programme trouvé.</p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedProgrammes.length > 0 ? (
                    sortedProgrammes.map((programme) => (
                      <div
                        key={programme.id}
                        onClick={() => handleCardClick(programme.id)}
                        className="flex items-center p-5 hover:bg-gray-50 dark:hover:bg-gray-700 card-hover transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-md font-bold text-gray-800 dark:text-gray-100 mont-font truncate">
                              {programme.titre || `Programme ${programme.id}`}
                            </h5>
                            <Link
                              to={`/programmes/${programme.id}/edit`}
                              className="text-green-500 hover:text-green-600 dark:hover:text-green-400 text-sm mont-font font-medium hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Modifier
                            </Link>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font">Durée: {programme.duree ? `${programme.duree} heures` : 'N/A'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font">Heures par jour: {programme.nbrdheureparjour ? `${programme.nbrdheureparjour} h/jour` : 'N/A'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font">Heure de début: {programme.heuredebut || 'N/A'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font">Heure de fin: {programme.heurefin || 'N/A'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    !isLoading && (
                      <div className="text-center py-8">
                        <p className={`text-lg mont-font ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aucun programme trouvé.</p>
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

export default ProgrammeList;