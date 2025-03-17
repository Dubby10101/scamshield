from flask import Blueprint, request, jsonify, current_app, url_for, redirect, session
from authlib.integrations.flask_client import OAuth
from models import db, User
import os

google_bp = Blueprint('google_auth', __name__)

# Initialize OAuth
oauth = OAuth()

# Google OAuth configuration
google = oauth.register(
    name='google',
    client_id=os.environ.get('GOOGLE_CLIENT_ID', ''),
    client_secret=os.environ.get('GOOGLE_CLIENT_SECRET', ''),
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',
    client_kwargs={'scope': 'openid email profile'},
    jwks_uri='https://www.googleapis.com/oauth2/v3/certs'
)

@google_bp.route('/login/google')
def login_google():
    """Redirect to Google for authentication"""
    # Get the redirect_uri from the request or use a default
    redirect_uri = url_for('google_auth.authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@google_bp.route('/authorize')
def authorize():
    """Handle the callback from Google"""
    try:
        # Get the token from Google
        token = google.authorize_access_token()
        
        # Get user info from Google
        resp = google.get('userinfo')
        user_info = resp.json()
        
        # Check if user exists in our database
        user = User.query.filter_by(email=user_info['email']).first()
        
        if not user:
            # Create a new user if they don't exist
            username = user_info.get('name', '').replace(' ', '_').lower()
            base_username = username
            counter = 1
            
            # Make sure username is unique
            while User.query.filter_by(username=username).first():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User(
                username=username,
                email=user_info['email'],
                google_id=user_info['id'],
                profile_picture=user_info.get('picture'),
                is_google_account=True
            )
            
            db.session.add(user)
            db.session.commit()
        elif not user.google_id:
            # If user exists but doesn't have a Google ID, update their account
            user.google_id = user_info['id']
            user.profile_picture = user_info.get('picture')
            user.is_google_account = True
            db.session.commit()
        
        # Return user data
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@google_bp.route('/callback')
def callback():
    """Alternative callback endpoint for Google OAuth"""
    return authorize()