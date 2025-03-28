import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice'; // Import logout from the new authSlice
import { useQuery } from '@tanstack/react-query'; // Use React Query for fetching user details
import Navbar from '../NavBar/Navbar';
import NavLeft from '../NavBar/NavLeft';
import { fetchUserDetails } from '../../services/hooks'; // Import the fetchUserDetails function

const MyInfo = () => {
  const dispatch = useDispatch();
  const { token, user: reduxUser } = useSelector((state) => state.auth);

  // Use React Query to fetch user details
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['userDetails', token], // Query key
    queryFn: () => fetchUserDetails(token), // Query function
    enabled: !!token, // Only fetch if token exists
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Combine Redux user and React Query user
  const combinedUser = user || reduxUser;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching user details.</div>;
  }

  if (!combinedUser) {
    return <div>No user data available.</div>;
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
    
      
        
        
        <div className="middle-wrap">
          <div className="card w-100 border-0 bg-white shadow-xs p-0 mb-4">
            <div className="card-body p-4 w-100 bg-blue-gradiant border-0 d-flex rounded-3">
              <h4 className="font-xs text-white fw-600 ms-4 mb-0 mt-2">Account Details</h4>
            </div>
            <div className="card-body p-lg-5 p-4 w-100 border-0">
              <div className="row justify-content-center">
                <div className="col-lg-4 text-center">
                  <figure className="avatar ms-auto me-auto mb-0 mt-2 w100">
                  <img
                     src={user.photoProfile ? `http://localhost:8089/images/${user.photoProfile}` : "images/default-user.png"}
                     alt="user"
                     className="rounded-circle border shadow"
                     width="120"
                     height="120"
                  />
                  </figure>
                  <h2 className="fw-700 font-sm text-grey-900 mt-3">
                    {combinedUser.firstname} {combinedUser.lastName}
                  </h2>
                  <h4 className="text-grey-500 fw-500 mb-3 font-xsss mb-4">
                    {combinedUser.country || "N/A"}
                  </h4>
                </div>
              </div>

              <form>
                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={combinedUser.firstname || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={combinedUser.lastName || "N/A"}
                      readOnly
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={combinedUser.username || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Email</label>
                    <input
                      type="text"
                      className="form-control"
                      value={combinedUser.email || "N/A"}
                      readOnly
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={combinedUser.phone || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Gender</label>
                    <input
                      type="text"
                      className="form-control"
                      value={combinedUser.gender || "N/A"}
                      readOnly
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-12 mb-3">
                    <label className="mont-font fw-600 font-xsss">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={combinedUser.adress || "N/A"}
                      readOnly
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Birthday</label>
                    <input
                      type="text"
                      className="form-control"
                      value={combinedUser.birthday || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Account Created</label>
                    <input
                      type="text"
                      className="form-control"
                      value={combinedUser.createDate || "N/A"}
                      readOnly
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Last Active</label>
                    <input
                      type="text"
                      className="form-control"
                      value={combinedUser.activeDate || "N/A"}
                      readOnly
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-12 mb-3">
                    <label className="mont-font fw-600 font-xsss">Site Details</label>
                    <div
                      className="p-3 rounded-3"
                      style={{ backgroundColor: "#f0f8ff", border: "1px solid #ccc" }}
                    >
                      <div className="mb-2">
                        <strong>Nom du site :</strong>
                        <input
                          type="text"
                          className="form-control mt-1"
                          value={combinedUser.site?.nom || "N/A"}
                          readOnly
                        />
                      </div>
                      <div className="mb-2">
                        <strong>Adresse du site :</strong>
                        <input
                          type="text"
                          className="form-control mt-1"
                          value={combinedUser.site?.adresse || "N/A"}
                          readOnly
                        />
                      </div>
                      <div className="mb-2">
                        <strong>Type du site :</strong>
                        <input
                          type="text"
                          className="form-control mt-1"
                          value={combinedUser.site?.type || "N/A"}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-12 mb-3">
                    <label className="mont-font fw-600 font-xsss">Role</label>
                    <input
                      type="text"
                      className="form-control"
                      value={
                        combinedUser.authorities
                          ? combinedUser.authorities.map((auth) => auth.authority).join(", ")
                          : "N/A"
                      }
                      readOnly
                    />
                  </div>
                </div>

                <div className="col-lg-12">
                  <button
                    type="button"
                    className="bg-blue-gradiant text-center text-white font-xsss fw-600 p-3 w175 rounded-3 d-inline-block"
                    onClick={() => dispatch(logout())}
                  >
                    Logout
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default MyInfo;