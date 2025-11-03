import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useRequestPasswordReset, useResetPassword } from '../../services/hooks';
import { toast } from 'react-toastify';
import './Login.css';
import backgroundImage from '../../assets/images/bs1.png';

function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('email');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const requestPasswordReset = useRequestPasswordReset();
  const resetPassword = useResetPassword();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
      setActiveTab('email');
      setEmailSent(true);
    }
  }, [searchParams]);

  const handleRequestReset = (e) => {
    e.preventDefault();
    requestPasswordReset.mutate(
      { emailOrPhone, requestAdmin: activeTab === 'admin' },
      {
        onSuccess: (data) => {
          toast.success(data.message || 'Password reset request sent successfully!');
          if (activeTab === 'email') {
            setEmailSent(true);
          }
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`);
        },
      }
    );
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    resetPassword.mutate(
      { token: resetToken, newPassword },
      {
        onSuccess: (data) => {
          toast.success(data.message || 'Password reset successfully!');
          setEmailSent(false);
          setResetToken('');
          setNewPassword('');
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`);
        },
      }
    );
  };

  return (
    <div 
      className="login-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Floating bubbles */}
      <div className="bubble bubble-1"></div>
      <div className="bubble bubble-2"></div>
      <div className="bubble bubble-3"></div>
      <div className="bubble bubble-4"></div>
      <div className="bubble bubble-5"></div>
      <div className="bubble bubble-6"></div>
      <div className="bubble bubble-7"></div>
      <div className="bubble bubble-8"></div>

     

      <div className="login-form">
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('email');
                setEmailSent(false);
              }}
            >
              Reset via Email
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('admin');
                setEmailSent(false);
              }}
            >
              Request Admin
            </button>
          </li>
        </ul>

        {activeTab === 'email' && !emailSent ? (
          <form onSubmit={handleRequestReset}>
            <div className="form-group">
              <i className="input-icon ti-email"></i>
              <input
                type="text"
                className="login-input"
                placeholder="Email or Phone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="login-button"
              disabled={requestPasswordReset.isPending}
            >
              {requestPasswordReset.isPending ? 'Sending...' : 'Send Reset Link'}
            </button>
            {requestPasswordReset.isError && (
              <div className="error-message">
                {requestPasswordReset.error.message}
              </div>
            )}
            <div className="text-center mt-3">
              <Link to="/login" className="text-white">
                Back to Login
              </Link>
            </div>
          </form>
        ) : activeTab === 'email' && emailSent ? (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <i className="input-icon ti-key"></i>
              <input
                type="text"
                className="login-input"
                placeholder="Reset Token"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <i className="input-icon ti-lock"></i>
              <input
                type="password"
                className="login-input"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="8"
              />
            </div>
            <button
              type="submit"
              className="login-button"
              disabled={resetPassword.isPending}
            >
              {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
            </button>
            {resetPassword.isError && (
              <div className="error-message">
                {resetPassword.error.message}
              </div>
            )}
            <div className="text-center mt-3">
              <Link to="/login" className="text-white">
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRequestReset}>
            <div className="form-group">
              <i className="input-icon ti-email"></i>
              <input
                type="text"
                className="login-input"
                placeholder="Email or Phone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="login-button"
              disabled={requestPasswordReset.isPending}
            >
              {requestPasswordReset.isPending ? 'Sending...' : 'Send Request to Admin'}
            </button>
            {requestPasswordReset.isError && (
              <div className="error-message">
                {requestPasswordReset.error.message}
              </div>
            )}
            <div className="text-center mt-3">
              <Link to="/login" className="text-white">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Preloader */}
      {(requestPasswordReset.isPending || resetPassword.isPending) && (
        <div className="preloader"></div>
      )}
    </div>
  );
}

export default ForgotPassword;