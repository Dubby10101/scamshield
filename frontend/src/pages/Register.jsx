import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  // In a real app, this would call the backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Mock API call - in a real app, this would be an actual API request
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Mock successful registration
      console.log('Registration attempt with:', formData);
      
      // Log the user in after successful registration
      const userData = {
        email: formData.email,
        username: formData.username,
        credits: 175 // Mock user data
      };
      login(userData);
      
      // Redirect to dashboard after successful registration
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="auth-form">
          <h2>Create an Account</h2>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="form-text">We'll never share your email with anyone else.</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="8"
              />
              <div className="form-text">Password must be at least 8 characters long.</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-3 form-check">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="termsAgreement"
                required
              />
              <label className="form-check-label" htmlFor="termsAgreement">
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </label>
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
                    Creating Account...
                  </>
                ) : 'Register'}
              </button>
            </div>
            
            <div className="text-center mt-3">
              <p>
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </div>
          </form>
        </div>
        
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">Benefits of Joining ScamShield</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <i className="bi bi-shield-check text-primary me-2"></i>
                Free access to our AI-powered scam detection tool
              </li>
              <li className="list-group-item">
                <i className="bi bi-coin text-primary me-2"></i>
                Earn credits for each URL you analyze
              </li>
              <li className="list-group-item">
                <i className="bi bi-trophy text-primary me-2"></i>
                Get bonus credits when you help identify new scams
              </li>
              <li className="list-group-item">
                <i className="bi bi-bell text-primary me-2"></i>
                Receive alerts about new scam techniques and threats
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;