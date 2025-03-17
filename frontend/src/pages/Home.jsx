import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './placeholder-styles.css';
import { useAuth } from '../context/AuthContext';
import { useAnalysis } from '../context/AnalysisContext';
import apiService from '../services/api';

function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isLoggedIn, currentUser } = useAuth();
  const { notifyAnalysisCompleted } = useAnalysis();
  const navigate = useNavigate();

  // Call the backend API to analyze the URL
  const analyzeUrl = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare request data
      const requestData = { url };
      if (isLoggedIn && currentUser && currentUser.id) {
        requestData.user_id = currentUser.id;
      }
      
      // Make an API request using the service
      console.log("Connecting to backend API...");
      const response = await apiService.analyzeUrl(url);
      console.log("API Response:", response);
      
      // Axios wraps the response in a data property
      const data = response.data;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResult(data);
      
      // Notify other components that an analysis has been completed
      notifyAnalysisCompleted(url, data);
      
      // Show login modal if user is not logged in
      if (!isLoggedIn) {
        setShowLoginModal(true);
      }
    } catch (err) {
      console.error('Error analyzing URL:', err);
      
      // Provide more specific error messages based on the error type
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server error: ${err.response.status} - ${err.response.data.error || 'Unknown error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('Failed to connect to the analysis server. Please check your internet connection or try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Failed to analyze URL: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColorClass = (score) => {
    if (score > 70) return 'score-high';
    if (score > 30) return 'score-medium';
    return 'score-low';
  };

  const getScoreBarStyle = (score) => {
    const color = score > 70 ? 'var(--danger-color)' : score > 30 ? 'var(--secondary-color)' : 'var(--success-color)';
    return {
      width: `${score}%`,
      backgroundColor: color,
    };
  };

  // Handle login button click
  const handleLoginClick = () => {
    navigate('/login');
  };

  // Handle register button click
  const handleRegisterClick = () => {
    navigate('/register');
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  return (
    <div>
      <div className="position-relative">
        <div className="position-absolute" style={{ top: '50px', left: '100px', zIndex: '1' }}>
          <div className="d-flex align-items-center">
            <div style={{ width: '40px', height: '1px', backgroundColor: 'rgba(76, 175, 80, 0.5)' }}></div>
            <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(76, 175, 80, 0.5)' }}></div>
          </div>
        </div>
        <div className="position-absolute" style={{ bottom: '50px', right: '100px', zIndex: '1' }}>
          <div className="d-flex align-items-center">
            <div style={{ width: '40px', height: '1px', backgroundColor: 'rgba(76, 175, 80, 0.5)' }}></div>
            <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(76, 175, 80, 0.5)' }}></div>
          </div>
        </div>
      </div>
      
      <section className="hero-section py-5">
        <div className="container py-5">
          <div className="d-flex justify-content-center mb-4">
            <div className="badge bg-dark text-white px-3 py-2 rounded-pill" style={{ border: '1px solid rgba(76, 175, 80, 0.3)', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)' }}>
              <span className="text-uppercase fw-bold" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                <span style={{ color: '#ffffff' }} className="me-2">NEW</span>
                AI-POWERED SCAM DETECTION
              </span>
            </div>
          </div>
          
          <h1 className="text-center display-3 fw-bold mb-4" style={{ fontSize: '3.5rem', color: '#ffffff', textShadow: '0 0 5px rgba(0, 0, 0, 0.3)', filter: 'none' }}>            Protect Yourself from<br />
            Online Scams!
          </h1>
          
          <p className="lead text-center mb-5" style={{ maxWidth: '700px', margin: '0 auto', color: '#ffffff', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Our AI-powered platform analyzes websites to detect potential scams, helping you
            stay safe online and avoid fraudulent sites.
          </p>
          
          <div className="url-input-container">
            <form onSubmit={analyzeUrl}>
              <div className="input-group url-input-group">
                <input
                  type="url"
                  className="form-control form-control-lg"
                  placeholder="Enter URL to analyze"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  style={{ 
                    borderRadius: '30px 0 0 30px', 
                    backgroundColor: 'rgba(30, 30, 30, 0.5)', 
                    borderColor: 'rgba(76, 175, 80, 0.3)', 
                    padding: '15px 25px', 
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                />
                <button 
                  type="submit" 
                  className="btn btn-success btn-lg d-flex align-items-center justify-content-center"
                  disabled={isLoading}
                  style={{ borderRadius: '0 30px 30px 0', padding: '0.75rem 2rem', fontWeight: '600', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)' }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check me-2"></i>
                      GET STARTED NOW
                    </>
                  )}
                </button>
              </div>
            </form>
            
            {error && (
              <div className="alert alert-danger mt-3" role="alert">
                {error}
              </div>
            )}
            
            <div className="text-center mt-3">
              <small className="text-white">
                <i className="bi bi-info-circle me-1"></i>
                Earn 5 credits for each URL you analyze and 50 bonus credits for confirmed scams!
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ backgroundColor: 'rgba(30, 30, 30, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(76, 175, 80, 0.3)', boxShadow: '0 0 20px rgba(76, 175, 80, 0.3)' }}>
            <div className="modal-header border-0">
              <h5 className="modal-title" style={{ color: '#ffffff' }}>
                <i className="bi bi-shield-check me-2" style={{ color: 'var(--primary-color)' }}></i>
                Create an Account
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body text-center py-4">
              <div className="mb-4">
                <i className="bi bi-person-plus" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}></i>
              </div>
              <h4 style={{ color: '#ffffff', marginBottom: '1rem' }}>Unlock Full Features!</h4>
              <p style={{ color: '#e0e0e0', marginBottom: '1.5rem' }}>
                Sign in or create an account to track your analysis history, earn credits, and get personalized scam alerts.
              </p>
              <div className="d-flex justify-content-center gap-3 mb-3">
                <button 
                  className="btn btn-primary" 
                  onClick={handleLoginClick}
                  style={{ padding: '0.5rem 1.5rem', fontWeight: '600' }}
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={handleRegisterClick}
                  style={{ padding: '0.5rem 1.5rem', fontWeight: '600' }}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Register
                </button>
              </div>
              <div className="mt-3">
                <button 
                  className="btn btn-link text-muted" 
                  onClick={handleCloseModal}
                >
                  Continue without an account
                </button>
              </div>
            </div>
            <div className="modal-footer border-0 justify-content-center">
              <div className="d-flex align-items-center">
                <i className="bi bi-lock me-2" style={{ color: 'var(--primary-color)' }}></i>
                <small style={{ color: '#a0a0a0' }}>Your data is secure and will never be shared</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {result && (
        <div className="container">
          <div className="card result-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Analysis Results</h5>
              <span className="badge bg-secondary">
                <i className="bi bi-coin me-1"></i>
                +{result.creditsEarned} credits earned
              </span>
            </div>
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">{result.url}</h6>
              
              <div className="text-center my-4">
                <div className={`scam-score mb-2 ${getScoreColorClass(result.score)}`}>
                  {result.score}/100
                </div>
                <div className="score-indicator">
                  <div className="score-bar" style={getScoreBarStyle(result.score)}></div>
                  <div className="score-text">{result.score}% Risk</div>
                </div>
                <div className="mt-2">
                  <span className={`risk-badge risk-${result.risk}`}>
                    {result.risk === 'high' ? 'High Risk' : result.risk === 'medium' ? 'Medium Risk' : 'Low Risk'}
                  </span>
                </div>
              </div>
              
              <h5 className="mt-4">Risk Indicators</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Indicator</th>
                      <th>Status</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.indicators
                      .filter(indicator => indicator.name !== 'AI Analysis') 
                      .map((indicator, index) => (
                        <tr key={index}>
                          <td>{indicator.name}</td>
                          <td>
                            <span className={`badge ${indicator.status === 'suspicious' ? 'bg-danger' : 'bg-success'}`}>
                              {indicator.status}
                            </span>
                          </td>
                          <td>{indicator.details}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* DeepSeek AI Analysis Details Section */}
              <div className="mt-4">
                <h5><i className="bi bi-robot me-2"></i>DeepSeek AI Analysis</h5>
                <div className="card bg-light">
                  <div className="card-body">
                    <p className="mb-0">
                      {(() => {
                        const aiAnalysis = result.indicators.find(i => i.name === 'AI Analysis');
                        // Don't show error messages to users
                        if (aiAnalysis?.details && aiAnalysis.details.includes('error occurred')) {
                          return 'AI analysis in progress. Please check back later.';
                        }
                        return aiAnalysis?.details || 'DeepSeek AI analysis not available';
                      })()}
                    </p>
                    <div className="mt-3 text-white">
                      <p className="mb-1"><strong>What DeepSeek AI checks for:</strong></p>
                      <ul className="mb-0">
                        <li>Suspicious language patterns (urgency, threats, too-good-to-be-true offers)</li>
                        <li>Requests for personal or financial information</li>
                        <li>Poor grammar or spelling</li>
                        <li>Impersonation of legitimate brands or services</li>
                        <li>Misleading content or false claims</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="alert alert-info mt-4">
                <h6><i className="bi bi-lightbulb me-2"></i>What does this mean?</h6>
                <p className="mb-0">
                  This website has been analyzed by our AI and assigned a risk score based on multiple factors.
                  {result.score > 70 ? (
                    ' The high risk score indicates this is likely a scam website. We recommend avoiding it.'
                  ) : result.score > 30 ? (
                    ' The medium risk score suggests some suspicious elements. Proceed with caution.'
                  ) : (
                    ' The low risk score suggests this website is likely legitimate, but always stay vigilant.'
                  )}
                </p>
              </div>
            </div>
            <div className="card-footer text-center">
              <button className="btn btn-outline-secondary me-2">
                <i className="bi bi-flag me-1"></i>
                Report False Result
              </button>
              <button className="btn btn-primary">
                <i className="bi bi-share me-1"></i>
                Share Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mt-5">
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-shield-check" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}></i>
                <h5 className="card-title mt-3">AI-Powered Analysis</h5>
                <p className="card-text">
                  Our advanced AI model analyzes multiple factors to determine if a website is legitimate or a potential scam.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-graph-up" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}></i>
                <h5 className="card-title mt-3">Detailed Risk Assessment</h5>
                <p className="card-text">
                  Get comprehensive insights into why a website might be risky, including domain age, content analysis, and more.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-coin" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}></i>
                <h5 className="card-title mt-3">Earn Rewards</h5>
                <p className="card-text">
                  Earn credits for each URL you analyze and bonus credits when you help identify new scam websites.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
