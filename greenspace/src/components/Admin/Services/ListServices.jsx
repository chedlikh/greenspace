import React from 'react';
import { Link } from 'react-router-dom';
import { useGservices } from '../../../services/hooks';

const ListServices = () => {
  const { data: services, isLoading, isError, error } = useGservices();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading services: {error.message}</div>;

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="middle-sidebar-bottom">
        <div className="middle-wrap">
          <div className="card w-100 border-0 bg-white shadow-xs p-0 mb-4">
            <div className="card-body p-4 w-100 bg-blue-gradiant border-0 d-flex rounded-3">
              <h4 className="font-xs text-white fw-600 ms-4 mb-0 mt-2">Services</h4>
            </div>
            <div className="card-body p-lg-5 p-4 w-100 border-0">
              <div className="row mb-4">
                <div className="col-12 mb-3">
                  <Link to="/services/new" className="btn btn-primary">
                    Add New Service
                  </Link>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Number of Sites</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services && services.length > 0 ? (
                      services.map((service) => (
                        <tr key={service.id}>
                          <td>{service.name}</td>
                          <td>{service.description}</td>
                          <td>{service.sites ? service.sites.length : 0}</td>
                          <td>
                            <Link
                              to={`/services/${service.id}`}
                              className="btn btn-sm btn-primary me-2"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No services found
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
  );
};

export default ListServices;