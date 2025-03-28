import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSondage, useServices } from "../../../services/hooks"; // Adjust import path as needed

const CreateSondage = () => {
  const navigate = useNavigate();
  const { data: services, isLoading: servicesLoading } = useServices();
  const createSondage = useCreateSondage();

  // Form state
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [selectedServices, setSelectedServices] = useState([]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle service selection changes
  const handleServiceSelection = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => parseInt(option.value)
    );
    setSelectedServices(selectedOptions);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create sondage first
      const newSondage = await createSondage.mutateAsync(formData);
      
      // Then navigate to the detail page where services can be assigned
      navigate(`/sondages/${newSondage.id}`);
    } catch (error) {
      console.error("Error creating sondage:", error);
    }
  };

  if (servicesLoading) {
    return <div>Loading services...</div>;
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="middle-sidebar-bottom">
        <div className="middle-wrap">
          <div className="card w-100 border-0 bg-white shadow-xs p-0 mb-4">
            <div className="card-body p-4 w-100 bg-blue-gradiant border-0 d-flex rounded-3">
              <h4 className="font-xs text-white fw-600 ms-4 mb-0 mt-2">
                Create New Sondage
              </h4>
            </div>
            <div className="card-body p-lg-5 p-4 w-100 border-0">
              <div className="row mb-4">
                <div className="col-12">
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/sondages")}
                  >
                    Back to List
                  </button>
                </div>
              </div>

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
                  <div className="col-lg-12 mb-3">
                    <p className="text-muted">
                      * You can assign services to the sondage after creating it.
                    </p>
                  </div>
                  <div className="col-lg-12">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={createSondage.isLoading}
                    >
                      {createSondage.isLoading ? "Creating..." : "Create Sondage"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSondage;