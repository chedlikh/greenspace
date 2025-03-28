import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSondages } from "../../../services/hooks"; // Adjust import path as needed

const ListSondage = () => {
  const navigate = useNavigate();
  const { data: sondages, isLoading, isError, error } = useSondages();

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading sondages: {error?.message}</div>;
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="middle-sidebar-bottom">
        <div className="middle-sidebar-left">
          <div className="row">
            <div className="col-lg-12">
              <div className="card w-100 border-0 bg-white shadow-xs p-0 mb-4">
                <div className="card-body p-4 w-100 bg-blue-gradiant border-0 d-flex rounded-3">
                  <h4 className="font-xs text-white fw-600 ms-4 mb-0 mt-2">Sondages</h4>
                </div>
                <div className="card-body p-lg-5 p-4 w-100 border-0">
                  <div className="row mb-4">
                    <div className="col-12">
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate("/sondages/create")}
                      >
                        Create New Sondage
                      </button>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Titre</th>
                          <th>Description</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sondages && sondages.length > 0 ? (
                          sondages.map((sondage) => (
                            <tr key={sondage.id}>
                              <td>{sondage.titre}</td>
                              <td>{sondage.description}</td>
                              <td>{new Date(sondage.startDate).toLocaleDateString()}</td>
                              <td>{new Date(sondage.endDate).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${getStatusBadgeClass(sondage.status)}`}>
                                  {sondage.status?.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td>
                                <Link
                                  to={`/sondages/${sondage.id}`}
                                  className="btn btn-sm btn-primary me-2"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center">
                              No sondages found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListSondage;