import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useSondageById,
  useServicesBySondageId,
  useUpdateSondage,
  useDeleteSondage,
  useAssignServiceToSondage,
  useUnassignServiceFromSondage,
  useServices,
} from "../../../services/hooks"; // Adjust import path as needed

const SondageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sondageId = parseInt(id);

  // Fetch sondage details
  const {
    data: sondage,
    isLoading: sondageLoading,
    isError: sondageError,
    error: sondageErrorMessage,
  } = useSondageById(sondageId);

  // Fetch sondage's services
  const {
    data: assignedServices,
    isLoading: servicesLoading,
    isError: servicesError,
    error: servicesErrorMessage,
  } = useServicesBySondageId(sondageId);

  // Fetch all available services for assignment
  const { data: allServices, isLoading: allServicesLoading } = useServices();

  // Mutations
  const updateSondage = useUpdateSondage(sondageId);
  const deleteSondage = useDeleteSondage(sondageId);
  const assignService = useAssignServiceToSondage(sondageId);
  const unassignService = useUnassignServiceFromSondage(sondageId);

  // State for form
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [selectedServiceId, setSelectedServiceId] = useState("");

  // Initialize form data when sondage data is loaded
  useEffect(() => {
    if (sondage) {
      setFormData({
        titre: sondage.titre,
        description: sondage.description,
        startDate: sondage.startDate,
        endDate: sondage.endDate,
      });
    }
  }, [sondage]);

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
    updateSondage.mutate(
      { id: sondageId, ...formData },
      {
        onSuccess: () => {
          setEditing(false);
        },
      }
    );
  };

  // Handle sondage deletion
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this sondage?")) {
      deleteSondage.mutate(null, {
        onSuccess: () => {
          navigate("/sondages");
        },
      });
    }
  };

  // Handle service assignment
  const handleAssignService = () => {
    if (selectedServiceId) {
      assignService.mutate({ serviceId: parseInt(selectedServiceId) });
      setSelectedServiceId("");
    }
  };

  // Handle service unassignment
  const handleUnassignService = (serviceId) => {
    if (window.confirm("Are you sure you want to remove this service from the sondage?")) {
      unassignService.mutate({ serviceId });
    }
  };

  // Loading state
  if (sondageLoading || servicesLoading || allServicesLoading) {
    return <div>Loading...</div>;
  }

  // Error state
  if (sondageError) {
    return <div>Error loading sondage: {sondageErrorMessage?.message}</div>;
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

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'WILL_START_SOON':
        return 'bg-warning';
      case 'STARTED':
        return 'bg-success';
      case 'FINISHED':
        return 'bg-secondary';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="middle-sidebar-bottom">
        <div className="middle-wrap">
          <div className="card w-100 border-0 bg-white shadow-xs p-0 mb-4">
            <div className="card-body p-4 w-100 bg-blue-gradiant border-0 d-flex rounded-3">
              <h4 className="font-xs text-white fw-600 ms-4 mb-0 mt-2">
                {editing ? "Edit Sondage" : "Sondage Details"}
              </h4>
            </div>
            <div className="card-body p-lg-5 p-4 w-100 border-0">
              <div className="row mb-4">
                <div className="col-12 mb-3">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={() => navigate("/sondages")}
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

              {/* Sondage Details / Edit Form */}
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-6 mb-3">
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
                    <div className="col-lg-6 mb-3">
                      <div className="form-group">
                        <label className="mb-2">Description</label>
                        <input
                          type="text"
                          className="form-control"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 mb-3">
                      <div className="form-group">
                        <label className="mb-2">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 mb-3">
                      <div className="form-group">
                        <label className="mb-2">End Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="endDate"
                          value={formData.endDate}
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
                  <div className="col-lg-6 mb-3">
                    <p>
                      <strong>Titre:</strong> {sondage?.titre}
                    </p>
                  </div>
                  <div className="col-lg-6 mb-3">
                    <p>
                      <strong>Description:</strong> {sondage?.description}
                    </p>
                  </div>
                  <div className="col-lg-6 mb-3">
                    <p>
                      <strong>Created Date:</strong>{" "}
                      {new Date(sondage?.createDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-lg-6 mb-3">
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`badge ${getStatusBadgeClass(sondage?.status)}`}>
                        {sondage?.status?.replace(/_/g, " ")}
                      </span>
                    </p>
                  </div>
                  <div className="col-lg-6 mb-3">
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {new Date(sondage?.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-lg-6 mb-3">
                    <p>
                      <strong>End Date:</strong>{" "}
                      {new Date(sondage?.endDate).toLocaleDateString()}
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

export default SondageDetail;