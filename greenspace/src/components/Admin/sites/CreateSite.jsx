import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSite } from "../../../services/hooks";

const CreateSite = () => {
  const navigate = useNavigate();
  const createSiteMutation = useCreateSite();

  // Local state for site data
  const [siteData, setSiteData] = useState({
    nom: "",
    adresse: "",
    type: "MAGASIN", // Default type
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSiteData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!siteData.nom || !siteData.adresse || !siteData.type) {
      alert("Please fill out all required fields.");
      return;
    }

    // Create site
    createSiteMutation.mutate(siteData, {
      onSuccess: () => {
        navigate("/sites"); // Navigate back to /sites after successful creation
      },
    });
  };

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="middle-sidebar-bottom">
        <div className="middle-wrap">
          <div className="card w-100 border-0 bg-white shadow-xs p-0 mb-4">
            <div className="card-body p-4 w-100 bg-blue-gradiant border-0 d-flex rounded-3">
              <h4 className="font-xs text-white fw-600 ms-4 mb-0 mt-2">Create Site</h4>
            </div>
            <div className="card-body p-lg-5 p-4 w-100 border-0">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nom"
                      value={siteData.nom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="adresse"
                      value={siteData.adresse}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Type</label>
                    <select
                      className="form-control"
                      name="type"
                      value={siteData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="MAGASIN">MAGASIN</option>
                      <option value="SIEGE">SIEGE</option>
                    </select>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-lg-12 text-center">
                    <button type="submit" className="btn btn-primary me-2">
                      Create Site
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate("/sites")}
                    >
                      Cancel
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

export default CreateSite;