# Smart Task Management System

A simple, modern, and powerful Task Management System built with Flask, PostgreSQL, Pandas, and WebSockets.

## Key Features
- **Authentication**: Secure user registration and session-based login.
- **REST APIs**: Complete CRUD lifecycle for tasks with robust error handling.
- **Interactive Analytics**: Real-time **Chart.js** integration for visual task distribution.
- **Pandas & NumPy Engine**: Backend analytics service for calculating task metrics.
- **Real-Time WebSockets**: Instant UI synchronization across tabs using **Socket.IO**.
- **Smart Filters & Search**: Multi-criteria filtering (Priority, Status) and instant search.
- **Visual Progress Tracking**: Global progress bar tracking overall completion rate.
- **Premium UI/UX**: Modern Glassmorphism design with a **Dark/Light Mode** toggle.
- **Deadline Management**: Support for task due dates and time-sensitive tracking.

## Tech Stack
- **Backend**: Python, Flask, Flask-SQLAlchemy, Flask-SocketIO
- **Database**: PostgreSQL
- **Analytics**: Pandas, NumPy
- **Frontend**: HTML5, Vanilla CSS, JavaScript, Chart.js

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
The app will be available at `http://localhost:5001`.

## API Endpoints
- `GET /api/tasks`: Fetch all tasks for the logged-in user.
- `POST /api/tasks`: Create a new task (supports `title`, `description`, `priority`, `due_date`).
- `PUT /api/tasks/<id>`: Update task details or status.
- `DELETE /api/tasks/<id>`: Remove a task.
- `GET /api/analytics`: Fetch task statistics (processed via Pandas).

## Project Structure
- `app.py`: Application entry point and WebSocket setup.
- `models.py`: Database models.
- `routes/`: API and authentication blueprints.
- `services/`: Business logic (Analytics service).
- `static/`: CSS and JS assets.
- `templates/`: HTML templates.
- `schema.sql`: Database schema definition.
