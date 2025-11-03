import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure } from '../../features/authSlice';
import { login } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import backgroundImage from '../../assets/images/bs3.png'; // your generated image

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (credentials) => login(credentials),
    onSuccess: (data) => {
      dispatch(loginSuccess({ token: data.token, user: data.user }));
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/settings');
    },
    onError: (error) => {
      dispatch(loginFailure(error.message));
      alert('Login failed. Please check your credentials and try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
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
      {loginMutation.isPending && <div className="preloader"></div>}

    

      {/* Floating bubbles */}
      <div className="bubble bubble-1"></div>
      <div className="bubble bubble-2"></div>
      <div className="bubble bubble-3"></div>
      <div className="bubble bubble-4"></div>
      <div className="bubble bubble-5"></div>
      <div className="bubble bubble-6"></div>
      <div className="bubble bubble-7"></div>
      <div className="bubble bubble-8"></div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <i className="input-icon ti-email"></i>
          <input
            type="text"
            className="login-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <i className="input-icon ti-lock"></i>
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-check text-left mb-2" style={{ color: 'white' }}>
          <input
            type="checkbox"
            className="form-check-input mt-1"
            id="remember"
          />
          <label className="form-check-label" htmlFor="remember">
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="float-right"
            style={{ color: '#fff', fontSize: '14px' }}
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="login-button"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Logging in...' : 'Log In'}
        </button>
        {loginMutation.isError && (
          <div className="error-message">
            {loginMutation.error.message}
          </div>
        )}
      </form>
    </div>
  );
}

export default Login;
