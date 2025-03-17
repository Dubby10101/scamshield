import React, { useState } from 'react';

function FeedbackButton() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    category: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mock API call - in a real app, this would be an actual API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Feedback submitted:', formData);
      
      // Show success message
      setSubmitted(true);
      
      // Reset form after 3 seconds and close modal
      setTimeout(() => {
        setFormData({
          rating: 5,
          category: 'general',
          message: ''
        });
        setSubmitted(false);
        setShowModal(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button 
        className="feedback-btn" 
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
      >
        <i className="bi bi-chat-dots-fill" style={{ fontSize: '1.5rem' }}></i>
      </button>

      {/* Feedback Modal */}
      {showModal && (
        <div className="modal-backdrop" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="modal-content" 
            style={{
              backgroundColor: 'rgba(20, 20, 20, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '10px',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              padding: '25px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
              color: 'var(--text-color)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="close-btn" 
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: 'var(--text-color)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              <i className="bi bi-x"></i>
            </button>

            <h3 className="mb-4" style={{ textAlign: 'center' }}>
              <i className="bi bi-chat-dots me-2" style={{ color: 'var(--primary-color)' }}></i>
              Share Your Feedback
            </h3>

            {submitted ? (
              <div className="text-center py-4">
                <i className="bi bi-check-circle" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}></i>
                <h4 className="mt-3">Thank You!</h4>
                <p>Your feedback has been submitted successfully. You've earned 5 credits!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="rating" className="form-label">How would you rate your experience?</label>
                  <div className="rating-container d-flex justify-content-between mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        type="button"
                        className={`btn ${formData.rating >= star ? 'text-warning' : 'text-secondary'}`}
                        onClick={() => setFormData({...formData, rating: star})}
                        style={{ fontSize: '1.5rem', background: 'none', border: 'none' }}
                      >
                        <i className="bi bi-star-fill"></i>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Feedback Category</label>
                  <select 
                    className="form-select" 
                    id="category" 
                    name="category" 
                    value={formData.category}
                    onChange={handleChange}
                    style={{
                      backgroundColor: 'rgba(30, 30, 30, 0.8)',
                      color: 'var(--text-color)',
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                    }}
                  >
                    <option value="general">General Feedback</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="ui">User Interface</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Your Feedback</label>
                  <textarea 
                    className="form-control" 
                    id="message" 
                    name="message" 
                    rows="4" 
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please share your thoughts, suggestions, or report issues..."
                    required
                    style={{
                      backgroundColor: 'rgba(30, 30, 30, 0.8)',
                      color: 'var(--text-color)',
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                    }}
                  ></textarea>
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: 'var(--primary-color)',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '5px',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : 'Submit Feedback'}
                  </button>
                </div>

                <div className="mt-3 text-center">
                  <small style={{ color: 'var(--text-color)', opacity: 0.8 }}>
                    <i className="bi bi-coin me-1"></i>
                    Earn 5 credits for submitting valuable feedback!
                  </small>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FeedbackButton;