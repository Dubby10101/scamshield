from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=True)  # Made nullable for Google accounts
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    profile_picture = db.Column(db.String(500), nullable=True)
    is_google_account = db.Column(db.Boolean, default=False)
    credits = db.Column(db.Integer, default=175)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with URL submissions
    url_submissions = db.relationship('URLSubmission', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'credits': self.credits,
            'profile_picture': self.profile_picture,
            'is_google_account': self.is_google_account,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class URLSubmission(db.Model):
    __tablename__ = 'url_submissions'
    
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(2048), nullable=False)
    domain = db.Column(db.String(255), nullable=False)
    score = db.Column(db.Integer)
    risk = db.Column(db.String(10))
    is_scam = db.Column(db.Boolean, default=False)
    credits_earned = db.Column(db.Integer, default=5)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign key to user
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
            'domain': self.domain,
            'score': self.score,
            'risk': self.risk,
            'is_scam': self.is_scam,
            'credits_earned': self.credits_earned,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'user_id': self.user_id
        }