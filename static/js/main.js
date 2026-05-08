/**
 * Task Management System - Advanced Frontend Logic
 */

const socket = io();
let allTasks = [];
let taskChart = null;

socket.on('connect', () => {
    console.log('WebSocket connected.');
    socket.emit('join', { user_id: userId });
});

socket.on('task_updated', (data) => {
    fetchTasks();
    fetchAnalytics();
    showNotification(`Task ${data.action}!`);
});

const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('taskForm');
const modal = document.getElementById('taskModal');

document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    fetchAnalytics();
    initChart();
});

// Theme Toggling
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
}

// Fetch and Analytics
async function fetchTasks() {
    try {
        const response = await fetch('/api/tasks');
        allTasks = await response.json();
        filterTasks(); // Initial render with current filters
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchAnalytics() {
    try {
        const response = await fetch('/api/analytics');
        const stats = await response.json();
        
        document.getElementById('total-tasks').innerText = stats.total_tasks;
        document.getElementById('completed-tasks').innerText = stats.completed_tasks;
        document.getElementById('completion-rate').innerText = `${stats.completion_percentage}%`;
        
        // Update Progress Bar
        document.getElementById('global-progress').style.width = `${stats.completion_percentage}%`;
        
        // Update Chart
        updateChart(stats.completed_tasks, stats.pending_tasks);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Filtering and Search
function filterTasks() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const priority = document.getElementById('filterPriority').value;
    const status = document.getElementById('filterStatus').value;

    const filtered = allTasks.filter(task => {
        const matchSearch = task.title.toLowerCase().includes(search) || 
                            task.description.toLowerCase().includes(search);
        const matchPriority = priority === 'All' || task.priority === priority;
        const matchStatus = status === 'All' || task.status === status;
        return matchSearch && matchPriority && matchStatus;
    });

    renderTasks(filtered);
}

function renderTasks(tasks) {
    taskList.innerHTML = '';
    if (tasks.length === 0) {
        taskList.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">No tasks match your criteria.</p>';
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'glass task-card';
        card.innerHTML = `
            <div class="task-header">
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                <button onclick="deleteTask(${task.id})" class="delete-btn">&times;</button>
            </div>
            <div class="task-body">
                <h3 class="task-title">${task.title}</h3>
                <p class="task-desc">${task.description || ''}</p>
                ${task.due_date ? `<p style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--text-muted);">📅 Due: ${task.due_date}</p>` : ''}
            </div>
            <div class="task-footer">
                <div class="status-indicator status-${task.status}">
                    <span class="dot"></span>
                    <span>${task.status}</span>
                </div>
                <div class="actions">
                    ${task.status === 'Pending' ? 
                        `<button onclick="updateTaskStatus(${task.id}, 'Completed')" class="btn-success">Done</button>` : 
                        `<button onclick="updateTaskStatus(${task.id}, 'Pending')" class="btn-pending">Reopen</button>`
                    }
                </div>
            </div>
        `;
        taskList.appendChild(card);
    });
}

// Chart Logic
function initChart() {
    const ctx = document.getElementById('taskChart').getContext('2d');
    taskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#10b981', '#f59e0b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            cutout: '70%'
        }
    });
}

function updateChart(completed, pending) {
    if (!taskChart) return;
    taskChart.data.datasets[0].data = [completed, pending];
    taskChart.update();
}

// CRUD Operations
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDesc').value,
        priority: document.getElementById('taskPriority').value,
        due_date: document.getElementById('taskDueDate').value
    };

    const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (response.ok) {
        closeModal();
        taskForm.reset();
        fetchTasks();
        fetchAnalytics();
    }
});

async function updateTaskStatus(id, newStatus) {
    const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    if (response.ok) {
        fetchTasks();
        fetchAnalytics();
    }
}

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (response.ok) {
        fetchTasks();
        fetchAnalytics();
    }
}

function openModal() { modal.style.display = 'flex'; }
function closeModal() { modal.style.display = 'none'; }

function showNotification(msg) {
    const div = document.createElement('div');
    div.className = 'flash flash-success';
    div.innerText = msg;
    div.style.position = 'fixed';
    div.style.top = '20px';
    div.style.right = '20px';
    div.style.zIndex = '3000';
    document.body.appendChild(div);
    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.5s';
        setTimeout(() => div.remove(), 500);
    }, 3000);
}
