import React, { useState } from "react";
import { useAllCabinets } from '../../../../services/formation';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { Search, PlusCircle, Building2, Grid, List, ArrowUpDown } from "lucide-react";

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

const CabinetList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [viewMode, setViewMode] = useState("list");
  const navigate = useNavigate();
  const { data: cabinets = [], isLoading, error } = useAllCabinets(0, 10);
  const { theme, darkMode } = useSelector((state) => state.theme);

  // Apply theme colors
  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

  // Filter cabinets based on search query
  const filteredCabinets = cabinets.filter((cabinet) =>
    `${cabinet.nom} ${cabinet.adresse} ${cabinet.tel} ${cabinet.description}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Sort cabinets based on selected sort option
  const sortedCabinets = [...filteredCabinets].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return (a.nom || "").localeCompare(b.nom || "");
      case "name-desc":
        return (b.nom || "").localeCompare(a.nom || "");
      case "date-asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "date-desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "duration-asc":
        return a.duree - b.duree;
      case "duration-desc":
        return b.duree - a.duree;
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
    navigate(`/cabinets/${id}`);
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
          .cabinet-logo {
            width: 48px;
            height: 48px;
            object-fit: contain;
            border-radius: 8px;
          }
        `}
      </style>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 transition-colors duration-300`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header and Create Cabinet Button */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-[color:var(--theme-primary)]" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mont-font">Liste des Cabinets</h1>
              </div>
              <Link
                to="/cabinets/create"
                className="flex items-center space-x-2 btn-gradient text-white px-5 py-2.5 rounded-xl font-medium mont-font hover:shadow-lg"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Créer un Cabinet
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
                  placeholder="Rechercher des cabinets par nom, adresse, téléphone, ou description..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className={`w-full pl-10 pr-4 py-2.5 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all mont-font`}
                  aria-label="Rechercher des cabinets"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <select
                    value={sortOption}
                    onChange={handleSortChange}
                    className={`border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl py-2 px-3 focus:ring-2 focus:ring-[color:var(--theme-primary)] select-focus transition-all mont-font`}
                    aria-label="Trier les cabinets"
                  >
                    <option value="name-asc">Nom (A-Z)</option>
                    <option value="name-desc">Nom (Z-A)</option>
                    <option value="date-asc">Date de Création (Ancien)</option>
                    <option value="date-desc">Date de Création (Récent)</option>
                    <option value="duration-asc">Durée (Croissant)</option>
                    <option value="duration-desc">Durée (Décroissant)</option>
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
                <p className={`text-lg mont-font ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chargement des cabinets...</p>
              </div>
            )}
            {error && (
              <div className="text-center py-8">
                <ErrorMessage message={error.message} />
              </div>
            )}

            {/* Cabinets Display */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedCabinets.length > 0 ? (
                  sortedCabinets.map((cabinet) => (
                    <div
                      key={cabinet.id}
                      onClick={() => handleCardClick(cabinet.id)}
                      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden card-hover transition-all cursor-pointer p-6`}
                    >
                      {cabinet.logo && (
                        <img
                          src={cabinet.logo}
                          alt={`${cabinet.nom} logo`}
                          className="cabinet-logo mb-3"
                        />
                      )}
                      <h5 className="text-lg font-bold text-gray-800 dark:text-gray-100 mont-font mb-3 truncate">{cabinet.nom}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2">Adresse: {cabinet.adresse || 'N/A'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2">Téléphone: {cabinet.tel || 'N/A'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2">Catalogue: {cabinet.catalogue || 'N/A'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2">Mots-clés: {cabinet.motscles || 'N/A'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mont-font mb-2 truncate">Description: {cabinet.description || 'N/A'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mont-font mb-2">Durée: {cabinet.duree} jours</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mont-font mb-3">Créé: {new Date(cabinet.createdAt).toLocaleDateString('fr-FR')}</p>
                      <div className="mt-4 flex space-x-2">
                        <Link
                          to={`/cabinets/${cabinet.id}/edit`}
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
                      <p className={`text-lg mont-font ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aucun cabinet trouvé.</p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedCabinets.length > 0 ? (
                    sortedCabinets.map((cabinet) => (
                      <div
                        key={cabinet.id}
                        onClick={() => handleCardClick(cabinet.id)}
                        className="flex items-center p-5 hover:bg-gray-50 dark:hover:bg-gray-700 card-hover transition-colors cursor-pointer"
                      >
                        {cabinet.logo && (
                          <img
                            src={cabinet.logo}
                            alt={`${cabinet.nom} logo`}
                            className="cabinet-logo mr-4"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-md font-bold text-gray-800 dark:text-gray-100 mont-font truncate">{cabinet.nom}</h5>
                            <Link
                              to={`/cabinets/${cabinet.id}/edit`}
                              className="text-green-500 hover:text-green-600 dark:hover:text-green-400 text-sm mont-font font-medium hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Modifier
                            </Link>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font">Adresse: {cabinet.adresse || 'N/A'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font">Téléphone: {cabinet.tel || 'N/A'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font">Catalogue: {cabinet.catalogue || 'N/A'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font">Mots-clés: {cabinet.motscles || 'N/A'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mont-font truncate">Description: {cabinet.description || 'N/A'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mont-font">Durée: {cabinet.duree} jours</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mont-font">Créé: {new Date(cabinet.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    !isLoading && (
                      <div className="text-center py-8">
                        <p className={`text-lg mont-font ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aucun cabinet trouvé.</p>
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

export default CabinetList;