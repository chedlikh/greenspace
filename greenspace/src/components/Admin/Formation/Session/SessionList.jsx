import React, { useState } from "react";
import { useAllSessionsWithoutSort } from '../../../../services/formation';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { Search, PlusCircle, Calendar, Grid, List, ArrowUpDown, Image, FileText } from "lucide-react";

// Theme color mapping from Navbar
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

const SessionList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("date-asc");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();
  const { data: sessions = [], isLoading, error } = useAllSessionsWithoutSort();
  const { theme, darkMode } = useSelector((state) => state.theme);

  // Apply theme colors
  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

  // Filter sessions based on search query, including theme
  const filteredSessions = sessions.filter((session) =>
    `${session.datedebut} ${session.mode} ${session.prix} ${session.theme}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Sort sessions based on selected sort option
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    switch (sortOption) {
      case "date-asc":
        return new Date(a.datedebut) - new Date(b.datedebut);
      case "date-desc":
        return new Date(b.datedebut) - new Date(a.datedebut);
      case "price-asc":
        return (a.prix || 0) - (b.prix || 0);
      case "price-desc":
        return (b.prix || 0) - (a.prix || 0);
      case "mode-asc":
        return (a.mode || "").localeCompare(b.mode || "");
      case "mode-desc":
        return (b.mode || "").localeCompare(a.mode || "");
      case "theme-asc":
        return (a.theme || "").localeCompare(b.theme || "");
      case "theme-desc":
        return (b.theme || "").localeCompare(a.theme || "");
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
    navigate(`/sessions/${id}`);
  };

  // Helper function to render affiche content
  const renderAffiche = (affiche) => {
    if (!affiche) return <span className="text-gray-600 dark:text-gray-400 mont-font">Aucune affiche</span>;
    
    if (affiche.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return (
        <img
          src={affiche}
          alt="Session Affiche"
          className="w-20 h-20 object-cover rounded-md"
          onError={(e) => (e.target.parentNode.innerHTML = '<span className="text-gray-600 dark:text-gray-400 mont-font">Erreur de chargement</span>')}
        />
      );
    } else if (affiche.match(/\.pdf$/i)) {
      return (
        <a
          href={affiche}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mont-font"
        >
          <FileText className="w-5 h-5 mr-1" />
          Voir le PDF
        </a>
      );
    }
    return <span className="text-gray-600 dark:text-gray-400 mont-font">Format non supporté</span>;
  };

  return (
    <div className={`main-content mont-font ${darkMode ? 'theme-dark' : 'bg-lightblue'} right-chat-active`} style={{ marginTop: '80px' }}>
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
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
            {/* Header and Create Session Button */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-[color:var(--theme-primary)]" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mont-font">Liste des Sessions</h1>
              </div>
              <Link
                to="/sessions/create"
                className="flex items-center space-x-2 btn-gradient text-white px-5 py-2.5 rounded-xl font-medium mont-font hover:shadow-lg"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Créer une Session
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
                  placeholder="Rechercher des sessions par date, mode, prix ou thème..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className={`w-full pl-10 pr-4 py-2.5 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all mont-font`}
                  aria-label="Rechercher des sessions"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <select
                    value={sortOption}
                    onChange={handleSortChange}
                    className={`border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl py-2 px-3 focus:ring-2 focus:ring-[color:var(--theme-primary)] select-focus transition-all mont-font`}
                    aria-label="Trier les sessions"
                  >
                    <option value="date-asc">Date (Croissant)</option>
                    <option value="date-desc">Date (Décroissant)</option>
                    <option value="price-asc">Prix (Croissant)</option>
                    <option value="price-desc">Prix (Décroissant)</option>
                    <option value="mode-asc">Mode (A-Z)</option>
                    <option value="mode-desc">Mode (Z-A)</option>
                    <option value="theme-asc">Thème (A-Z)</option>
                    <option value="theme-desc">Thème (Z-A)</option>
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
                <LoadingSpinner />
                <p className={`text-lg mont-font ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chargement des sessions...</p>
              </div>
            )}
            {error && (
              <div className="text-center py-8">
                <ErrorMessage message={error.message} />
              </div>
            )}

            {/* Sessions Display */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedSessions.length > 0 ? (
                  sortedSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleCardClick(session.id)}
                      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden card-hover transition-all cursor-pointer p-6`}
                    >
                      <div className="mb-3">{renderAffiche(session.affiche)}</div>
                      <h5 className="text-lg font-bold text-gray-800 dark:text-gray-100 mont-font mb-3 truncate">
                        {session.theme || `Session du ${new Date(session.datedebut).toLocaleDateString('fr-FR')}`}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2">Prix: {session.prix || 0} €</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2">Mode: {session.mode || 'N/A'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2">Date de début: {new Date(session.datedebut).toLocaleDateString('fr-FR')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2">Date de fin: {session.datefin ? new Date(session.datefin).toLocaleDateString('fr-FR') : 'N/A'}</p>
                      <div className="mt-4 flex space-x-2">
                        <Link
                          to={`/sessions/${session.id}/edit`}
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
                      <p className={`text-lg mont-font ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aucune session trouvée.</p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedSessions.length > 0 ? (
                    sortedSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleCardClick(session.id)}
                        className="flex items-center p-5 hover:bg-gray-50 dark:hover:bg-gray-700 card-hover transition-colors cursor-pointer"
                      >
                        <div className="w-20 mr-4">{renderAffiche(session.affiche)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-md font-bold text-gray-800 dark:text-gray-100 mont-font truncate">
                              {session.theme || `Session du ${new Date(session.datedebut).toLocaleDateString('fr-FR')}`}
                            </h5>
                            <Link
                              to={`/sessions/${session.id}/edit`}
                              className="text-green-500 hover:text-green-600 dark:hover:text-green-400 text-sm mont-font font-medium hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Modifier
                            </Link>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font">Prix: {session.prix || 0} €</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font">Mode: {session.mode || 'N/A'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font">Date de début: {new Date(session.datedebut).toLocaleDateString('fr-FR')}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font">Date de fin: {session.datefin ? new Date(session.datefin).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    !isLoading && (
                      <div className="text-center py-8">
                        <p className={`text-lg mont-font ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aucune session trouvée.</p>
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

export default SessionList;