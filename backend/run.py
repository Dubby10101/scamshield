from flask_cors import CORS
from flask import Flask
from app import app
from models import db, bcrypt
from auth import auth_bp
from google_auth import google_bp, oauth
from api import api_bp
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure database
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:///scamshield.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key_change_in_production')

# Initialize extensions
db.init_app(app)
bcrypt.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(google_bp, url_prefix='/api/auth')
app.register_blueprint(api_bp, url_prefix='/api')

# Initialize OAuth
oauth.init_app(app)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Create database tables if they don't exist
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)