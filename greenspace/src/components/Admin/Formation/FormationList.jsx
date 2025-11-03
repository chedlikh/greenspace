import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAllFormations } from "../../../services/formation";
import { Search, Plus, Grid, List, ArrowUpDown, Book } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

// Theme color mapping with dark mode support
const themeColors = {
  red: {
    primary: "#ff3b30",
    secondary: "#ff2d55",
    bgLight: "#fef2f2",
    bgDark: "#3f0a0a",
    textLight: "#1f2937",
    textDark: "#f3f4f6",
    borderLight: "#d1d5db",
    borderDark: "#4b5563",
  },
  green: {
    primary: "#4cd964",
    secondary: "#34c759",
    bgLight: "#f0fdf4",
    bgDark: "#052e16",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    borderLight: "#d1d5db",
    borderDark: "#4b5563",
  },
  blue: {
    primary: "#132977",
    secondary: "#007aff",
    bgLight: "#eff6ff",
    bgDark: "#1e3a8a",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    borderLight: "#d1d5db",
    borderDark: "#4b5563",
  },
  pink: {
    primary: "#ff2d55",
    secondary: "#ff69b4",
    bgLight: "#fff1f2",
    bgDark: "#3f0713",
    textLight: "#1f2937",
    textDark: "#f3f4f6",
    borderLight: "#d1d5db",
    borderDark: "#4b5563",
  },
  yellow: {
    primary: "#ffcc00",
    secondary: "#ff9500",
    bgLight: "#fefce8",
    bgDark: "#3f2c00",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    borderLight: "#d1d5db",
    borderDark: "#4b5563",
  },
  orange: {
    primary: "#ff9500",
    secondary: "#ff7f50",
    bgLight: "#fff7ed",
    bgDark: "#3f2d0f",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    borderLight: "#d1d5db",
    borderDark: "#4b5563",
  },
  gray: {
    primary: "#8e8e93",
    secondary: "#a9a9a9",
    bgLight: "#f9fafb",
    bgDark: "#374151",
    textLight: "#1f2937",
    textDark: "#d1d5db",
    borderLight: "#d1d5db",
    borderDark: "#4b5563",
  },
  brown: {
    primary: "#D2691E",
    secondary: "#8B4513",
    bgLight: "#fef7ed",
    bgDark: "#2f1c0a",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    borderLight: "#d1d5db",
    borderDark: "#4b5563",
  },
  darkgreen: {
    primary: "#228B22",
    secondary: "#006400",
    bgLight: "#f0fdf4",
    bgDark: "#092709",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    borderLight: "#d1d5db",
    borderDark: "#4b5563",
  },
  deeppink: {
    primary: "#FFC0CB",
    secondary: "#FF69B4",
    bgLight: "#fff1f2",
    bgDark: "#3f0b1e",
    textLight: "#1f2937",
    textDark: "#f3f4f6",
    borderLight: "#d1d5db",
    borderDark: "#4b5563",
  },
  cadetblue: {
    primary: "#5f9ea0",
    secondary: "#4682b4",
    bgLight: "#f0f9ff",
    bgDark: "#1c2f3a",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    borderLight: "#d1d5db",
    borderDark: "#4b5563",
  },
  darkorchid: {
    primary: "#9932cc",
    secondary: "#9400d3",
    bgLight: "#f5f3ff",
    bgDark: "#2e1a3f",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    borderLight: "#d1d5db",
    borderDark: "#4b5563",
  },
};

// Status badge color mapping
const statusColors = {
  COMING_SOON: {
    bg: "#fef3c7",
    text: "#b45309",
    bgDark: "#78350f",
    textDark: "#fef3c7",
  },
  ACTIVE: {
    bg: "#d1fae5",
    text: "#047857",
    bgDark: "#064e3b",
    textDark: "#d1fae5",
  },
  COMPLETED: {
    bg: "#e5e7eb",
    text: "#4b5563",
    bgDark: "#4b5563",
    textDark: "#e5e7eb",
  },
  CANCELLED: {
    bg: "#fee2e2",
    text: "#b91c1c",
    bgDark: "#7f1d1d",
    textDark: "#fee2e2",
  },
  UNKNOWN: {
    bg: "#e0e7ff",
    text: "#3730a3",
    bgDark: "#312e81",
    textDark: "#e0e7ff",
  },
};

