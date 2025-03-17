import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './fixes.css'; // Import the fixes CSS file
import './production.css'; // Import consolidated production CSS
import './background-fix.css'; // Critical background fixes with highest priority
import './modal-fix.css'; // Modal styling fixes
import './force-styles.css'; // Force all styles with highest priority

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'}>
        <App />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);