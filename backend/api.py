from flask import Blueprint, request, jsonify, current_app
from models import db, User, URLSubmission
from sqlalchemy import func, desc
from datetime import datetime, timedelta

api_bp = Blueprint('api', __name__)

# Dashboard API endpoint to get user-specific data
@api_bp.route('/dashboard/<int:user_id>', methods=['GET'])
def get_dashboard_data(user_id):
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get user's total scans
    total_scans = URLSubmission.query.filter_by(user_id=user_id).count()
    
    # Get user's detected scams
    scams_detected = URLSubmission.query.filter_by(user_id=user_id, is_scam=True).count()
    
    # Calculate total credits earned from submissions
    total_credits_earned = db.session.query(func.sum(URLSubmission.credits_earned))\
                            .filter(URLSubmission.user_id == user_id).scalar() or 0
    
    # Get recent submissions (limited to 5)
    recent_submissions = URLSubmission.query.filter_by(user_id=user_id)\
                        .order_by(URLSubmission.submitted_at.desc()).limit(5).all()
    
    # Format recent submissions
    submissions_data = []
    for submission in recent_submissions:
        # Determine status based on score
        status = 'low'
        if submission.score >= 70:
            status = 'high'
        elif submission.score >= 40:
            status = 'medium'
        
        submissions_data.append({
            'id': submission.id,
            'url': submission.url,
            'score': submission.score,
            'date': submission.submitted_at.strftime('%Y-%m-%d'),
            'status': status
        })
    
    # Compile dashboard data
    dashboard_data = {
        'username': user.username,
        'credits': user.credits,
        'totalScans': total_scans,
        'scamsDetected': scams_detected,
        'creditsEarned': total_credits_earned,
        'recentSubmissions': submissions_data
    }
    
    return jsonify(dashboard_data), 200

# Watchlist API endpoint to get global scam data
@api_bp.route('/watchlist', methods=['GET'])
def get_watchlist_data():
    # Get confirmed scam URLs (is_scam=True)
    scam_submissions = URLSubmission.query.filter_by(is_scam=True)\
                      .order_by(URLSubmission.submitted_at.desc()).all()
    
    # Process scam submissions into watchlist format
    scam_websites = []
    domains_added = set()  # To avoid duplicate domains
    
    for submission in scam_submissions:
        # Skip if domain already added
        if submission.domain in domains_added:
            continue
        
        domains_added.add(submission.domain)
        
        # Count how many times this domain has been reported
        report_count = URLSubmission.query.filter_by(domain=submission.domain, is_scam=True).count()
        
        # Determine scam category based on score
        category = 'Phishing'  # Default category
        if submission.score >= 90:
            category = 'Phishing'
        elif submission.score >= 80:
            category = 'Fake Giveaway'
        elif submission.score >= 70:
            category = 'Banking Scam'
        elif submission.score >= 60:
            category = 'Investment Scam'
        
        scam_websites.append({
            'id': submission.id,
            'url': submission.domain,
            'riskScore': submission.score,
            'reportCount': report_count,
            'dateAdded': submission.submitted_at.strftime('%Y-%m-%d'),
            'category': category
        })
    
    # Get count of recently added scams (last 7 days)
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    recently_added = URLSubmission.query.filter(
        URLSubmission.is_scam == True,
        URLSubmission.submitted_at >= one_week_ago
    ).count()
    
    # Get total count of verified scams
    total_scams = len(scam_websites)
    
    # Compile watchlist data
    watchlist_data = {
        'scamWebsites': scam_websites,
        'recentlyAdded': recently_added,
        'totalScams': total_scams
    }
    
    return jsonify(watchlist_data), 200        