const FormationCard = ({ formation, onClick, darkMode, theme }) => {
  const [activeImage, setActiveImage] = useState(0);
  const images = formation.affiche ? formation.affiche.split(",") : [];
  const objectives = formation.objectif ? formation.objectif.split(";") : [];
  const benefits = formation.apport ? formation.apport.split(";") : [];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const primaryColor = themeColors[theme]?.primary || "#4cd964";
  const secondaryColor = themeColors[theme]?.secondary || "#34c759";

  const getStatusBadgeStyles = (status) => {
    const statusKey = status || "UNKNOWN";
    const colors = statusColors[statusKey] || statusColors.UNKNOWN;
    return {
      backgroundColor: darkMode ? colors.bgDark : colors.bg,
      color: darkMode ? colors.textDark : colors.text,
    };
  };

  // Calculate counts (assuming formation data includes related arrays or counts)
  const cabinetsCount = formation.cabinets?.length || formation.cabinetsCount || 0;
  const sessionsCount = formation.sessions?.length || formation.sessionsCount || 0;
  const programmesCount = formation.programmes?.length || formation.programmesCount || 0;
  const formateursCount = formation.formateurs?.length || formation.formateursCount || 0;

  return (
    <div
      onClick={onClick}
      className={`shadow-sm rounded-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${
        darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
      }`}
    >
      <div className="p-4">
        {images.length > 0 && (
          <div className="relative h-48 bg-gray-200 mb-4">
            <img
              src={images[activeImage]?.trim() || "/api/placeholder/400/300"}
              alt={formation.titre || "Formation"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/api/placeholder/400/300";
                e.target.onerror = null;
              }}
            />
            {images.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage(index);
                    }}
                    className={`w-2 h-2 rounded-full ${activeImage === index ? "bg-white" : "bg-gray-400"}`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between items-start mb-4">
          <h5 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} truncate`}>
            {formation.titre || "Unnamed Formation"}
          </h5>
          <span
            className="inline-block px-2 py-1 rounded-full text-xs font-medium"
            style={getStatusBadgeStyles(formation.status)}
          >
            {formation.status?.replace(/_/g, " ") || "Unknown"}
          </span>
        </div>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-4 line-clamp-2`}>
          {formation.description || "No description available"}
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div>
            <p className={`text-${darkMode ? "gray-500" : "gray-600"}`}>Start Date</p>
            <p className="font-medium">{formatDate(formation.datedebut)}</p>
          </div>
          <div>
            <p className={`text-${darkMode ? "gray-500" : "gray-600"}`}>End Date</p>
            <p className="font-medium">{formatDate(formation.datefin)}</p>
          </div>
          <div>
            <p className={`text-${darkMode ? "gray-500" : "gray-600"}`}>Duration</p>
            <p className="font-medium">{formation.duree || 0} hours</p>
          </div>
          <div>
            <p className={`text-${darkMode ? "gray-500" : "gray-600"}`}>Mode</p>
            <p className="font-medium">{formation.mode || "N/A"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div>
            <p className={`text-${darkMode ? "gray-500" : "gray-600"}`}>Cabinets</p>
            <p className="font-medium">{cabinetsCount}</p>
          </div>
          <div>
            <p className={`text-${darkMode ? "gray-500" : "gray-600"}`}>Sessions</p>
            <p className="font-medium">{sessionsCount}</p>
          </div>
          <div>
            <p className={`text-${darkMode ? "gray-500" : "gray-600"}`}>Programmes</p>
            <p className="font-medium">{programmesCount}</p>
          </div>
          <div>
            <p className={`text-${darkMode ? "gray-500" : "gray-600"}`}>Formateurs</p>
            <p className="font-medium">{formateursCount}</p>
          </div>
        </div>
        <div className="mb-4">
          <p className={`text-lg font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
            ${formation.prix?.toLocaleString() || "N/A"}
          </p>
        </div>
        {objectives.length > 0 && (
          <div className="mb-4">
            <h3 className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}>Objectives:</h3>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} line-clamp-1`}>
              {objectives.join(", ")}
            </p>
          </div>
        )}
        {benefits.length > 0 && (
          <div className="mb-4">
            <h3 className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}>Benefits:</h3>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} line-clamp-1`}>
              {benefits.join(", ")}
            </p>
          </div>
        )}
        <div className="flex justify-between items-center pt-4 border-t border-[color:var(--theme-border)]">
          <div className="space-x-2">
            <button
              onClick={onClick}
              className="text-xs bg-[color:var(--theme-primary)] text-white px-3 py-1 rounded-full hover:bg-[color:var(--theme-secondary)] transition-colors"
            >
              View Details
            </button>
            <Link
              to={`/formations/${formation.id}/edit`}
              className="text-xs bg-gray-500 text-white px-3 py-1 rounded-full hover:bg-gray-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Edit
            </Link>
          </div>
          <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {formation.type || "Unknown"} Course
          </span>
        </div>
      </div>
    </div>
  );
};

const FormationList = () => {
  const navigate = useNavigate();
  const { theme, darkMode } = useSelector((state) => state.theme);
  const { data: formations = [], isLoading, error } = useAllFormations(0, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("titre-asc");
  const [viewMode, setViewMode] = useState("grid");

  // Memoized filtering
  const filteredFormations = useMemo(() => {
    return formations.filter((formation) =>
      `${formation.titre || ""} ${formation.description || ""} ${formation.objectif || ""} ${
        formation.apport || ""
      }`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [formations, searchQuery]);

  // Memoized sorting
  const sortedFormations = useMemo(() => {
    return [...filteredFormations].sort((a, b) => {
      switch (sortOption) {
        case "titre-asc":
          return (a.titre || "").localeCompare(b.titre || "");
        case "titre-desc":
          return (b.titre || "").localeCompare(a.titre || "");
        case "start-date-asc":
          return new Date(a.datedebut || "1970-01-01") - new Date(b.datedebut || "1970-01-01");
        case "start-date-desc":
          return new Date(b.datedebut || "1970-01-01") - new Date(a.datedebut || "1970-01-01");
        case "end-date-asc":
          return new Date(a.datefin || "1970-01-01") - new Date(b.datefin || "1970-01-01");
        case "end-date-desc":
          return new Date(b.datefin || "1970-01-01") - new Date(a.datefin || "1970-01-01");
        default:
          return 0;
      }
    });
  }, [filteredFormations, sortOption]);

  // Handlers
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleFormationClick = (id, e) => {
    e.stopPropagation();
    navigate(`/formations/${id}`);
  };

  // Theme colors
  const primaryColor = themeColors[theme]?.primary || "#4cd964";
  const secondaryColor = themeColors[theme]?.secondary || "#34c759";
  const bgColor = darkMode ? themeColors[theme]?.bgDark : themeColors[theme]?.bgLight;
  const textColor = darkMode ? themeColors[theme]?.textDark : themeColors[theme]?.textLight;
  const borderColor = darkMode ? themeColors[theme]?.borderDark : themeColors[theme]?.borderLight;

  // Status badge styles
  const getStatusBadgeStyles = (status) => {
    const statusKey = status || "UNKNOWN";
    const colors = statusColors[statusKey] || statusColors.UNKNOWN;
    return {
      backgroundColor: darkMode ? colors.bgDark : colors.bg,
      color: darkMode ? colors.textDark : colors.text,
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`min-h-screen p-6 flex justify-center items-center ${
          darkMode
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"
            : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
        }`}
        style={{ marginTop: "80px", marginLeft: "250px" }}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[color:var(--theme-primary)]"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`min-h-screen p-6 flex flex-col items-center justify-center ${
          darkMode
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"
            : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
        }`}
        style={{ marginTop: "80px", marginLeft: "250px" }}
      >
        <p className={`text-lg font-semibold ${darkMode ? "text-red-400" : "text-red-600"}`}>
          Error loading formations: {error.message || "Unknown error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      }`}
      style={{ marginTop: "80px", marginLeft: "250px" }}
    >
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
            --theme-bg: ${bgColor};
            --theme-text: ${textColor};
            --theme-border: ${borderColor};
          }
        `}
      </style>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header and Create Formation Button */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <Book className={`w-8 h-8 ${darkMode ? "text-gray-200" : "text-[color:var(--theme-primary)]"}`} />
              <h1 className={`text-2xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                Training Programs
              </h1>
            </div>
            <button
              onClick={() => navigate("/formations/create")}
              className="flex items-center space-x-2 bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Training</span>
            </button>
          </div>

          {/* Search Bar and Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="relative w-full sm:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
              </div>
              <input
                type="text"
                placeholder="Search formations by title, description, or objectives..."
                value={searchQuery}
                onChange={handleSearch}
                aria-label="Search formations"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                  darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                <select
                  value={sortOption}
                  onChange={handleSortChange}
                  className={`border rounded-lg py-2 px-3 focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                    darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="titre-asc">Title (A-Z)</option>
                  <option value="titre-desc">Title (Z-A)</option>
                  <option value="start-date-asc">Start Date (Oldest First)</option>
                  <option value="start-date-desc">Start Date (Newest First)</option>
                  <option value="end-date-asc">End Date (Oldest First)</option>
                  <option value="end-date-desc">End Date (Newest First)</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-[color:var(--theme-primary)] text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  } transition-colors`}
                  title="Grid View"
                  aria-pressed={viewMode === "grid"}
                  aria-label="Switch to grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleViewModeChange("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-[color:var(--theme-primary)] text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  } transition-colors`}
                  title="List View"
                  aria-pressed={viewMode === "list"}
                  aria-label="Switch to list view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div
              className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <div className={`p-6 bg-[color:var(--theme-bg)] border-b border-[color:var(--theme-border)]`}>
                <h2 className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                  <Book className="w-5 h-5 text-[color:var(--theme-primary)]" />
                  <span>All Training Programs</span>
                </h2>
              </div>
              <div className="p-6">
                {sortedFormations.length > 0 ? (
                  viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {sortedFormations.map((formation) => (
                        <FormationCard
                          key={formation.id}
                          formation={formation}
                          onClick={(e) => handleFormationClick(formation.id, e)}
                          darkMode={darkMode}
                          theme={theme}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={`divide-y ${darkMode ? "divide-gray-600" : "divide-gray-200"}`}>
                      {sortedFormations.map((formation) => {
                        const cabinetsCount = formation.cabinets?.length || formation.cabinetsCount || 0;
                        const sessionsCount = formation.sessions?.length || formation.sessionsCount || 0;
                        const programmesCount = formation.programmes?.length || formation.programmesCount || 0;
                        const formateursCount = formation.formateurs?.length || formation.formateursCount || 0;

                        return (
                          <div
                            key={formation.id}
                            onClick={(e) => handleFormationClick(formation.id, e)}
                            className={`flex flex-col sm:flex-row sm:items-center p-4 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors cursor-pointer`}
                          >
                            <div className="flex items-center sm:flex-shrink-0 mb-3 sm:mb-0">
                              <div
                                className={`w-10 h-10 rounded-full border-2 ${darkMode ? "border-gray-600" : "border-gray-200"} bg-[color:var(--theme-primary)]/20 flex items-center justify-center`}
                              >
                                {formation.affiche ? (
                                  <img
                                    src={formation.affiche.split(",")[0].trim() || "/api/placeholder/40/40"}
                                    alt={formation.titre || "Formation"}
                                    className="w-10 h-10 object-cover rounded-full"
                                    onError={(e) => {
                                      e.target.src = "/api/placeholder/40/40";
                                      e.target.onerror = null;
                                    }}
                                  />
                                ) : (
                                  <Book
                                    className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-[color:var(--theme-primary)]"}`}
                                  />
                                )}
                              </div>
                              <div className="ml-4">
                                <h5 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                  {formation.titre || "Unnamed Formation"}
                                </h5>
                                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  {formation.type || "Unknown"} • {formation.duree || 0} hours
                                </p>
                              </div>
                            </div>
                            <div className="flex-1 sm:ml-4">
                              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} line-clamp-1 mb-2`}>
                                {formation.description || "No description available"}
                              </p>
                              <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-600"} grid grid-cols-1 sm:grid-cols-3 gap-2`}>
                                <div>
                                  <span className="font-medium">Dates:</span>{" "}
                                  {formation.datedebut ? new Date(formation.datedebut).toLocaleDateString() : "N/A"} to{" "}
                                  {formation.datefin ? new Date(formation.datefin).toLocaleDateString() : "N/A"}
                                </div>
                                <div>
                                  <span className="font-medium">Price:</span> ${formation.prix?.toLocaleString() || "N/A"}
                                </div>
                                <div>
                                  <span className="font-medium">Mode:</span> {formation.mode || "N/A"}
                                </div>
                                <div>
                                  <span className="font-medium">Cabinets:</span> {cabinetsCount}
                                </div>
                                <div>
                                  <span className="font-medium">Sessions:</span> {sessionsCount}
                                </div>
                                <div>
                                  <span className="font-medium">Programmes:</span> {programmesCount}
                                </div>
                                <div>
                                  <span className="font-medium">Formateurs:</span> {formateursCount}
                                </div>
                              </div>
                              {(formation.objectif || formation.apport) && (
                                <div className="mt-2">
                                  {formation.objectif && (
                                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} line-clamp-1`}>
                                      <span className="font-medium">Objectives:</span>{" "}
                                      {(formation.objectif.split(";") || []).join(", ")}
                                    </p>
                                  )}
                                  {formation.apport && (
                                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} line-clamp-1`}>
                                      <span className="font-medium">Benefits:</span>{" "}
                                      {(formation.apport.split(";") || []).join(", ")}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                              <span
                                className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                                style={getStatusBadgeStyles(formation.status)}
                              >
                                {formation.status?.replace(/_/g, " ") || "Unknown"}
                              </span>
                              <button
                                onClick={(e) => handleFormationClick(formation.id, e)}
                                className="text-xs bg-[color:var(--theme-primary)] text-white px-3 py-1 rounded-full hover:bg-[color:var(--theme-secondary)] transition-colors"
                              >
                                View
                              </button>
                              <Link
                                to={`/formations/${formation.id}/edit`}
                                className="text-xs bg-gray-500 text-white px-3 py-1 rounded-full hover:bg-gray-600 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Edit
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className={`text-center p-12 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                    <Book className={`mx-auto w-16 h-16 mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                    <p className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-4`}>
                      No formations found. Create your first training program!
                    </p>
                    <button
                      onClick={() => navigate("/formations/create")}
                      className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white bg-[color:var(--theme-primary)] hover:bg-[color:var(--theme-secondary)] transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Training
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationList;
