import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Get the login function from AuthContext
  const { login } = useAuth();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Mock API call - in a real app, this would be an actual API request
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Mock successful login
      console.log('Login attempt with:', formData);
      
      // Use the login function from AuthContext
      const userData = {
        email: formData.email,
        credits: 175 // Mock user data
      };
      login(userData);
      
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card auth-form">
          <div className="card-body">
            <h2 className="text-center mb-4" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>Login to ScamShield</h2>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label" style={{ color: '#ffffff' }}>Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label" style={{ color: '#ffffff' }}>Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="rememberMe" />
                <label className="form-check-label" htmlFor="rememberMe" style={{ color: '#ffffff' }}>Remember me</label>
              </div>
              
              <div className="d-grid gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : 'Login'}
                </button>
                
                <div className="text-center my-3">
                  <div className="divider d-flex align-items-center my-2">
                    <span className="text-muted mx-2">OR</span>
                  </div>
                </div>
                
                <div className="d-flex justify-content-center">
                  <GoogleLogin
                    onSuccess={credentialResponse => {
                      console.log('Google login success:', credentialResponse);
                      // Call backend to verify and login with Google
                      axios.post('/api/auth/login/google', { credential: credentialResponse.credential })
                        .then(response => {
                          console.log('Login successful:', response.data);
                          login(response.data.user);
                          navigate('/dashboard');
                        })
                        .catch(error => {
                          console.error('Google login error:', error);
                          setError('Failed to login with Google. Please try again.');
                        });
                    }}
                    onError={() => {
                      console.error('Google login failed');
                      setError('Google login failed. Please try again.');
                    }}
                    useOneTap
                    theme="filled_blue"
                    text="signin_with"
                    shape="rectangular"
                  />
                </div>
              </div>
              
              <div className="text-center mt-3">
                <p style={{ color: '#ffffff' }}>
                  Don't have an account? <Link to="/register" style={{ color: '#4caf50' }}>Register</Link>
                </p>
                <p style={{ color: '#ffffff' }}>
                  <a href="#" className="text-decoration-none" style={{ color: '#4caf50' }}>Forgot password?</a>
                </p>
              </div>
            </form>
          </div>
        </div>
        
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title" style={{ color: '#ffffff' }}>Why Join ScamShield?</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item bg-transparent" style={{ color: '#ffffff' }}>
                <i className="bi bi-shield-check me-2" style={{ color: 'var(--primary-color)' }}></i>
                Protect yourself from online scams
              </li>
              <li className="list-group-item bg-transparent" style={{ color: '#ffffff' }}>
                <i className="bi bi-graph-up me-2" style={{ color: 'var(--primary-color)' }}></i>
                Track your URL analysis history
              </li>
              <li className="list-group-item bg-transparent" style={{ color: '#ffffff' }}>
                <i className="bi bi-coin me-2" style={{ color: 'var(--primary-color)' }}></i>
                Earn credits for identifying scam websites
              </li>
              <li className="list-group-item bg-transparent" style={{ color: '#ffffff' }}>
                <i className="bi bi-people me-2" style={{ color: 'var(--primary-color)' }}></i>
                Join a community fighting against online fraud
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;