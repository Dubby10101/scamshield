import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Register from './pages/Register';
import Background3D from './components/Background3D';
import Background3DFix from './components/Background3DFix';
import FeedbackButton from './components/FeedbackButton';
import { AuthProvider } from './context/AuthContext';
import { AnalysisProvider } from './context/AnalysisContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <div className="app">
        <Background3D />
        <Background3DFix />
        <Navbar />
        <main className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/watchlist" element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <FeedbackButton />
        <footer className="footer mt-5 py-4" style={{ backgroundColor: 'rgba(10, 10, 10, 0.7)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(76, 175, 80, 0.2)', padding: '15px 0' }}>
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-shield-check me-2" style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}></i>
                  <h5 className="mb-0" style={{ color: 'white' }}>ScamShield</h5>
                </div>
                <p style={{ color: 'var(--text-color)' }}>AI-Powered Scam Website Detection platform helping users stay safe online through advanced threat analysis.</p>
              </div>
              <div className="col-md-3">
                <h6 className="mb-3" style={{ color: 'var(--text-color)' }}>Quick Links</h6>
                <ul className="list-unstyled">
                  <li className="mb-2"><Link to="/" className="text-decoration-none" style={{ color: 'var(--text-color)' }}>Home</Link></li>
                  <li className="mb-2"><Link to="/watchlist" className="text-decoration-none" style={{ color: 'var(--text-color)' }}>Scam Watchlist</Link></li>
                  <li className="mb-2"><Link to="/dashboard" className="text-decoration-none" style={{ color: 'var(--text-color)' }}>Dashboard</Link></li>
                </ul>
              </div>
              <div className="col-md-3">
                <h6 className="mb-3" style={{ color: 'var(--text-color)' }}>Connect</h6>
                <div className="d-flex gap-3">
                  <a href="#" className="text-decoration-none" style={{ color: 'var(--text-color)' }}><i className="bi bi-github"></i></a>
                  <a href="#" className="text-decoration-none" style={{ color: 'var(--text-color)' }}><i className="bi bi-twitter"></i></a>
                  <a href="#" className="text-decoration-none" style={{ color: 'var(--text-color)' }}><i className="bi bi-linkedin"></i></a>
                </div>
              </div>
            </div>
            <div className="border-top mt-4 pt-3" style={{ borderColor: 'var(--border-color)' }}>
              <p className="text-center mb-0" style={{ color: 'var(--text-color)' }}> 2025 <span style={{ color: 'white' }}>ScamShield</span></p>
            </div>
          </div>
        </footer>
        </div>
      </AnalysisProvider>
    </AuthProvider>
  );
}

export default App;