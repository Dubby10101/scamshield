from flask import Blueprint, request, jsonify
from models import db, User, URLSubmission
import re

auth_bp = Blueprint('auth', __name__)

# Email validation regex
email_regex = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    
    # Validate required fields
    if not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate email format
    if not email_regex.match(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 409
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Validate password length
    if len(data['password']) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400
    
    # Create new user
    new_user = User(
        username=data['username'],
        email=data['email']
    )
    new_user.set_password(data['password'])
    
    # Add to database
    db.session.add(new_user)
    db.session.commit()
    
    # Return user data (excluding password)
    return jsonify({
        'message': 'User registered successfully',
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    
    # Validate required fields
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'error': 'Missing email or password'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    # Check if user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Return user data
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get user's URL submissions
    submissions = URLSubmission.query.filter_by(user_id=user_id).all()
    submission_data = [submission.to_dict() for submission in submissions]
    
    # Return user profile with submissions
    return jsonify({
        'user': user.to_dict(),
        'submissions': submission_data
    }), 200

@auth_bp.route('/profile/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.json
    
    # Update username if provided
    if 'username' in data:
        # Check if new username is already taken
        if data['username'] != user.username and User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 409
        user.username = data['username']
    
    # Update email if provided
    if 'email' in data:
        # Validate email format
        if not email_regex.match(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        # Check if new email is already registered
        if data['email'] != user.email and User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        user.email = data['email']
    
    # Update password if provided
    if 'password' in data:
        if len(data['password']) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        user.set_password(data['password'])
    
    # Save changes
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200