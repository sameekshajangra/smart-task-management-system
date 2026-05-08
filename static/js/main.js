/**
 * Task Management System - Frontend Logic
 * Handles real-time updates via WebSockets, REST API interactions,
 * and dynamic DOM manipulation.
 */

// Initialize Socket.IO client
const socket = io();

// Join a private room based on the user's ID to receive targeted updates
socket.on('connect', () => {
    console.log('Successfully connected to WebSocket server.');
    socket.emit('join', { user_id: userId });
});

/**
 * Listener for 'task_updated' events.
 * This ensures that if the user has multiple tabs open, or if a task is updated
 * by a background process, the UI stays in sync without a manual refresh.
 */
socket.on('task_updated', (data) => {
    console.log('Real-time notification received:', data);
    // Refresh both the task list and the analytics summary
    fetchTasks();
    fetchAnalytics();
    
    // Provide visual feedback to the user
    showNotification(`Task ${data.action} successfully!`);
});

// Cache frequently used DOM elements
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('taskForm');
const modal = document.getElementById('taskModal');

// Initial load: Fetch data when the DOM is fully ready
document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    fetchAnalytics();
});

/**
 * Fetches all tasks for the current user from the REST API.
 */
async function fetchTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('API Error (fetchTasks):', error);
    }
}

/**
 * Fetches analytics summary (Total, Completed, Pending, %) from the Analytics Module.
 */
async function fetchAnalytics() {
    try {
        const response = await fetch('/api/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const stats = await response.json();
        
        // Update the dashboard cards with animated or static text
        document.getElementById('total-tasks').innerText = stats.total_tasks;
        document.getElementById('completed-tasks').innerText = stats.completed_tasks;
        document.getElementById('pending-tasks').innerText = stats.pending_tasks;
        document.getElementById('completion-rate').innerText = `${stats.completion_percentage}%`;
    } catch (error) {
        console.error('API Error (fetchAnalytics):', error);
    }
}

/**
 * Dynamically builds and renders task cards into the grid.
 * @param {Array} tasks - List of task objects from the API.
 */
function renderTasks(tasks) {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">No tasks found. Click "+ Add New Task" to get started!</p>';
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'glass task-card';
        card.innerHTML = `
            <div class="task-header">
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                <button onclick="deleteTask(${task.id})" class="delete-btn" title="Delete Task">&times;</button>
            </div>
            <div class="task-body">
                <h3 class="task-title">${task.title}</h3>
                <p class="task-desc">${task.description || '<i>No description provided.</i>'}</p>
            </div>
            <div class="task-footer">
                <div class="status-indicator status-${task.status}">
                    <span class="dot"></span>
                    <span>${task.status}</span>
                </div>
                <div class="actions">
                    ${task.status === 'Pending' ? 
                        `<button onclick="updateTaskStatus(${task.id}, 'Completed')" class="btn-success">Mark Done</button>` : 
                        `<button onclick="updateTaskStatus(${task.id}, 'Pending')" class="btn-pending">Reopen</button>`
                    }
                </div>
            </div>
        `;
        taskList.appendChild(card);
    });
}

/**
 * Submits the Add Task form data to the server.
 */
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDesc').value,
        priority: document.getElementById('taskPriority').value
    };

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            closeModal();
            taskForm.reset();
            // Note: WebSocket will also trigger a refresh, but we do it here for immediate feedback
            fetchTasks();
            fetchAnalytics();
        } else {
            const err = await response.json();
            alert(`Error: ${err.error}`);
        }
    } catch (error) {
        console.error('Submit Error:', error);
    }
});

/**
 * Updates the status of a task (e.g., Pending -> Completed).
 */
async function updateTaskStatus(id, newStatus) {
    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            fetchTasks();
            fetchAnalytics();
        }
    } catch (error) {
        console.error('Update Error:', error);
    }
}

/**
 * Deletes a task after user confirmation.
 */
async function deleteTask(id) {
    if (!confirm('Are you sure you want to permanently delete this task?')) return;
    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchTasks();
            fetchAnalytics();
        }
    } catch (error) {
        console.error('Delete Error:', error);
    }
}

// UI Modal Handlers
function openModal() {
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

/**
 * Displays a temporary toast notification.
 */
function showNotification(message) {
    const flashDiv = document.createElement('div');
    flashDiv.className = 'flash flash-success';
    flashDiv.innerText = message;
    flashDiv.style.position = 'fixed';
    flashDiv.style.top = '20px';
    flashDiv.style.right = '20px';
    flashDiv.style.zIndex = '3000';
    document.body.appendChild(flashDiv);
    
    // Smoothly remove after 3 seconds
    setTimeout(() => {
        flashDiv.style.opacity = '0';
        flashDiv.style.transition = 'opacity 0.5s ease';
        setTimeout(() => flashDiv.remove(), 500);
    }, 3000);
}
