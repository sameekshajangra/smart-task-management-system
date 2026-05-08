from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    """
    User model for storing authentication and account details.
    Inherits from UserMixin for Flask-Login compatibility.
    """
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Relationship: One User can have multiple Tasks
    tasks = db.relationship('Task', backref='author', lazy=True)

class Task(db.Model):
    """
    Task model representing individual to-do items.
    Contains metadata like priority, status, and creation date.
    """
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(20), default='Medium') # Options: Low, Medium, High
    status = db.Column(db.String(20), default='Pending')   # Options: Pending, Completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.Date, nullable=True)
    
    # Foreign Key linking to the User who owns the task
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def to_dict(self):
        """Helper method to convert model instance to a dictionary for JSON responses."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'user_id': self.user_id
        }
