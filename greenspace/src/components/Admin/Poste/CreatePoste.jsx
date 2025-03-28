import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePoste } from "../../../services/hooks"; // Adjust import path as needed

const CreatePoste = () => {
  const navigate = useNavigate();
  const createPoste = useCreatePoste();
  
  const [formData, setFormData] = useState({
    titre: ""
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    createPoste.mutate(formData, {
      onSuccess: () => {
        navigate("/postes");
      }
    });
  };
  
  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="middle-sidebar-bottom">
        <div className="middle-wrap">
          <div className="card w-100 border-0 bg-white shadow-xs p-0 mb-4">
            <div className="card-body p-4 w-100 bg-blue-gradiant border-0 d-flex rounded-3">
              <h4 className="font-xs text-white fw-600 ms-4 mb-0 mt-2">Create New Poste</h4>
            </div>
            <div className="card-body p-lg-5 p-4 w-100 border-0">
              <div className="row mb-4">
                <div className="col-12">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => navigate("/postes")}
                  >
                    Back to List
                  </button>
                </div>
              </div>
              
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
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={createPoste.isLoading}
                    >
                      {createPoste.isLoading ? "Creating..." : "Create Poste"}
                    </button>
                  </div>
                </div>
              </form>
              
              {createPoste.isError && (
                <div className="alert alert-danger mt-3">
                  Error creating poste: {createPoste.error.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePoste;