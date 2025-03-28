import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGserviceById,
  useGserviceSites,
  useUpdateGservice,
  useDeleteGservice,
  useAssignSiteToGservice,
  useUnassignSiteFromGservice,
  useSites,
} from "../../../services/hooks";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const serviceId = parseInt(id);

  // Fetch service details
  const {
    data: service,
    isLoading: serviceLoading,
    isError: serviceError,
    error: serviceErrorMessage,
  } = useGserviceById(serviceId);

  // Fetch service's sites - THESE ARE ACTUALLY UNASSIGNED SITES
  const {
    data: unassignedSites,
    isLoading: sitesLoading,
    isError: sitesError,
    error: sitesErrorMessage,
    refetch: refetchUnassignedSites,
  } = useGserviceSites(serviceId);

  // Fetch all available sites for assignment
  const { 
    data: allSites, 
    isLoading: allSitesLoading,
    refetch: refetchAllSites 
  } = useSites();

  // Mutations
  const updateService = useUpdateGservice(serviceId);
  const deleteService = useDeleteGservice(serviceId);
  const assignSite = useAssignSiteToGservice(serviceId);
  const unassignSite = useUnassignSiteFromGservice(serviceId);

  // State for form
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [siteToUnassign, setSiteToUnassign] = useState(null);
  
  // Derive assigned sites (since the APIs are inverted)
  const [assignedSites, setAssignedSites] = useState([]);
  
  // Update assignedSites whenever allSites or unassignedSites changes
  useEffect(() => {
    if (allSites && unassignedSites) {
      // Extract IDs of "unassigned" sites from the API (which are actually assigned)
      const unassignedSiteIds = unassignedSites.map(site => site.id);
      
      // The assignedSites are those in allSites that are NOT in the "unassignedSites" list
      const assigned = allSites.filter(site => !unassignedSiteIds.includes(site.id));
      
      setAssignedSites(assigned);
    }
  }, [allSites, unassignedSites]);

  // Initialize form data when service data is loaded
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || "",
      });
    }
  }, [service]);

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
    updateService.mutate(formData, {
      onSuccess: () => {
        setEditing(false);
        showToast("Service updated successfully", "success");
      },
      onError: (error) => {
        showToast(`Failed to update: ${error.message}`, "error");
      }
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
        showToast(`Failed to delete: ${error.message}`, "error");
        setIsConfirmDeleteOpen(false);
      }
    });
  };

  // Handle site assignment
  const handleAssignSite = () => {
    if (selectedSiteId) {
      assignSite.mutate(parseInt(selectedSiteId), {
        onSuccess: () => {
          setSelectedSiteId("");
          showToast("Site assigned successfully", "success");
          // Refetch data to update UI
          refetchUnassignedSites();
          refetchAllSites();
        },
        onError: (error) => {
          console.error("Error assigning site:", error);
          showToast(`Failed to assign site: ${error.message}`, "error");
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
        // Refetch data to update UI
        refetchUnassignedSites();
        refetchAllSites();
      },
      onError: (error) => {
        console.error("Error unassigning site:", error);
        showToast(`Failed to remove site: ${error.message}`, "error");
        setSiteToUnassign(null);
      },
    });
  };

  // Simple toast notification function
  const showToast = (message, type) => {
    // You can replace this with your preferred toast library
    const toastId = `toast-${Date.now()}`;
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast show ${type === 'error' ? 'bg-danger' : 'bg-success'} text-white`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="toast-body d-flex align-items-center">
        <span>${message}</span>
        <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      const toastElement = document.getElementById(toastId);
      if (toastElement) toastElement.remove();
    }, 3000);
  };
  
  const createToastContainer = () => {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
  };

  // Filter unassigned sites based on search term
  const filteredUnassignedSites = unassignedSites
    ? unassignedSites.filter(site => 
        site.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Loading state
  if (serviceLoading || sitesLoading || allSitesLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (serviceError) {
    return (
      <div className="alert alert-danger m-5">
        <h4 className="alert-heading">Error loading service!</h4>
        <p>{serviceErrorMessage?.message || "An unknown error occurred"}</p>
        <hr />
        <button className="btn btn-outline-danger" onClick={() => navigate("/services")}>
          Return to Services
        </button>
      </div>
    );
  }

  if (sitesError) {
    return (
      <div className="alert alert-danger m-5">
        <h4 className="alert-heading">Error loading sites!</h4>
        <p>{sitesErrorMessage?.message || "An unknown error occurred"}</p>
        <hr />
        <button className="btn btn-outline-danger" onClick={() => navigate("/services")}>
          Return to Services
        </button>
      </div>
    );
  }

  return (
    <div className="main-content bg-light">
      <div className="container-fluid p-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Dashboard</a></li>
            <li className="breadcrumb-item"><a href="/services">Services</a></li>
            <li className="breadcrumb-item active" aria-current="page">{service?.name || "Service Details"}</li>
          </ol>
        </nav>

        {/* Service Header */}
        <div className="row mb-4">
          <div className="col-md-8">
            <h2 className="mb-1">{service?.name || "Service Details"}</h2>
            {!editing && service?.description && (
              <p className="text-muted">{service.description}</p>
            )}
          </div>
          <div className="col-md-4 text-md-end">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => navigate("/services")}
            >
              <i className="bi bi-arrow-left"></i> Back
            </button>
            {!editing ? (
              <>
                <button
                  className="btn btn-primary me-2"
                  onClick={() => setEditing(true)}
                >
                  <i className="bi bi-pencil"></i> Edit
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                >
                  <i className="bi bi-trash"></i> Delete
                </button>
              </>
            ) : (
              <button
                className="btn btn-outline-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="row">
          {/* Service Details / Edit Form */}
          <div className="col-lg-5 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">{editing ? "Edit Service" : "Service Information"}</h5>
              </div>
              <div className="card-body">
                {editing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Service Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Enter a description for this service"
                      />
                    </div>
                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-primary" disabled={updateService.isLoading}>
                        {updateService.isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="row mb-2">
                      <div className="col-sm-4 fw-bold">ID:</div>
                      <div className="col-sm-8">{service?.id}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-sm-4 fw-bold">Name:</div>
                      <div className="col-sm-8">{service?.name}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-sm-4 fw-bold">Description:</div>
                      <div className="col-sm-8">{service?.description || <span className="text-muted">No description provided</span>}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-sm-4 fw-bold">Sites:</div>
                      <div className="col-sm-8">
                        <span className="badge bg-primary rounded-pill">{assignedSites?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Sites & Assignment */}
          <div className="col-lg-7">
            {/* Assigned Sites */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Assigned Sites</h5>
                <span className="badge bg-primary rounded-pill">{assignedSites?.length || 0}</span>
              </div>
              <div className="card-body p-0">
                {assignedSites && assignedSites.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Address</th>
                          <th>Type</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedSites.map((site) => (
                          <tr key={site.id}>
                            <td className="fw-medium">{site.nom}</td>
                            <td className="text-muted">{site.adresse}</td>
                            <td><span className="badge bg-info">{site.type}</span></td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  setSiteToUnassign(site);
                                }}
                              >
                                <i className="bi bi-x-circle me-1"></i> Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <i className="bi bi-building text-muted" style={{ fontSize: "3rem" }}></i>
                    </div>
                    <h6 className="text-muted">No sites assigned yet</h6>
                    <p className="small text-muted">Assign sites using the form below</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assign New Site */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Assign New Site</h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-12">
                    <div className="input-group mb-3">
                      <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search available sites..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="sites-selection mb-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {filteredUnassignedSites && filteredUnassignedSites.length > 0 ? (
                    <div className="list-group">
                      {filteredUnassignedSites.map((site) => (
                        <label key={site.id} className="list-group-item list-group-item-action d-flex align-items-center">
                          <input
                            type="radio"
                            name="siteOption"
                            value={site.id}
                            checked={selectedSiteId === site.id.toString()}
                            onChange={() => setSelectedSiteId(site.id.toString())}
                            className="form-check-input me-2"
                          />
                          <div>
                            <strong>{site.nom}</strong>
                            <div className="d-flex text-muted small">
                              <div className="me-2"><i className="bi bi-geo-alt me-1"></i>{site.adresse}</div>
                              <div><i className="bi bi-building me-1"></i>{site.type}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-muted mb-0">
                        {searchTerm ? "No matching sites found" : "No sites available for assignment"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  <button
                    className="btn btn-primary"
                    onClick={handleAssignSite}
                    disabled={!selectedSiteId || assignSite.isLoading}
                  >
                    {assignSite.isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Assign Selected Site
                      </>
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
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setIsConfirmDeleteOpen(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the service <strong>{service?.name}</strong>?</p>
                <p className="text-danger"><small>This action cannot be undone.</small></p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsConfirmDeleteOpen(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleteService.isLoading}
                >
                  {deleteService.isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete Service"
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}

      {/* Unassign Site Confirmation Modal */}
      {siteToUnassign && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Removal</h5>
                <button type="button" className="btn-close" onClick={() => setSiteToUnassign(null)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to remove the site <strong>{siteToUnassign.nom}</strong> from this service?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSiteToUnassign(null)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleUnassignSite(siteToUnassign.id)}
                  disabled={unassignSite.isLoading}
                >
                  {unassignSite.isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Removing...
                    </>
                  ) : (
                    "Remove Site"
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}

      {/* Toast Container */}
      <div id="toast-container" className="toast-container position-fixed bottom-0 end-0 p-3"></div>
    </div>
  );
};

export default ServiceDetail;