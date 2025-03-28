import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  usePosteById,
  useServicesByPosteId,
  useUpdatePoste,
  useDeletePoste,
  useAssignServiceToPoste,
  useUnassignServiceFromPoste,
  useServices,
} from "../../../services/hooks"; // Adjust import path as needed

const PosteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const posteId = parseInt(id);

  // Fetch poste details
  const {
    data: poste,
    isLoading: posteLoading,
    isError: posteError,
    error: posteErrorMessage,
  } = usePosteById(posteId);

  // Fetch poste's services
  const {
    data: assignedServices,
    isLoading: servicesLoading,
    isError: servicesError,
    error: servicesErrorMessage,
  } = useServicesByPosteId(posteId);

  // Fetch all available services for assignment
  const { data: allServices, isLoading: allServicesLoading } = useServices();

  // Mutations
  const updatePoste = useUpdatePoste(posteId);
  const deletePoste = useDeletePoste(posteId);
  const assignService = useAssignServiceToPoste(posteId);
  const unassignService = useUnassignServiceFromPoste(posteId);

  // State for form
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
  });
  const [selectedServiceId, setSelectedServiceId] = useState("");

  // Initialize form data when poste data is loaded
  useEffect(() => {
    if (poste) {
      setFormData({
        titre: poste.titre,
      });
    }
  }, [poste]);

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
    updatePoste.mutate(formData, {
      onSuccess: () => {
        setEditing(false);
      },
    });
  };

  // Handle poste deletion
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this poste?")) {
      deletePoste.mutate(null, {
        onSuccess: () => {
          navigate("/postes");
        },
      });
    }
  };

  // Handle service assignment
  const handleAssignService = () => {
    if (selectedServiceId) {
      assignService.mutate(parseInt(selectedServiceId));
      setSelectedServiceId("");
    }
  };

  // Handle service unassignment
  const handleUnassignService = (serviceId) => {
    if (window.confirm("Are you sure you want to remove this service from the poste?")) {
      unassignService.mutate(serviceId);
    }
  };

  // Loading state
  if (posteLoading || servicesLoading || allServicesLoading) {
    return <div>Loading...</div>;
  }

  // Error state
  if (posteError) {
    return <div>Error loading poste: {posteErrorMessage?.message}</div>;
  }

  if (servicesError) {
    return <div>Error loading services: {servicesErrorMessage?.message}</div>;
  }

  // Get services available for assignment (services not already assigned)
  const availableServices = allServices
    ? allServices.filter(
        (service) =>
          !assignedServices ||
          !assignedServices.some((assignedService) => assignedService.id === service.id)
      )
    : [];

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="middle-sidebar-bottom">
        <div className="middle-wrap">
          <div className="card w-100 border-0 bg-white shadow-xs p-0 mb-4">
            <div className="card-body p-4 w-100 bg-blue-gradiant border-0 d-flex rounded-3">
              <h4 className="font-xs text-white fw-600 ms-4 mb-0 mt-2">
                {editing ? "Edit Poste" : "Poste Details"}
              </h4>
            </div>
            <div className="card-body p-lg-5 p-4 w-100 border-0">
              <div className="row mb-4">
                <div className="col-12 mb-3">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={() => navigate("/postes")}
                  >
                    Back to List
                  </button>
                  {!editing && (
                    <>
                      <button
                        className="btn btn-primary me-2"
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

              {/* Poste Details / Edit Form */}
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-12 mb-3">
                      <div className="form-group">
                        <label className="mb-2">Titre</label>
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
                    <div className="col-lg-12 mt-3">
                      <button type="submit" className="btn btn-primary me-2">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="row">
                  <div className="col-lg-12 mb-3">
                    <p>
                      <strong>Titre:</strong> {poste?.titre}
                    </p>
                  </div>
                </div>
              )}

              <hr className="my-4" />

              {/* Assigned Services */}
              <h5 className="font-xss fw-600 mb-3">Assigned Services</h5>

              <div className="table-responsive mb-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedServices && assignedServices.length > 0 ? (
                      assignedServices.map((service) => (
                        <tr key={service.id}>
                          <td>{service.name}</td>
                          <td>{service.description}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleUnassignService(service.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No services assigned
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Assign New Service */}
              <h5 className="font-xss fw-600 mb-3">Assign New Service</h5>

              <div className="row">
                <div className="col-lg-8 mb-3">
                  <select
                    className="form-control"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                  >
                    <option value="">Select a service to assign</option>
                    {availableServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-4 mb-3">
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleAssignService}
                    disabled={!selectedServiceId}
                  >
                    Assign Service
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

export default PosteDetail;