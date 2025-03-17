import React, { useState, useEffect } from 'react';
import { useAnalysis } from '../context/AnalysisContext';

function Watchlist() {
  const { analysisCompleted } = useAnalysis();
  const [watchlistData, setWatchlistData] = useState({
    scamWebsites: [],
    recentlyAdded: 0,
    totalScams: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch real watchlist data from the backend API
  useEffect(() => {
    const fetchWatchlistData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/watchlist');
        
        if (!response.ok) {
          throw new Error('Failed to fetch watchlist data');
        }
        
        const data = await response.json();
        setWatchlistData(data);
      } catch (error) {
        console.error('Error fetching watchlist data:', error);
        setError('Failed to load watchlist data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistData();
  }, [analysisCompleted]); // Added analysisCompleted to refresh when a new analysis is completed


  // Filter watchlist based on search term and category
  const filteredWatchlist = watchlistData.scamWebsites.filter(website => {
    const matchesSearch = website.url.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         website.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || website.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = ['All', ...new Set(watchlistData.scamWebsites.map(website => website.category))];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'white' }}>Scam Website Watchlist</h2>
        <div className="badge bg-danger p-2 fs-6">
          <i className="bi bi-shield-exclamation me-1"></i>
          {watchlistData.totalScams} Verified Scams
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle-fill me-2"></i>
        This watchlist contains websites that have been verified as scams by our AI system and community reports.
        Stay safe online by checking suspicious URLs against this list.
      </div>

      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h5 className="mb-0">Search & Filter</h5>
            </div>
            <div className="col-md-6 text-md-end">
              <span className="badge bg-warning text-dark">
                <i className="bi bi-clock me-1"></i>
                {watchlistData.recentlyAdded} new scams added this week
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by URL or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover watchlist-table">
          <thead>
            <tr>
              <th>URL</th>
              <th>Risk Score</th>
              <th>Category</th>
              <th>Reports</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWatchlist.length > 0 ? (
              filteredWatchlist.map((website) => (
                <tr key={website.id}>
                  <td className="text-danger fw-bold">{website.url}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-danger"
                          role="progressbar"
                          style={{ width: `${website.riskScore}%` }}
                          aria-valuenow={website.riskScore}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <span>{website.riskScore}/100</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-secondary">{website.category}</span>
                  </td>
                  <td>{website.reportCount}</td>
                  <td>{website.dateAdded}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-success me-1" title="View Details">
                      <i className="bi bi-eye"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" title="Report False Positive">
                      <i className="bi bi-flag"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  <i className="bi bi-search me-2 text-muted"></i>
                  No scam websites found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">Report a Suspicious Website</h5>
        </div>
        <div className="card-body">
          <p>Found a suspicious website that might be a scam? Submit it for analysis and help protect others.</p>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button className="btn btn-primary">
              <i className="bi bi-plus-circle me-1"></i>
              Submit Suspicious URL
            </button>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-shield-fill-check text-success" style={{ fontSize: '2rem' }}></i>
              <h5 className="mt-3">Stay Protected</h5>
              <p className="card-text">Check suspicious URLs against our watchlist before visiting them.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-people-fill" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
              <h5 className="mt-3">Community-Driven</h5>
              <p className="card-text">Our watchlist is constantly updated with reports from users like you.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-graph-up text-warning" style={{ fontSize: '2rem' }}></i>
              <h5 className="mt-3">AI-Powered Analysis</h5>
              <p className="card-text">Advanced algorithms verify and categorize reported scam websites.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Watchlist;