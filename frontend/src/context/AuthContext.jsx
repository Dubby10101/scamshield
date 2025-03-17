import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to handle login
  const login = (userData) => {
    // In a real app, you would store the user data and token in localStorage or cookies
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
    setIsLoggedIn(true);
    return true;
  };

  // Function to handle logout
  const logout = () => {
    // Clear user data from storage
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  // Check if user is already logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  // Create value object to be provided to consumers
  const value = {
    currentUser,
    isLoggedIn,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}