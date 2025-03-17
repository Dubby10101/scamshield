import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component will check if the user is authenticated
// If authenticated, it renders the protected component
// If not, it redirects to the login page
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  
  // If auth is still loading, you might want to show a loading spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // If logged in, render the protected component
  return children;
}

export default ProtectedRoute;