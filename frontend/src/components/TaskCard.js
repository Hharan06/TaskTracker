// src/components/TaskCard.js
import React from 'react';
import './TaskCard.css';

const statusColors = {
    TODO: '#e53935',        // red
    IN_PROGRESS: '#1e88e5', // blue
    DONE: '#43a047',   // green
};

const priorityEmojis = {
    HIGH: '🔴',
    MEDIUM: '🟡',
    LOW: '🟢',
};

function TaskCard({ task, onClick }) {
    const color = statusColors[task.status] || '#ccc';
    const emoji = priorityEmojis[task.priority] || '⚪';
    return (
        <div className="task-card" style={{ borderTop: `6px solid ${color}` }} onClick={onClick}>
            <div className="task-card-left">
                <span className="priority-emoji">{emoji}</span>
            </div>
            <div className="task-card-content">
                <h5 className="task-title">{task.title}</h5>
                {task.dueDateTime && (
                    <p className="task-date"><strong>Due</strong>: {new Date(task.dueDateTime).toLocaleDateString()} @ {new Date(task.dueDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit',hour12:true })}</p>
                )}

                <p className="task-date"><strong>Start at</strong>: {new Date(task.startDateTime).toLocaleDateString()} @ {new Date(task.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit',hour12:true })}</p>
            </div>
        </div>
    );
}

export default TaskCard;
