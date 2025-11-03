import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGserviceById,
  useGserviceSites,
  useUpdateGservice,
  useDeleteGservice,
  useAssignSiteToGservice,
  useUnassignSiteFromGservice,
  useSites,
} from "../../../services/hooks";
import { Briefcase, Search, Grid, List, ArrowUpDown, XCircle } from "lucide-react";

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

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, darkMode } = useSelector((state) => state.theme);
  const serviceId = parseInt(id);

  // Fetch service details
  const { data: service, isLoading: serviceLoading, isError: serviceError, error: serviceErrorMessage } = useGserviceById(serviceId);
  // Fetch unassigned sites (misnamed as assigned in API)
  const {
    data: unassignedSites = [],
    isLoading: sitesLoading,
    isError: sitesError,
    error: sitesErrorMessage,
    refetch: refetchUnassignedSites,
  } = useGserviceSites(serviceId);
  // Fetch all sites
  const { data: allSites = [], isLoading: allSitesLoading, refetch: refetchAllSites } = useSites();

  // Mutations
  const updateService = useUpdateGservice(serviceId);
  const deleteService = useDeleteGservice(serviceId);
  const assignSite = useAssignSiteToGservice(serviceId);
  const unassignSite = useUnassignSiteFromGservice(serviceId);

  // State
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [viewMode, setViewMode] = useState("grid"); // Default to grid view to match ListServices
  const [unassignedSortOption, setUnassignedSortOption] = useState("name-asc");
  const [unassignedViewMode, setUnassignedViewMode] = useState("grid"); // Default to grid view
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [siteToUnassign, setSiteToUnassign] = useState(null);
  const [assignedSites, setAssignedSites] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || "#4cd964";
  const secondaryColor = themeColors[theme]?.secondary || "#34c759";
  const bgColor = darkMode ? themeColors[theme]?.bgDark : themeColors[theme]?.bgLight;
  const textColor = darkMode ? themeColors[theme]?.textDark : themeColors[theme]?.textLight;
  const borderColor = darkMode ? themeColors[theme]?.borderDark : themeColors[theme]?.borderLight;

  // Update assigned sites
  useEffect(() => {
    if (allSites && unassignedSites) {
      const unassignedSiteIds = unassignedSites.map((site) => site?.id);
      const assigned = allSites.filter((site) => !unassignedSiteIds.includes(site?.id));
      setAssignedSites(assigned);
    }
  }, [allSites, unassignedSites]);

  // Initialize form data
  useEffect(() => {
    if (service) {
      setFormData({ name: service?.name || "", description: service?.description || "" });
    }
  }, [service]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    updateService.mutate(formData, {
      onSuccess: () => {
        setEditing(false);
        showToast("Service updated successfully", "success");
      },
      onError: (error) => {
        showToast(`Failed to update: ${error?.message || "Unknown error"}`, "error");
      },
    });
  };

  // Handle service deletion
  const handleDelete = () => {
    deleteService.mutate(null, {
      onSuccess: () => {
        navigate("/services");
        showToast("Service deleted successfully", "success");
      },
      onError: (error) => {
        showToast(`Failed to delete: ${error?.message || "Unknown error"}`, "error");
        setIsConfirmDeleteOpen(false);
      },
    });
  };

  // Handle site assignment
  const handleAssignSite = () => {
    if (selectedSiteId) {
      assignSite.mutate(parseInt(selectedSiteId), {
        onSuccess: () => {
          setSelectedSiteId("");
          showToast("Site assigned successfully", "success");
          refetchUnassignedSites();
          refetchAllSites();
        },
        onError: (error) => {
          showToast(`Failed to assign site: ${error?.message || "Unknown error"}`, "error");
        },
      });
    }
  };

  // Handle site unassignment
  const handleUnassignSite = (siteId) => {
    unassignSite.mutate(siteId, {
      onSuccess: () => {
        showToast("Site removed successfully", "success");
        setSiteToUnassign(null);
        refetchUnassignedSites();
        refetchAllSites();
      },
      onError: (error) => {
        showToast(`Failed to remove site: ${error?.message || "Unknown error"}`, "error");
        setSiteToUnassign(null);
      },
    });
  };

  // Toast notification
  const showToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3000);
  };

  // Filter and sort sites
  const filteredUnassignedSites = useMemo(
    () =>
      unassignedSites?.filter(
        (site) =>
          (site?.nom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (site?.type || "").toLowerCase().includes(searchTerm.toLowerCase())
      ) || [],
    [unassignedSites, searchTerm]
  );

  const sortedAssignedSites = useMemo(
    () =>
      [...assignedSites].sort((a, b) => {
        switch (sortOption) {
          case "name-asc":
            return (a?.nom || "").localeCompare(b?.nom || "");
          case "name-desc":
            return (b?.nom || "").localeCompare(a?.nom || "");
          case "type-asc":
            return (a?.type || "").localeCompare(b?.type || "");
          case "type-desc":
            return (b?.type || "").localeCompare(a?.type || "");
          default:
            return 0;
        }
      }),
    [assignedSites, sortOption]
  );

  const sortedUnassignedSites = useMemo(
    () =>
      [...filteredUnassignedSites].sort((a, b) => {
        switch (unassignedSortOption) {
          case "name-asc":
            return (a?.nom || "").localeCompare(b?.nom || "");
          case "name-desc":
            return (b?.nom || "").localeCompare(a?.nom || "");
          case "type-asc":
            return (a?.type || "").localeCompare(b?.type || "");
          case "type-desc":
            return (b?.type || "").localeCompare(a?.type || "");
          default:
            return 0;
        }
      }),
    [filteredUnassignedSites, unassignedSortOption]
  );

  // Loading state
  if (serviceLoading || sitesLoading || allSitesLoading) {
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
  if (serviceError || sitesError) {
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
          Error: {serviceErrorMessage?.message || sitesErrorMessage?.message || "Unknown error occurred"}
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
          .custom-radio:checked {
            background-color: var(--theme-primary);
            border-color: var(--theme-primary);
          }
        `}
      </style>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <Briefcase className={`w-8 h-8 ${darkMode ? "text-gray-200" : "text-[color:var(--theme-primary)]"}`} />
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                  {service?.name || "Service Details"}
                </h1>
                {!editing && service?.description && (
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{service.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"} transition-colors`}
                onClick={() => navigate("/services")}
              >
                Back
              </button>
              {!editing ? (
                <>
                  <button
                    className="bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    onClick={() => setIsConfirmDeleteOpen(true)}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"} transition-colors`}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Service Information */}
            <div className="col-span-2">
              <div className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className={`p-6 bg-[color:var(--theme-bg)] border-b border-[color:var(--theme-border)]`}>
                  <h2 className={`text-xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    {editing ? "Edit Service" : "Service Information"}
                  </h2>
                </div>
                <div className="p-6">
                  {editing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Service Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className={`mt-1 block w-full rounded-lg border p-2 focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-900"}`}
                          aria-label="Service Name"
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="description" className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Description</label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="4"
                          className={`mt-1 block w-full rounded-lg border p-2 focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-900"}`}
                          placeholder="Enter a description for this service"
                          aria-label="Service Description"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={updateService.isLoading}
                      >
                        {updateService.isLoading ? (
                          <>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center">
                      <div className="relative inline-block mb-4">
                        <div
                          className={`w-12 h-12 rounded-full border-2 ${darkMode ? "border-gray-600" : "border-gray-200"} bg-[color:var(--theme-primary)]/20 flex items-center justify-center`}
                        >
                          <Briefcase
                            className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-[color:var(--theme-primary)]"}`}
                          />
                        </div>
                      </div>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-2`}>ID: {service?.id || "N/A"}</p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-2`}>Name: {service?.name || "Unnamed Service"}</p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-2`}>
                        Description: {service?.description || "No description provided"}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-2`}>Sites: {assignedSites?.length || 0}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assigned Sites & Assignment */}
            <div className="col-span-3">
              {/* Assigned Sites */}
              <div className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className={`p-6 bg-[color:var(--theme-bg)] border-b border-[color:var(--theme-border)]`}>
                  <h2 className={`text-xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Assigned Sites ({assignedSites?.length || 0})</h2>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <ArrowUpDown className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                        <select
                          value={sortOption}
                          onChange={(e) => setSortOption(e.target.value)}
                          className={`border rounded-lg py-2 px-3 focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-900"}`}
                          aria-label="Sort assigned sites"
                        >
                          <option value="name-asc">Name (A-Z)</option>
                          <option value="name-desc">Name (Z-A)</option>
                          <option value="type-asc">Type (A-Z)</option>
                          <option value="type-desc">Type (Z-A)</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-2 rounded-lg ${
                            viewMode === "grid"
                              ? "bg-[color:var(--theme-primary)] text-white"
                              : darkMode
                              ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          } transition-colors`}
                          title="Grid View"
                          aria-pressed={viewMode === "grid"}
                          aria-label="Switch to grid view for assigned sites"
                        >
                          <Grid className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`p-2 rounded-lg ${
                            viewMode === "list"
                              ? "bg-[color:var(--theme-primary)] text-white"
                              : darkMode
                              ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          } transition-colors`}
                          title="List View"
                          aria-pressed={viewMode === "list"}
                          aria-label="Switch to list view for assigned sites"
                        >
                          <List className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {sortedAssignedSites.length > 0 ? (
                        sortedAssignedSites.map((site) => (
                          <div
                            key={site?.id}
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
                              <h3 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-1`}>{site?.nom || "Unnamed Site"}</h3>
                              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-2 line-clamp-2`}>{site?.adresse || "No address provided"}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"}`}>{site?.type || "N/A"}</span>
                              <div>
                                <button
                                  className="mt-2 text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition-colors"
                                  onClick={() => setSiteToUnassign(site)}
                                  aria-label={`Remove site ${site?.nom}`}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-6">
                          <Briefcase className={`w-12 h-12 mx-auto mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No sites assigned yet</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`divide-y ${darkMode ? "divide-gray-600" : "divide-gray-200"}`}>
                      {sortedAssignedSites.length > 0 ? (
                        sortedAssignedSites.map((site) => (
                          <div
                            key={site?.id}
                            className={`flex items-center p-4 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors`}
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
                              <h3 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{site?.nom || "Unnamed Site"}</h3>
                              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} line-clamp-1`}>{site?.adresse || "No address provided"}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"}`}>{site?.type || "N/A"}</span>
                            </div>
                            <button
                              className="text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition-colors"
                              onClick={() => setSiteToUnassign(site)}
                              aria-label={`Remove site ${site?.nom}`}
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <Briefcase className={`w-12 h-12 mx-auto mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No sites assigned yet</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Assign New Site */}
              <div className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} mt-6`}>
                <div className={`p-6 bg-[color:var(--theme-bg)] border-b border-[color:var(--theme-border)]`}>
                  <h2 className={`text-xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Assign New Site</h2>
                </div>
                <div className="p-6">
                  <div className="relative mb-6">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    <input
                      type="text"
                      placeholder="Search sites by name or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-900"}`}
                      aria-label="Search available sites"
                    />
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Available Sites ({sortedUnassignedSites.length})</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <ArrowUpDown className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                        <select
                          value={unassignedSortOption}
                          onChange={(e) => setUnassignedSortOption(e.target.value)}
                          className={`border rounded-lg py-2 px-3 focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-900"}`}
                          aria-label="Sort unassigned sites"
                        >
                          <option value="name-asc">Name (A-Z)</option>
                          <option value="name-desc">Name (Z-A)</option>
                          <option value="type-asc">Type (A-Z)</option>
                          <option value="type-desc">Type (Z-A)</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setUnassignedViewMode("grid")}
                          className={`p-2 rounded-lg ${
                            unassignedViewMode === "grid"
                              ? "bg-[color:var(--theme-primary)] text-white"
                              : darkMode
                              ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          } transition-colors`}
                          title="Grid View"
                          aria-pressed={unassignedViewMode === "grid"}
                          aria-label="Switch to grid view for unassigned sites"
                        >
                          <Grid className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setUnassignedViewMode("list")}
                          className={`p-2 rounded-lg ${
                            unassignedViewMode === "list"
                              ? "bg-[color:var(--theme-primary)] text-white"
                              : darkMode
                              ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          } transition-colors`}
                          title="List View"
                          aria-pressed={unassignedViewMode === "list"}
                          aria-label="Switch to list view for unassigned sites"
                        >
                          <List className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {unassignedViewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {sortedUnassignedSites.length > 0 ? (
                        sortedUnassignedSites.map((site) => (
                          <label
                            key={site?.id}
                            className={`relative p-4 rounded-lg shadow-sm cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                              selectedSiteId === site?.id?.toString()
                                ? "bg-[color:var(--theme-primary)]/20 border-[color:var(--theme-primary)]"
                                : darkMode
                                ? "bg-gray-700 border-gray-600"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <input
                              type="radio"
                              name="siteOption"
                              value={site?.id}
                              checked={selectedSiteId === site?.id?.toString()}
                              onChange={() => setSelectedSiteId(site?.id?.toString())}
                              className="custom-radio mr-3 h-5 w-5 border-gray-300 focus:ring-[color:var(--theme-primary)]"
                              aria-label={`Select site ${site?.nom}`}
                              aria-selected={selectedSiteId === site?.id?.toString()}
                            />
                            <div className="relative inline-block mb-4">
                              <div
                                className={`w-12 h-12 rounded-full border-2 ${darkMode ? "border-gray-600" : "border-gray-200"} bg-[color:var(--theme-primary)]/20 flex items-center justify-center`}
                              >
                                <Briefcase
                                  className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-[color:var(--theme-primary)]"}`}
                                />
                              </div>
                            </div>
                            <h3 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-1`}>{site?.nom || "Unnamed Site"}</h3>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-2 line-clamp-2`}>{site?.adresse || "No address provided"}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"}`}>{site?.type || "N/A"}</span>
                          </label>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-6">
                          <Briefcase className={`w-12 h-12 mx-auto mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{searchTerm ? "No matching sites found" : "No sites available for assignment"}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`divide-y ${darkMode ? "divide-gray-600" : "divide-gray-200"} mb-6`}>
                      {sortedUnassignedSites.length > 0 ? (
                        sortedUnassignedSites.map((site) => (
                          <label
                            key={site?.id}
                            className={`flex items-center p-4 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors ${
                              selectedSiteId === site?.id?.toString() ? "bg-[color:var(--theme-primary)]/20" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="siteOption"
                              value={site?.id}
                              checked={selectedSiteId === site?.id?.toString()}
                              onChange={() => setSelectedSiteId(site?.id?.toString())}
                              className="custom-radio mr-3 h-5 w-5 border-gray-300 focus:ring-[color:var(--theme-primary)]"
                              aria-label={`Select site ${site?.nom}`}
                              aria-selected={selectedSiteId === site?.id?.toString()}
                            />
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
                              <h3 className={`text-base font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{site?.nom || "Unnamed Site"}</h3>
                              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} line-clamp-1`}>{site?.adresse || "No address provided"}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"}`}>{site?.type || "N/A"}</span>
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <Briefcase className={`w-12 h-12 mx-auto mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{searchTerm ? "No matching sites found" : "No sites available for assignment"}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    className="w-full bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={handleAssignSite}
                    disabled={!selectedSiteId || assignSite.isLoading}
                    aria-label="Assign selected site"
                  >
                    {assignSite.isLoading ? (
                      <>
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                        Assigning...
                      </>
                    ) : (
                      "Assign Selected Site"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 max-w-md w-full ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-lg transform transition-all scale-100`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Confirm Delete</h3>
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className={`text-gray-500 hover:text-gray-700 dark:hover:text-gray-300`}
                aria-label="Close delete confirmation"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className={`mb-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
              Are you sure you want to delete the service <strong>{service?.name || "Unnamed Service"}</strong>?
            </p>
            <p className="text-red-500 text-sm mb-4">This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"} transition-colors`}
                onClick={() => setIsConfirmDeleteOpen(false)}
                aria-label="Cancel delete"
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                onClick={handleDelete}
                disabled={deleteService.isLoading}
                aria-label="Confirm delete service"
              >
                {deleteService.isLoading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete Service"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unassign Site Confirmation Modal */}
      {siteToUnassign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 max-w-md w-full ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-lg transform transition-all scale-100`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Confirm Removal</h3>
              <button
                onClick={() => setSiteToUnassign(null)}
                className={`text-gray-500 hover:text-gray-700 dark:hover:text-gray-300`}
                aria-label="Close unassign confirmation"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className={`mb-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
              Are you sure you want to remove the site <strong>{siteToUnassign?.nom || "Unnamed Site"}</strong> from this service?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"} transition-colors`}
                onClick={() => setSiteToUnassign(null)}
                aria-label="Cancel unassign"
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                onClick={() => handleUnassignSite(siteToUnassign?.id)}
                disabled={unassignSite.isLoading}
                aria-label={`Confirm unassign site ${siteToUnassign?.nom}`}
              >
                {unassignSite.isLoading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                    Removing...
                  </>
                ) : (
                  "Remove Site"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg mb-2 ${
              toast.type === "error" ? "bg-red-500 text-white" : "bg-[color:var(--theme-primary)] text-white"
            } transition-all animate-slide-in`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceDetail;