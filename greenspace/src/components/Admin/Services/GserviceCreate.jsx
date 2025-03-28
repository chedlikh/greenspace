import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateGservice } from "../../../services/hooks";

const GserviceCreate = () => {
  const navigate = useNavigate();
  const createService = useCreateGservice();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createService.mutate(formData, {
      onSuccess: (data) => {
        navigate(`/services/${data.id}`);
      },
    });
  };

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="middle-sidebar-bottom">
        <div className="middle-wrap">
          <div className="card w-100 border-0 bg-white shadow-xs p-0 mb-4">
            <div className="card-body p-4 w-100 bg-blue-gradiant border-0 d-flex rounded-3">
              <h4 className="font-xs text-white fw-600 ms-4 mb-0 mt-2">
                Create New Service
              </h4>
            </div>
            <div className="card-body p-lg-5 p-4 w-100 border-0">
              <div className="row mb-4">
                <div className="col-12 mb-3">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={() => navigate("/services")}
                  >
                    Back to List
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <div className="form-group">
                      <label className="mb-2">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12 mb-3">
                    <div className="form-group">
                      <label className="mb-2">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12 mt-3">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={createService.isLoading}
                    >
                      {createService.isLoading ? 'Creating...' : 'Create Service'}
                    </button>
                  </div>
                </div>
              </form>
              
              {createService.isError && (
                <div className="alert alert-danger mt-3">
                  Error creating service: {createService.error.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GserviceCreate;