import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGservices, useSites, useSocietes } from "../../../services/hooks";
import { Search, Plus, Grid, List, ArrowUpDown, Briefcase, Building } from "lucide-react";

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

const ListServices = () => {
  const navigate = useNavigate();
  const { theme, darkMode } = useSelector((state) => state.theme);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [viewMode, setViewMode] = useState("grid");

  // Fetch data
  const { 
    data: services = [], 
    isLoading: servicesLoading, 
    isError: servicesError, 
    error: servicesErrorData 
  } = useGservices();
  
  const { 
    data: sites = [], 
    isLoading: sitesLoading, 
    isError: sitesError, 
    error: sitesErrorData 
  } = useSites();
  
  const { 
    data: societes = [], 
    isLoading: societesLoading, 
    isError: societesError, 
    error: societesErrorData 
  } = useSocietes();

  // Memoized filtering of services based on search query
  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        `${service.nom || service.name || ""} ${service.description || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [services, searchQuery]
  );

  // Memoized sorting of filtered services
  const sortedServices = useMemo(
    () =>
      [...filteredServices].sort((a, b) => {
        switch (sortOption) {
          case "name-asc":
            return (a.nom || a.name || "").localeCompare(b.nom || b.name || "");
          case "name-desc":
            return (b.nom || b.name || "").localeCompare(a.nom || a.name || "");
          case "sites-asc":
            return (a.sites?.length || 0) - (b.sites?.length || 0);
          case "sites-desc":
            return (b.sites?.length || 0) - (a.sites?.length || 0);
          default:
            return 0;
        }
      }),
    [filteredServices, sortOption]
  );

  // Group sites by société
  const groupedSites = useMemo(() => {
    const groups = societes.reduce((acc, societe) => {
      acc[societe.id] = sites.filter(
        (site) => site.societeId === societe.id || site.societe?.id === societe.id
      );
      return acc;
    }, {});
    groups["no-societe"] = sites.filter(
      (site) => !site.societeId && !site.societe
    );
    return groups;
  }, [societes, sites]);

  // Group services by site
  const groupedServices = useMemo(() => {
    return sites.reduce((acc, site) => {
      acc[site.id] = sortedServices.filter((service) =>
        service.sites?.some((s) => s.id === site.id)
      );
      return acc;
    }, {});
  }, [sites, sortedServices]);

  // Standalone services (no sites)
  const standaloneServices = sortedServices.filter(
    (service) => !service.sites || service.sites.length === 0
  );

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

  const handleServiceClick = (id, e) => {
    if (e) e.stopPropagation();
    navigate(`/services/${id}`);
  };

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || "#4cd964";
  const secondaryColor = themeColors[theme]?.secondary || "#34c759";
  const bgColor = darkMode ? themeColors[theme]?.bgDark : themeColors[theme]?.bgLight;
  const textColor = darkMode ? themeColors[theme]?.textDark : themeColors[theme]?.textLight;
  const borderColor = darkMode ? themeColors[theme]?.borderDark : themeColors[theme]?.borderLight;

  if (servicesLoading || sitesLoading || societesLoading) {
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

  if (servicesError || sitesError || societesError) {
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
          Error: {servicesErrorData?.message || sitesErrorData?.message || societesErrorData?.message || "Unknown error occurred"}
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
          {/* Header and Create Service Button */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <Briefcase className={`w-8 h-8 ${darkMode ? "text-gray-200" : "text-[color:var(--theme-primary)]"}`} />
              <h1 className={`text-2xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                Services Management
              </h1>
            </div>
            <button
              onClick={() => navigate("/services/new")}
              className="flex items-center space-x-2 bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Service</span>
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
                placeholder="Search services by name or description..."
                value={searchQuery}
                onChange={handleSearch}
                aria-label="Search services"
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
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="sites-asc">Sites (Low to High)</option>
                  <option value="sites-desc">Sites (High to Low)</option>
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
            {/* Sociétés */}
            {societes.map((societe) => (
              <div
                key={societe.id}
                className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
              >
                <div className={`p-6 bg-[color:var(--theme-bg)] border-b border-[color:var(--theme-border)]`}>
                  <h2 className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    <Building className="w-5 h-5 text-[color:var(--theme-primary)]" />
                    <span>{societe.nom || societe.name || "Société " + societe.id}</span>
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {groupedSites[societe.id]?.length > 0 ? (
                    groupedSites[societe.id].map((site) => (
                      <div
                        key={site.id}
                        className={`rounded-lg p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                      >
                        <h3 className={`text-lg font-medium ${darkMode ? "text-gray-200" : "text-gray-800"} mb-2 flex items-center space-x-2`}>
                          <Briefcase className="w-4 h-4 text-[color:var(--theme-primary)]" />
                          <span>{site.nom || site.name || "Site " + site.id}</span>
                        </h3>
                        {groupedServices[site.id]?.length > 0 ? (
                          viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {groupedServices[site.id].map((service) => (
                                <div
                                  key={service.id}
                                  onClick={(e) => handleServiceClick(service.id, e)}
                                  className={`shadow-sm rounded-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}
                                >
                                  <div className="p-4 text-center">
                                    <div className="relative inline-block mb-4">
                                      <div
                                        className={`w-12 h-12 rounded-full border-2 ${darkMode ? "border-gray-600" : "border-gray-200"} bg-[color:var(--theme-primary)]/20 flex items-center justify-center`}
                                      >
                                        <Briefcase
                                          className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-[color:var(--theme-primary)]"}`}
                                        />
                                      </div>
                                    </div>
                                    <h4 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-1`}>
                                      {service.nom || service.name || "Unnamed Service"}
                                    </h4>
                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-2 line-clamp-2`}>
                                      {service.description || "No description available"}
                                    </p>
                                    <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-600"} mb-2`}>
                                      Sites: {service.sites?.length || 0}
                                    </div>
                                    <button
                                      onClick={(e) => handleServiceClick(service.id, e)}
                                      className="text-xs bg-[color:var(--theme-primary)] text-white px-3 py-1 rounded-full hover:bg-[color:var(--theme-secondary)] transition-colors"
                                    >
                                      View
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className={`divide-y ${darkMode ? "divide-gray-600" : "divide-gray-200"}`}>
                              {groupedServices[site.id].map((service) => (
                                <div
                                  key={service.id}
                                  onClick={(e) => handleServiceClick(service.id, e)}
                                  className={`flex items-center p-4 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors cursor-pointer`}
                                >
                                  <div className="relative flex-shrink-0">
                                    <div
                                      className={`w-10 h-10 rounded-full border-2 ${darkMode ? "border-gray-600" : "border-gray-200"} bg-[color:var(--theme-primary)]/20 flex items-center justify-center`}
                                    >
                                      <Briefcase
                                        className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-[color:var(--theme-primary)]"}`}
                                      />
                                    </div>
                                  </div>
                                  <div className="ml-4 flex-1">
                                    <h4 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                      {service.nom || service.name || "Unnamed Service"}
                                    </h4>
                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} line-clamp-1`}>
                                      {service.description || "No description available"}
                                    </p>
                                    <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-600"}`}>
                                      Sites: {service.sites?.length || 0}
                                    </p>
                                  </div>
                                  <button
                                    onClick={(e) => handleServiceClick(service.id, e)}
                                    className="text-xs bg-[color:var(--theme-primary)] text-white px-3 py-1 rounded-full hover:bg-[color:var(--theme-secondary)] transition-colors"
                                  >
                                    View
                                  </button>
                                </div>
                              ))}
                            </div>
                          )
                        ) : (
                          <p className={`text-sm italic ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            No services assigned to this site.
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm italic ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      No sites assigned to this société.
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Sites with no société */}
            {groupedSites["no-societe"]?.length > 0 && (
              <div
                className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
              >
                <div className={`p-6 bg-[color:var(--theme-bg)] border-b border-[color:var(--theme-border)]`}>
                  <h2 className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    <Building className="w-5 h-5 text-[color:var(--theme-primary)]" />
                    <span>No Société Assigned</span>
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {groupedSites["no-societe"].map((site) => (
                    <div
                      key={site.id}
                      className={`rounded-lg p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                    >
                      <h3 className={`text-lg font-medium ${darkMode ? "text-gray-200" : "text-gray-800"} mb-2 flex items-center space-x-2`}>
                        <Briefcase className="w-4 h-4 text-[color:var(--theme-primary)]" />
                        <span>{site.nom || site.name || "Site " + site.id}</span>
                      </h3>
                      {groupedServices[site.id]?.length > 0 ? (
                        viewMode === "grid" ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {groupedServices[site.id].map((service) => (
                              <div
                                key={service.id}
                                onClick={(e) => handleServiceClick(service.id, e)}
                                className={`shadow-sm rounded-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}
                              >
                                <div className="p-4 text-center">
                                  <div className="relative inline-block mb-4">
                                    <div
                                      className={`w-12 h-12 rounded-full border-2 ${darkMode ? "border-gray-600" : "border-gray-200"} bg-[color:var(--theme-primary)]/20 flex items-center justify-center`}
                                    >
                                      <Briefcase
                                        className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-[color:var(--theme-primary)]"}`}
                                      />
                                    </div>
                                  </div>
                                  <h4 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-1`}>
                                    {service.nom || service.name || "Unnamed Service"}
                                  </h4>
                                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-2 line-clamp-2`}>
                                    {service.description || "No description available"}
                                  </p>
                                  <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-600"} mb-2`}>
                                    Sites: {service.sites?.length || 0}
                                  </div>
                                  <button
                                    onClick={(e) => handleServiceClick(service.id, e)}
                                    className="text-xs bg-[color:var(--theme-primary)] text-white px-3 py-1 rounded-full hover:bg-[color:var(--theme-secondary)] transition-colors"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={`divide-y ${darkMode ? "divide-gray-600" : "divide-gray-200"}`}>
                            {groupedServices[site.id].map((service) => (
                              <div
                                key={service.id}
                                onClick={(e) => handleServiceClick(service.id, e)}
                                className={`flex items-center p-4 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors cursor-pointer`}
                              >
                                <div className="relative flex-shrink-0">
                                  <div
                                    className={`w-10 h-10 rounded-full border-2 ${darkMode ? "border-gray-600" : "border-gray-200"} bg-[color:var(--theme-primary)]/20 flex items-center justify-center`}
                                  >
                                    <Briefcase
                                      className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-[color:var(--theme-primary)]"}`}
                                    />
                                  </div>
                                </div>
                                <div className="ml-4 flex-1">
                                  <h4 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                    {service.nom || service.name || "Unnamed Service"}
                                  </h4>
                                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} line-clamp-1`}>
                                    {service.description || "No description available"}
                                  </p>
                                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-600"}`}>
                                    Sites: {service.sites?.length || 0}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => handleServiceClick(service.id, e)}
                                  className="text-xs bg-[color:var(--theme-primary)] text-white px-3 py-1 rounded-full hover:bg-[color:var(--theme-secondary)] transition-colors"
                                >
                                  View
                                </button>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <p className={`text-sm italic ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          No services assigned to this site.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services without site */}
            {standaloneServices.length > 0 && (
              <div
                className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
              >
                <div className={`p-6 bg-[color:var(--theme-bg)] border-b border-[color:var(--theme-border)]`}>
                  <h2 className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    <Briefcase className="w-5 h-5 text-[color:var(--theme-primary)]" />
                    <span>Services Without Site</span>
                  </h2>
                </div>
                <div className="p-6">
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {standaloneServices.map((service) => (
                        <div
                          key={service.id}
                          onClick={(e) => handleServiceClick(service.id, e)}
                          className={`shadow-lg rounded-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}
                        >
                          <div className="p-4 text-center">
                            <div className="relative inline-block mb-4">
                              <div
                                className={`w-12 h-12 rounded-full border-2 ${darkMode ? "border-gray-600" : "border-gray-200"} bg-[color:var(--theme-primary)]/20 flex items-center justify-center`}
                              >
                                <Briefcase
                                  className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-[color:var(--theme-primary)]"}`}
                                />
                              </div>
                            </div>
                            <h4 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-1`}>
                              {service.nom || service.name || "Unnamed Service"}
                            </h4>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-2 line-clamp-2`}>
                              {service.description || "No description available"}
                            </p>
                            <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-600"} mb-2`}>
                              Sites: {service.sites?.length || 0}
                            </div>
                            <button
                              onClick={(e) => handleServiceClick(service.id, e)}
                              className="text-xs bg-[color:var(--theme-primary)] text-white px-3 py-1 rounded-full hover:bg-[color:var(--theme-secondary)] transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`divide-y ${darkMode ? "divide-gray-600" : "divide-gray-200"}`}>
                      {standaloneServices.map((service) => (
                        <div
                          key={service.id}
                          onClick={(e) => handleServiceClick(service.id, e)}
                          className={`flex items-center p-4 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors cursor-pointer`}
                        >
                          <div className="relative flex-shrink-0">
                            <div
                              className={`w-10 h-10 rounded-full border-2 ${darkMode ? "border-gray-600" : "border-gray-200"} bg-[color:var(--theme-primary)]/20 flex items-center justify-center`}
                            >
                              <Briefcase
                                className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-[color:var(--theme-primary)]"}`}
                              />
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <h4 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                              {service.nom || service.name || "Unnamed Service"}
                            </h4>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} line-clamp-1`}>
                              {service.description || "No description available"}
                            </p>
                            <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-600"}`}>
                              Sites: {service.sites?.length || 0}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleServiceClick(service.id, e)}
                            className="text-xs bg-[color:var(--theme-primary)] text-white px-3 py-1 rounded-full hover:bg-[color:var(--theme-secondary)] transition-colors"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No Data State */}
            {societes.length === 0 && groupedSites["no-societe"]?.length === 0 && standaloneServices.length === 0 && (
              <div className={`text-center p-12 rounded-xl ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-lg`}>
                <Briefcase className={`mx-auto w-16 h-16 mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                <p className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-4`}>
                  No services, sites, or sociétés found. Create your first service!
                </p>
                <button
                  onClick={() => navigate("/services/new")}
                  className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white bg-[color:var(--theme-primary)] hover:bg-[color:var(--theme-secondary)] transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Service
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListServices;