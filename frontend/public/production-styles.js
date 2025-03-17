// This script injects critical styles directly into the page
// It runs immediately when the page loads, before any other resources
(function() {
  // Create a style element
  const style = document.createElement('style');
  style.id = 'scamshield-critical-styles';
  
  // Add critical styles that ensure dark theme and proper backgrounds
  style.textContent = `
    /* Force dark theme */
    html, body {
      background-color: #121212 !important;
      color: #e0e0e0 !important;
    }
    
    body {
      background-image: linear-gradient(rgba(76, 175, 80, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(76, 175, 80, 0.03) 1px, transparent 1px) !important;
      background-size: 20px 20px !important;
      min-height: 100vh;
    }
    
    /* Modal fixes */
    .modal-content {
      background-color: #121212 !important;
      color: #e0e0e0 !important;
      border: 1px solid rgba(76, 175, 80, 0.2) !important;
    }
    
    .modal-header, .modal-footer {
      border-color: rgba(76, 175, 80, 0.2) !important;
      background-color: rgba(0, 0, 0, 0.2) !important;
    }
    
    .modal-body {
      background-color: #121212 !important;
    }
    
    /* Card fixes */
    .card {
      background-color: rgba(26, 26, 26, 0.85) !important;
      color: #e0e0e0 !important;
    }
    
    /* Button fixes */
    .btn-primary, .btn-success {
      background-color: #4caf50 !important;
      border-color: #4caf50 !important;
    }
    
    /* Form fixes */
    .form-control {
      background-color: rgba(255, 255, 255, 0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: #e0e0e0 !important;
    }
  `;
  
  // Add the style element to the head
  document.head.appendChild(style);
})();
