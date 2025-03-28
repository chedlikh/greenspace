import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useSocieteById,
  useSocietesSites,
  useUpdateSociete,
  useDeleteSociete,
  useAssignSiteToSociete,
  useUnassignSiteFromSociete,
  useSites,
} from "../../../services/hooks";

const SocieteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const societeId = parseInt(id);

  // Debugging: Log the societeId from the URL
  console.log("Societe ID from URL:", societeId);

  // Fetch societe details
  const {
    data: societe,
    isLoading: societeLoading,
    isError: societeError,
    error: societeErrorMessage,
  } = useSocieteById(societeId);

  // Debugging: Log societe data and errors
  useEffect(() => {
    if (societe) {
      console.log("Societe data loaded:", societe);
    }
    if (societeError) {
      console.error("Error loading societe:", societeErrorMessage);
    }
  }, [societe, societeError, societeErrorMessage]);

  // Fetch societe's sites
  const {
    data: assignedSites,
    isLoading: sitesLoading,
    isError: sitesError,
    error: sitesErrorMessage,
  } = useSocietesSites(societeId);

  // Debugging: Log assigned sites and errors
  useEffect(() => {
    if (assignedSites) {
      console.log("Assigned sites loaded:", assignedSites);
    }
    if (sitesError) {
      console.error("Error loading assigned sites:", sitesErrorMessage);
    }
  }, [assignedSites, sitesError, sitesErrorMessage]);

  // Fetch all available sites for assignment
  const { data: allSites, isLoading: allSitesLoading } = useSites();

  // Debugging: Log all sites
  useEffect(() => {
    if (allSites) {
      console.log("All sites loaded:", allSites);
    }
  }, [allSites]);

  // Mutations
  const updateSociete = useUpdateSociete(societeId);
  const deleteSociete = useDeleteSociete(societeId);
  const assignSite = useAssignSiteToSociete(societeId);
  const unassignSite = useUnassignSiteFromSociete(societeId);

  // State for form
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    adresse: "",
    type: "",
  });
  const [selectedSiteId, setSelectedSiteId] = useState("");

  // Initialize form data when societe data is loaded
  useEffect(() => {
    if (societe) {
      setFormData({
        name: societe.name,
        adresse: societe.adresse,
        type: societe.type,
      });
    }
  }, [societe]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    updateSociete.mutate(formData, {
      onSuccess: () => {
        setEditing(false);
      },
    });
  };

  // Handle societe deletion
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this societe?")) {
      deleteSociete.mutate(null, {
        onSuccess: () => {
          navigate("/societe");
        },
      });
    }
  };

  // Handle site assignment
  const handleAssignSite = () => {
    if (selectedSiteId) {
      assignSite.mutate(parseInt(selectedSiteId));
      setSelectedSiteId("");
    }
  };

  // Handle site unassignment
  const handleUnassignSite = (siteId) => {
    if (window.confirm("Are you sure you want to remove this site from the societe?")) {
      unassignSite.mutate(siteId);
    }
  };

  // Loading state
  if (societeLoading || sitesLoading || allSitesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (societeError) {
    return (
      <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
        <p>Error loading societe: {societeErrorMessage?.message}</p>
      </div>
    );
  }

  if (sitesError) {
    return (
      <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
        <p>Error loading sites: {sitesErrorMessage?.message}</p>
      </div>
    );
  }

  // Get sites available for assignment (sites not already assigned)
  const availableSites = allSites
    ? allSites.filter(
        (site) =>
          !assignedSites ||
          !assignedSites.some((assignedSite) => assignedSite.id === site.id)
      )
    : [];

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">

    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {editing ? "Edit Societe" : "Societe Details"}
            </h1>
            <p className="text-gray-600">
              {!editing && societe?.name ? `Details for ${societe.name}` : "Edit the societe information"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <button
              onClick={() => navigate("/societe")}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
            >
              Back to List
            </button>
            
            {!editing && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Societe Details / Edit Form */}
          <div className="p-6">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{societe?.name}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Type</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{societe?.type}</p>
                  </div>
                  
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{societe?.adresse}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Assigned Sites Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Assigned Sites</h2>
            
            {assignedSites && assignedSites.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedSites.map((site) => (
                      <tr key={site.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {site.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {site.adresse}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {site.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleUnassignSite(site.id)}
                            className="text-red-600 hover:text-red-900"
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
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No sites assigned to this societe</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Assign New Site Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Assign New Site</h2>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                >
                  <option value="">Select a site to assign</option>
                  {availableSites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.nom} ({site.type})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <button
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAssignSite}
                  disabled={!selectedSiteId}
                >
                  Assign Site
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

  );
};

export default SocieteDetail;