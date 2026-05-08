from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from models import db, Task
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/dashboard')
@login_required
def dashboard():
    """Renders the main dashboard for the user."""
    return render_template('dashboard.html')

@tasks_bp.route('/api/tasks', methods=['GET'])
@login_required
def get_tasks():
    """
    REST API: Fetch all tasks for the authenticated user.
    Returns: JSON list of tasks.
    """
    try:
        tasks = Task.query.filter_by(user_id=current_user.id).order_by(Task.created_at.desc()).all()
        return jsonify([task.to_dict() for task in tasks]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/api/tasks', methods=['POST'])
@login_required
def add_task():
    """
    REST API: Create a new task.
    Expects: JSON {title, description, priority}
    Returns: JSON of the created task.
    """
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
        
    try:
        due_date = None
        if data.get('due_date'):
            due_date = datetime.strptime(data.get('due_date'), '%Y-%m-%d').date()

        new_task = Task(
            title=data.get('title'),
            description=data.get('description'),
            priority=data.get('priority', 'Medium'),
            due_date=due_date,
            status='Pending',
            user_id=current_user.id
        )
        db.session.add(new_task)
        db.session.commit()
        
        # Broadcast the update via WebSocket
        from app import socketio
        socketio.emit('task_updated', {
            'action': 'added', 
            'task': new_task.to_dict()
        }, room=f'user_{current_user.id}')
        
        return jsonify(new_task.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/api/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    """
    REST API: Update an existing task.
    Expects: JSON {title, description, priority, status}
    """
    task = Task.query.get_or_404(task_id)
    
    if task.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access to this task'}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        task.priority = data.get('priority', task.priority)
        task.status = data.get('status', task.status)
        
        if 'due_date' in data:
            if data['due_date']:
                task.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
            else:
                task.due_date = None
        
        db.session.commit()
        
        # Broadcast the update via WebSocket
        from app import socketio
        socketio.emit('task_updated', {
            'action': 'updated', 
            'task': task.to_dict()
        }, room=f'user_{current_user.id}')
        
        return jsonify(task.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    """
    REST API: Delete a task by ID.
    """
    task = Task.query.get_or_404(task_id)
    
    if task.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access to this task'}), 403
    
    try:
        db.session.delete(task)
        db.session.commit()
        
        # Broadcast the deletion via WebSocket
        from app import socketio
        socketio.emit('task_updated', {
            'action': 'deleted', 
            'task_id': task_id
        }, room=f'user_{current_user.id}')
        
        return jsonify({'message': 'Task successfully deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
