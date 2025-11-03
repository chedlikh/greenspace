import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  usePosteById,
  useServicesByPosteId,
  useUpdatePoste,
  useDeletePoste,
  useAssignServiceToPoste,
  useUnassignServiceFromPoste,
  useUnassignUsersFromPoste,
  useAssignUsersToPoste,
  useGservices,
  useUsersByPosteId,
  useUsers
} from "../../../services/hooks";
import { Search, ArrowLeft, Edit, Trash, Plus, X } from "lucide-react";

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

const PosteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const posteId = parseInt(id);
  const { theme, darkMode } = useSelector((state) => state.theme);

  // Fetch data
  const {
    data: poste,
    isLoading: posteLoading,
    isError: posteError,
    error: posteErrorMessage,
  } = usePosteById(posteId);

  const {
    data: assignedServices,
    isLoading: servicesLoading,
    isError: servicesError,
    error: servicesErrorMessage,
  } = useServicesByPosteId(posteId);

  const { data: allServices, isLoading: allServicesLoading } = useGservices();
  const { usersQuery } = useUsers();
  const {
    data: assignedUsers,
    isLoading: assignedUsersLoading,
    isError: assignedUsersError,
    error: assignedUsersErrorMessage,
  } = useUsersByPosteId(posteId);

  // Mutations
  const updatePoste = useUpdatePoste(posteId);
  const deletePoste = useDeletePoste(posteId);
  const assignService = useAssignServiceToPoste(posteId);
  const unassignService = useUnassignServiceFromPoste(posteId);
  const assignUsers = useAssignUsersToPoste(posteId);
  const unassignUsers = useUnassignUsersFromPoste(posteId);

  // State
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ titre: "" });
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedUsernames, setSelectedUsernames] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize form
  useEffect(() => {
    if (poste) setFormData({ titre: poste.titre });
  }, [poste]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePoste.mutate(formData, { onSuccess: () => setEditing(false) });
  };

  const handleDelete = () => {
    if (window.confirm("Delete this poste?")) {
      deletePoste.mutate(null, { onSuccess: () => navigate("/postes") });
    }
  };

  const handleAssignService = () => {
    if (selectedServiceId) {
      assignService.mutate(parseInt(selectedServiceId));
      setSelectedServiceId("");
    }
  };

  const handleUnassignService = (serviceId) => {
    if (window.confirm("Remove this service?")) {
      unassignService.mutate(serviceId);
    }
  };

  const handleAssignUsers = () => {
    if (selectedUsernames.length > 0) {
      assignUsers.mutate(selectedUsernames, {
        onSuccess: () => {
          setSelectedUsernames([]);
          setShowAssignModal(false);
        }
      });
    }
  };

  const handleUnassignUser = (username) => {
    if (window.confirm(`Unassign ${username}?`)) {
      unassignUsers.mutate([username]);
    }
  };

  const toggleUserSelection = (username) => {
    setSelectedUsernames(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  // Filter available users
  const availableUsers = (usersQuery?.data || []).filter(user =>
    !assignedUsers?.some(u => u.id === user.id) &&
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableServices = allServices?.filter(
    service => !assignedServices?.some(s => s.id === service.id)
  ) || [];

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || "#4cd964";
  const secondaryColor = themeColors[theme]?.secondary || "#34c759";
  const textColor = darkMode ? themeColors[theme]?.textDark : themeColors[theme]?.textLight;
  const borderColor = darkMode ? themeColors[theme]?.borderDark : themeColors[theme]?.borderLight;
  const bgLight = darkMode ? themeColors[theme]?.bgDark : themeColors[theme]?.bgLight;

  // Loading/error states
  if (posteLoading || servicesLoading || allServicesLoading ||
      assignedUsersLoading || usersQuery?.isLoading) {
    return (
      <div className={`text-center p-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        Loading...
      </div>
    );
  }

  if (posteError || servicesError || assignedUsersError) {
    return (
      <div className={`p-4 rounded-lg ${darkMode ? "bg-red-900 text-red-300" : "bg-red-100 text-red-700"}`}>
        {posteErrorMessage?.message ||
         servicesErrorMessage?.message ||
         assignedUsersErrorMessage?.message}
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
            --theme-text: ${textColor};
            --theme-border: ${borderColor};
            --theme-bg-light: ${bgLight};
          }
        `}
      </style>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div
            className={`shadow-lg rounded-xl overflow-hidden ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div
              className="p-4 flex justify-between items-center"
              style={{ backgroundColor: darkMode ? "#1f2937" : primaryColor }}
            >
              <h4 className={`text-xl font-bold ${darkMode ? "text-gray-200" : "text-white"}`}>
                {editing ? "Edit Poste" : "Poste Details"}
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate("/postes")}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg ${
                    darkMode
                      ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  } transition-colors`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                {!editing && (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className={`flex items-center space-x-1 px-4 py-2 rounded-lg ${
                        darkMode
                          ? "bg-yellow-600 text-white hover:bg-yellow-500"
                          : "bg-yellow-500 text-white hover:bg-yellow-600"
                      } transition-colors`}
                    >
                      <Edit className="w-5 h-5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className={`flex items-center space-x-1 px-4 py-2 rounded-lg ${
                        darkMode
                          ? "bg-red-600 text-white hover:bg-red-500"
                          : "bg-red-500 text-white hover:bg-red-600"
                      } transition-colors`}
                    >
                      <Trash className="w-5 h-5" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Poste Details Form */}
              {editing ? (
                <form onSubmit={handleSubmit} className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Title
                      </label>
                      <input
                        type="text"
                        className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-gray-200"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        name="titre"
                        value={formData.titre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      type="submit"
                      className="flex items-center space-x-1 bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                    >
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className={`flex items-center space-x-1 px-4 py-2 rounded-lg ${
                        darkMode
                          ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      } transition-colors`}
                    >
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-6">
                  <h5 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    Title: {poste?.titre}
                  </h5>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Services Section */}
                <div>
                  <div
                    className={`shadow-md rounded-lg overflow-hidden ${
                      darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div
                      className={`p-4 ${
                        darkMode ? "bg-gray-700" : "bg-[color:var(--theme-bg-light)]"
                      }`}
                    >
                      <h5 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                        Assigned Services
                      </h5>
                    </div>
                    <div className="p-4">
                      {assignedServices?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className={`${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                                <th className={`p-2 text-left text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                  Name
                                </th>
                                <th className={`p-2 text-left text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {assignedServices.map(service => (
                                <tr
                                  key={service.id}
                                  className={`border-t ${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`}
                                >
                                  <td className={`p-2 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                                    {service.name}
                                  </td>
                                  <td className="p-2">
                                    <button
                                      onClick={() => handleUnassignService(service.id)}
                                      className={`text-xs px-3 py-1 rounded-full ${
                                        darkMode
                                          ? "bg-red-600 text-white hover:bg-red-500"
                                          : "bg-red-100 text-red-700 hover:bg-red-200"
                                      } transition-colors`}
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          No services assigned
                        </p>
                      )}

                      <div className="mt-4">
                        <h6 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Assign New Service
                        </h6>
                        <div className="flex mt-2">
                          <select
                            className={`flex-1 px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 text-gray-200"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(e.target.value)}
                          >
                            <option value="">Select service</option>
                            {availableServices.map(service => (
                              <option key={service.id} value={service.id}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleAssignService}
                            disabled={!selectedServiceId}
                            className={`px-4 py-2 rounded-r-lg ${
                              selectedServiceId
                                ? "bg-[color:var(--theme-primary)] text-white hover:bg-[color:var(--theme-secondary)]"
                                : "bg-gray-400 text-gray-200 cursor-not-allowed"
                            } transition-colors`}
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users Section */}
                <div>
                  <div
                    className={`shadow-md rounded-lg overflow-hidden ${
                      darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div
                      className={`p-4 flex justify-between items-center ${
                        darkMode ? "bg-gray-700" : "bg-[color:var(--theme-bg-light)]"
                      }`}
                    >
                      <h5 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                        Assigned Users
                      </h5>
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="flex items-center space-x-1 bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Assign Users</span>
                      </button>
                    </div>
                    <div className="p-4">
                      {assignedUsers?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className={`${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                                <th className={`p-2 text-left text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                  Username
                                </th>
                                <th className={`p-2 text-left text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                  Name
                                </th>
                                <th className={`p-2 text-left text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {assignedUsers.map(user => (
                                <tr
                                  key={user.id}
                                  className={`border-t ${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`}
                                >
                                  <td className={`p-2 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                                    {user.username}
                                  </td>
                                  <td className={`p-2 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                                    {user.firstname} {user.lastname}
                                  </td>
                                  <td className="p-2">
                                    <button
                                      onClick={() => handleUnassignUser(user.username)}
                                      className={`text-xs px-3 py-1 rounded-full ${
                                        darkMode
                                          ? "bg-red-600 text-white hover:bg-red-500"
                                          : "bg-red-100 text-red-700 hover:bg-red-200"
                                      } transition-colors`}
                                    >
                                      Unassign
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          No users assigned
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assign Users Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div
                className={`rounded-xl w-full max-w-4xl ${
                  darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                } shadow-lg`}
              >
                <div
                  className={`p-4 flex justify-between items-center ${
                    darkMode ? "bg-gray-700" : "bg-[color:var(--theme-bg-light)]"
                  }`}
                >
                  <h5 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    Assign Users to Poste
                  </h5>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedUsernames([]);
                      setSearchTerm("");
                    }}
                    className={`p-2 rounded-full ${
                      darkMode ? "bg-gray-600 text-gray-200 hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-gray-200"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {availableUsers.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr className={`${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                            <th className={`p-2 text-left text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}></th>
                            <th className={`p-2 text-left text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                              Username
                            </th>
                            <th className={`p-2 text-left text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                              Name
                            </th>
                            <th className={`p-2 text-left text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                              Email
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {availableUsers.map(user => (
                            <tr
                              key={user.id}
                              className={`border-t ${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`}
                            >
                              <td className="p-2">
                                <input
                                  type="checkbox"
                                  checked={selectedUsernames.includes(user.username)}
                                  onChange={() => toggleUserSelection(user.username)}
                                  className={`rounded ${
                                    darkMode
                                      ? "bg-gray-700 border-gray-600 text-[color:var(--theme-primary)]"
                                      : "bg-white border-gray-300 text-[color:var(--theme-primary)]"
                                  }`}
                                />
                              </td>
                              <td className={`p-2 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                                {user.username}
                              </td>
                              <td className={`p-2 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                                {user.firstname} {user.lastname}
                              </td>
                              <td className={`p-2 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                                {user.email}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        No users available
                      </p>
                    )}
                  </div>
                </div>
                <div className={`p-4 flex justify-end space-x-2 ${darkMode ? "bg-gray-700" : "bg-[color:var(--theme-bg-light)]"}`}>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedUsernames([]);
                      setSearchTerm("");
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      darkMode
                        ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignUsers}
                    disabled={selectedUsernames.length === 0}
                    className={`px-4 py-2 rounded-lg ${
                      selectedUsernames.length > 0
                        ? "bg-[color:var(--theme-primary)] text-white hover:bg-[color:var(--theme-secondary)]"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    } transition-colors`}
                  >
                    Assign Selected ({selectedUsernames.length})
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosteDetail;