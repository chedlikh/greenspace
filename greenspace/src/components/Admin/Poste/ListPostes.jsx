import React from "react";
import { usePostes } from "../../../services/hooks"; // Adjust import path as needed
import { useNavigate } from "react-router-dom";

const ListPostes = () => {
  const { data: postes, isLoading, isError, error } = usePostes();
  const navigate = useNavigate();
  
  const handlePosteClick = (id) => {
    navigate(`/poste/${id}`);
  };
  
  if (isLoading) {
    return <div>Loading postes...</div>;
  }
  
  if (isError) {
    return <div>Error fetching postes: {error.message}</div>;
  }
  
  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="middle-sidebar-bottom">
        <div className="middle-wrap">
          <div className="card w-100 border-0 bg-white shadow-xs p-0 mb-4">
            <div className="card-body p-4 w-100 bg-blue-gradiant border-0 d-flex rounded-3">
              <h4 className="font-xs text-white fw-600 ms-4 mb-0 mt-2">List of Postes</h4>
            </div>
            <div className="card-body p-lg-5 p-4 w-100 border-0">
              <button
                type="button"
                className="btn btn-primary mb-4"
                onClick={() => navigate("/create-poste")}
              >
                Create New Poste
              </button>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Services Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postes && postes.map((poste) => (
                      <tr key={poste.id} onClick={() => handlePosteClick(poste.id)} style={{ cursor: "pointer" }}>
                        <td>{poste.titre}</td>
                        <td>{poste.gservices ? poste.gservices.length : 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListPostes;