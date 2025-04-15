import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useSiteById,
  useUpdateSite,
  useDeleteSite,
} from "../../../services/hooks";

// SiteDetails Component
const SiteDetails = () => {
  const { id } = useParams(); // Get site ID from URL
  const token = useSelector((state) => state.auth.token); // Get token from Redux
  const navigate = useNavigate();

  // Fetch site details using custom hook
  const { data: site, isLoading, isError, error } = useSiteById(id, token);

  // Update site mutation
  const updateSiteMutation = useUpdateSite(id, token);

  // Delete site mutation
  const deleteSiteMutation = useDeleteSite(id, token);

  // Local state for editable fields
  const [editableSite, setEditableSite] = useState({
    nom: "",
    adresse: "",
    type: "",
  });

  // Update local state when site data is fetched
  useEffect(() => {
    if (site) {
      setEditableSite(site);
    }
  }, [site]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableSite((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle update button click
  const handleUpdate = () => {
    updateSiteMutation.mutate(editableSite);
  };

  // Handle delete button click
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${editableSite.nom}?`)) {
      deleteSiteMutation.mutate();
      navigate("/sites"); // Redirect to the sites list after deletion
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="middle-sidebar-bottom">
        <div className="middle-wrap">
          <div className="card w-100 border-0 bg-white shadow-xs p-0 mb-4">
            <div className="card-body p-4 w-100 bg-blue-gradiant border-0 d-flex rounded-3">
              <h4 className="font-xs text-white fw-600 ms-4 mb-0 mt-2">Site Details</h4>
            </div>
            <div className="card-body p-lg-5 p-4 w-100 border-0">
              <div className="row justify-content-center">
                <div className="col-lg-4 text-center">
                  <h2 className="fw-700 font-sm text-grey-900 mt-3">{editableSite.nom}</h2>
                  <h4 className="text-grey-500 fw-500 mb-3 font-xsss mb-4">
                    {editableSite.adresse}
                  </h4>
                </div>
              </div>

              {/* Editable site details form */}
              <form>
                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nom"
                      value={editableSite.nom || ""}
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
                      value={editableSite.adresse || ""}
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
                      value={editableSite.type || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="MAGASIN">Magasin</option>
                      <option value="SIEGE">Siege</option>
                    </select>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-lg-12 text-center">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => navigate("/sites")}
                    >
                      Back to List
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary me-2"
                      onClick={handleUpdate}
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger me-2"
                      onClick={handleDelete}
                    >
                      Delete
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

export default SiteDetails;