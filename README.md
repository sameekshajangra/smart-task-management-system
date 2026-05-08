# Smart Task Management System

A simple, modern, and powerful Task Management System built with Flask, PostgreSQL, Pandas, and WebSockets.

## Features
- **Authentication**: Secure user registration and login.
- **REST APIs**: Full CRUD operations for task management.
- **Analytics Dashboard**: Real-time insights using Pandas & NumPy.
- **Live Updates**: Instant task notifications via WebSockets.
- **Premium UI**: Responsive, glassmorphism-inspired design.

## Tech Stack
- **Backend**: Python, Flask, Flask-SQLAlchemy, Flask-SocketIO
- **Database**: PostgreSQL
- **Analytics**: Pandas, NumPy
- **Frontend**: HTML5, Vanilla CSS, JavaScript (Socket.IO)

## Setup Instructions

### 1. Prerequisites
- Python 3.8+
- PostgreSQL installed and running

### 2. Clone and Install Dependencies
```bash
# Install required packages
pip install -r requirements.txt
```

### 3. Database Configuration
Create a `.env` file in the root directory (use `.env.example` as a template):
```env
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://username:password@localhost:5432/task_db
```

### 4. Database Initialization
The application will automatically create tables on its first run. However, you can also use the `schema.sql` file to manually set up your PostgreSQL database:
```bash
psql -U username -d task_db -f schema.sql
```

### 5. Run the Application
```bash
python app.py
```
The app will be available at `http://localhost:5000`.

## API Endpoints
- `GET /api/tasks`: Fetch all tasks for the logged-in user.
- `POST /api/tasks`: Create a new task.
- `PUT /api/tasks/<id>`: Update a task's status or details.
- `DELETE /api/tasks/<id>`: Remove a task.
- `GET /api/analytics`: Fetch task statistics.

## Project Structure
- `app.py`: Application entry point and WebSocket setup.
- `models.py`: Database models.
- `routes/`: API and authentication blueprints.
- `services/`: Business logic (Analytics service).
- `static/`: CSS and JS assets.
- `templates/`: HTML templates.
- `schema.sql`: Database schema definition.
