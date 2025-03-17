import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAnalysis } from '../context/AnalysisContext';

function Dashboard() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const { analysisCompleted, lastAnalysisResult } = useAnalysis();
  const [userData, setUserData] = useState({
    username: '',
    credits: 0,
    totalScans: 0,
    scamsDetected: 0,
    creditsEarned: 0,
    recentSubmissions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real user data from the backend API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/${currentUser.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, location, analysisCompleted]); // Added analysisCompleted to refresh when a new analysis is completed

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning text-dark';
      case 'low': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="dashboard-title"><span className="badge bg-success me-2">01</span>User Dashboard</h2>
        <div className="credit-badge p-2">
          <i className="bi bi-coin me-2"></i>
          {userData.credits} Credits
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="card stat-card">
          <div className="card-body">
            <i className="bi bi-search"></i>
            <div className="stat-value">{userData.totalScans}</div>
            <div className="stat-label">Total Scans</div>
            <div className="stat-progress" style={{ height: '3px', width: '60%', backgroundColor: 'var(--primary-color)', marginTop: '10px', borderRadius: '2px' }}></div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="card-body">
            <i className="bi bi-shield-exclamation"></i>
            <div className="stat-value">{userData.scamsDetected}</div>
            <div className="stat-label">Scams Detected</div>
            <div className="stat-progress" style={{ height: '3px', width: '40%', backgroundColor: 'var(--danger-color)', marginTop: '10px', borderRadius: '2px' }}></div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="card-body">
            <i className="bi bi-coin"></i>
            <div className="stat-value">{userData.creditsEarned}</div>
            <div className="stat-label">Credits Earned</div>
            <div className="stat-progress" style={{ height: '3px', width: '75%', backgroundColor: 'var(--secondary-color)', marginTop: '10px', borderRadius: '2px' }}></div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><span className="badge bg-success me-2">02</span>Recent Submissions</h5>
          <Link to="/" className="btn btn-sm btn-primary">
            <i className="bi bi-plus-circle me-1"></i>
            Scan New URL
          </Link>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Date</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userData.recentSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="text-truncate" style={{ maxWidth: '200px' }}>
                      {submission.url}
                    </td>
                    <td>{submission.date}</td>
                    <td>{submission.score}/100</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(submission.status)}`}>
                        {submission.status === 'high' ? 'High Risk' : 
                         submission.status === 'medium' ? 'Medium Risk' : 'Low Risk'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2">
                        <i className="bi bi-eye"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-secondary">
                        <i className="bi bi-share"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Credit History</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  URL Submission Reward
                  <span className="badge bg-success">+5 credits</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Scam Website Detection Bonus
                  <span className="badge bg-success">+50 credits</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Weekly Activity Bonus
                  <span className="badge bg-success">+20 credits</span>
                </li>
              </ul>
            </div>
            <div className="card-footer text-center">
              <button className="btn btn-outline-primary">
                <i className="bi bi-currency-exchange me-1"></i>
                Redeem Credits
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Account Settings</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="dashboard-form-label">Email Notifications</label>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="newScamAlert" checked />
                  <label className="dashboard-form-check-label" htmlFor="newScamAlert">New Scam Alerts</label>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="creditUpdates" checked />
                  <label className="dashboard-form-check-label" htmlFor="creditUpdates">Credit Updates</label>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="weeklyReport" />
                  <label className="dashboard-form-check-label" htmlFor="weeklyReport">Weekly Report</label>
                </div>
              </div>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <i className="bi bi-person-gear me-1"></i>
                  Edit Profile
                </button>
                <button className="btn btn-outline-secondary">
                  <i className="bi bi-key me-1"></i>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;