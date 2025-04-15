import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  usePosteById,
  useServicesByPosteId,
  useUpdatePoste,
  useDeletePoste,
  useAssignServiceToPoste,
  useUnassignServiceFromPoste,
  useUnassignUsersFromPoste,
  useAssignUsersToPoste,
  useServices,
  useUsersByPosteId,
  useUsers
} from "../../../services/hooks";

const PosteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const posteId = parseInt(id);

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

  const { data: allServices, isLoading: allServicesLoading } = useServices();
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

  // Loading/error states
  if (posteLoading || servicesLoading || allServicesLoading || 
      assignedUsersLoading || usersQuery?.isLoading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  if (posteError || servicesError || assignedUsersError) {
    return (
      <div className="alert alert-danger">
        {posteErrorMessage?.message || 
         servicesErrorMessage?.message || 
         assignedUsersErrorMessage?.message}
      </div>
    );
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
    <div className="container-fluid">
      <div className="card shadow-lg mt-4">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4>{editing ? "Edit Poste" : "Poste Details"}</h4>
            <div>
              <button 
                className="btn btn-light me-2"
                onClick={() => navigate("/postes")}
              >
                Back
              </button>
              {!editing && (
                <>
                  <button
                    className="btn btn-warning me-2"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Poste Details Form */}
          {editing ? (
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Titre</label>
                    <input
                      type="text"
                      className="form-control"
                      name="titre"
                      value={formData.titre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary me-2">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="mb-4">
              <h5>Titre: {poste?.titre}</h5>
            </div>
          )}

          <div className="row">
            {/* Services Section */}
            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h5>Assigned Services</h5>
                </div>
                <div className="card-body">
                  {assignedServices?.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedServices.map(service => (
                            <tr key={service.id}>
                              <td>{service.name}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleUnassignService(service.id)}
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
                    <p className="text-muted">No services assigned</p>
                  )}

                  <div className="mt-3">
                    <h6>Assign New Service</h6>
                    <div className="input-group mb-3">
                      <select
                        className="form-select"
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
                        className="btn btn-primary"
                        onClick={handleAssignService}
                        disabled={!selectedServiceId}
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Section */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-light d-flex justify-content-between">
                  <h5>Assigned Users</h5>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowAssignModal(true)}
                  >
                    Assign Users
                  </button>
                </div>
                <div className="card-body">
                  {assignedUsers?.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Username</th>
                            <th>Name</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedUsers.map(user => (
                            <tr key={user.id}>
                              <td>{user.username}</td>
                              <td>{user.firstname} {user.lastname}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleUnassignUser(user.username)}
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
                    <p className="text-muted">No users assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Users Modal */}
      {showAssignModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Users to Poste</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedUsernames([]);
                    setSearchTerm("");
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="user-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {availableUsers.length > 0 ? (
                    <table className="table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Username</th>
                          <th>Name</th>
                          <th>Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableUsers.map(user => (
                          <tr key={user.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedUsernames.includes(user.username)}
                                onChange={() => toggleUserSelection(user.username)}
                              />
                            </td>
                            <td>{user.username}</td>
                            <td>{user.firstname} {user.lastname}</td>
                            <td>{user.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-muted">No users available</p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedUsernames([]);
                    setSearchTerm("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAssignUsers}
                  disabled={selectedUsernames.length === 0}
                >
                  Assign Selected ({selectedUsernames.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default PosteDetail;