import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ fullScreen = false }) => (
  <div className={`loading-overlay ${fullScreen ? 'full-screen' : ''}`}>
    <div className="spinner">
      <div className="double-bounce1"></div>
      <div className="double-bounce2"></div>
    </div>
    <p>Loading...</p>
  </div>
);

export default LoadingOverlay;