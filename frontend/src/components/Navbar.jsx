import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  // Get authentication state from context
  const { isLoggedIn, logout: authLogout, currentUser } = useAuth();
  const userCredits = currentUser?.credits || 100;
  const navigate = useNavigate();

  const handleLogout = () => {
    // Use the logout function from AuthContext
    authLogout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ 
      backgroundColor: 'rgba(10, 10, 10, 0.7)', 
      backdropFilter: 'blur(10px)', 
      borderBottom: '1px solid rgba(76, 175, 80, 0.3)', 
      padding: '15px 0',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
    }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-shield-check me-2" style={{ fontSize: '1.5rem', color: 'var(--primary-color)', filter: 'drop-shadow(0 0 5px rgba(76, 175, 80, 0.5))' }}></i>
          <span style={{ fontWeight: '700', letterSpacing: '0.5px', color: 'var(--text-color)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>ScamShield</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav d-flex flex-row" style={{ 
            gap: '15px', 
            margin: '0 auto',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.7)',
            borderRadius: '30px',
            padding: '5px 15px',
            boxShadow: '0 0 15px rgba(76, 175, 80, 0.3)'
          }}>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/" style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-color)', textShadow: '0 0 10px rgba(0, 0, 0, 0.8)' }}>
                HOME
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/dashboard" style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-color)', textShadow: '0 0 10px rgba(0, 0, 0, 0.8)' }}>
                DASHBOARD
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/watchlist" style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-color)', textShadow: '0 0 10px rgba(0, 0, 0, 0.8)' }}>
                WATCHLIST
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center" style={{ marginLeft: 'auto' }}>
            {isLoggedIn ? (
              <>
                <span className="text-light me-3" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>
                  <span className="credit-badge me-2">
                    <i className="bi bi-coin me-1"></i>
                    {userCredits}
                  </span>
                  Credits
                </span>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                  style={{ boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn" style={{ 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                  color: 'var(--text-color)', 
                  border: '1px solid rgba(76, 175, 80, 0.7)', 
                  borderRadius: '30px', 
                  padding: '8px 25px', 
                  fontWeight: '600', 
                  fontSize: '0.9rem',
                  boxShadow: '0 0 15px rgba(76, 175, 80, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                }}>
                  <i className="bi bi-box-arrow-in-right" style={{ fontSize: '1.1rem' }}></i>
                  SIGN IN
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;