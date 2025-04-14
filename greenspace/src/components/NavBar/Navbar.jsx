import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import { logout, fetchUserDetailsThunk } from '../../features/authSlice'; // Import the async thunk
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  

  useEffect(() => {
    if (user && !user.email) {
      dispatch(fetchUserDetailsThunk()); // Dispatch the async thunk
    }
  }, [user, dispatch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="nav-header bg-white shadow-xs border-0">
      {/* Top Navbar */}
      <div className="nav-top d-flex align-items-center justify-content-between">
        <Link to="/" className="logo-link d-flex align-items-center">
          <i className="feather-zap text-success display1-size me-2 ms-0"></i>
          <span className="d-inline-block fredoka-font ls-3 fw-600 text-current font-xxl logo-text mb-0">
            Sociala.
          </span>
        </Link>

        {/* Mobile Menu Icons */}
        <div className="d-flex">
          <Link to="/messages" className="mob-menu me-2">
            <i className="feather-message-circle text-grey-900 font-sm btn-round-md bg-greylight"></i>
          </Link>
          <Link to="/videos" className="mob-menu me-2">
            <i className="feather-video text-grey-900 font-sm btn-round-md bg-greylight"></i>
          </Link>
          <a href="#" className="me-2 menu-search-icon mob-menu">
            <i className="feather-search text-grey-900 font-sm btn-round-md bg-greylight"></i>
          </a>
        </div>
      </div>

      {/* Search Bar */}
      <form action="#" className="float-left header-search">
        <div className="form-group mb-0 icon-input">
          <i className="feather-search font-sm text-grey-400"></i>
          <input
            type="text"
            placeholder="Start typing to search..."
            className="bg-grey border-0 lh-32 pt-2 pb-2 ps-5 pe-3 font-xssss fw-500 rounded-xl w350 theme-dark-bg"
          />
        </div>
      </form>

      {/* Main Navigation */}
      <div className="d-flex align-items-center">
        <Link to="/home" className="p-2 text-center ms-3 menu-icon">
          <i className="feather-home font-lg alert-primary btn-round-lg theme-dark-bg text-current"></i>
        </Link>
        <Link to="/stories" className="p-2 text-center ms-0 menu-icon">
          <i className="feather-zap font-lg bg-greylight btn-round-lg theme-dark-bg text-grey-500"></i>
        </Link>

        {/* Settings Dropdown */}
        {user && (
          <Dropdown className="p-2 text-center ms-3">
            <Dropdown.Toggle
              variant="none"
              id="dropdown-settings"
              className="cursor-pointer"
              style={{ background: "none", border: "none", outline: "none" }}
            >
              <i className="feather-settings animation-spin font-xl text-current"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-settings switchcolor-wrap">
              <h4 className="fw-700 font-sm mb-4">Settings</h4>
              <h6 className="font-xssss text-grey-500 fw-700 mb-3">Choose Color Theme</h6>
              <ul className="theme-color-options">
                {["red", "green", "blue", "pink", "yellow", "orange", "gray", "brown", "darkgreen", "deeppink", "cadetblue", "darkorchid"].map((color) => (
                  <li key={color}>
                    <label className="item-radio item-content">
                      <input type="radio" name="color-radio" value={color} />
                      <i className="ti-check"></i>
                      <span className="circle-color" style={{ backgroundColor: color }}></span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="card bg-transparent-card border-0 d-block mt-3">
                <h4 className="d-inline font-xssss mont-font fw-700">Dark Mode</h4>
                <div className="d-inline float-right mt-1">
                  <label className="toggle toggle-dark">
                    <input type="checkbox" />
                    <span className="toggle-icon"></span>
                  </label>
                </div>
              </div>
            </Dropdown.Menu>
          </Dropdown>
        )}

        {/* Profile Dropdown */}
        {user ? (
          <Dropdown className="p-2 text-center ms-3 position-relative">
            <Dropdown.Toggle
              variant="none"
              id="dropdown-profile"
              className="cursor-pointer"
              style={{ background: "none", border: "none", outline: "none" }}
            >
              
              <img
                 src={user.photoProfile ? `http://localhost:8089/images/${user.photoProfile}` : "images/default-user.png"}
                     alt="user"
                className="rounded-circle"
                width="40"
                height="40"
              />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
              <Dropdown.Item as={Link} to="/settings">Settings</Dropdown.Item>
              <Dropdown.Item onClick={() => dispatch(logout())}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Link to="/login" className="p-2 text-center ms-3">
            <i className="feather-log-in font-lg bg-greylight btn-round-lg theme-dark-bg text-grey-500"></i>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
