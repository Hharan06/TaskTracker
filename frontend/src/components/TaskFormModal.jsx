import React from 'react';
import axios from 'axios';
import './TaskList.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const TaskFormModal = ({
                           showAddForm,
                           setShowAddForm,
                           isEditMode,
                           setIsEditMode,
                           editTaskId,
                           setEditTaskId,
                           newTask,
                           setNewTask,
                           enableDueDate,
                           setEnableDueDate,
                           showStartPicker,
                           setShowStartPicker,
                           showDuePicker,
                           setShowDuePicker,
                           setTasks,
                           tasks
                       }) => {
    if (!showAddForm) return null;

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (isEditMode) {
                // Update existing task
                const response = await axios.put(
                    `http://localhost:8080/api/tasks/${editTaskId}`,
                    { ...newTask, user: null },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTasks(prev =>
                    prev.map(task => (task.task_id === editTaskId ? response.data : task))
                );
            } else {
                // Add new task
                const response = await axios.post(
                    'http://localhost:8080/api/tasks',
                    { ...newTask, user: null },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTasks([...tasks, response.data]);
            }
            // Reset form state
            setShowAddForm(false);
            setIsEditMode(false);
            setEditTaskId(null);
            setNewTask({
                title: '',
                description: '',
                startDateTime: '',
                dueDateTime: '',
                status: 'TODO',
                priority: 'MEDIUM',
            });
        } catch (error) {
            console.error('Failed to submit task:', error);
        }
    };

    return (
        <div className="add-task-popup">
            <div className="add-task-form">
                <button
                    className="close-popup"
                    onClick={() => {
                        setShowAddForm(false);
                        setShowStartPicker(false);
                        setShowDuePicker(false);
                    }}
                >
                    ×
                </button>
                <h3>{isEditMode ? 'Edit Task' : 'Add New Task'}</h3>
                <div className="form-group">
                    <label>Task Name</label>
                    <input
                        type="text"
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Task name"
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={newTask.description}
                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Description"
                    />
                </div>
                <div className="form-group">
                    <label>Start Date & Time</label>
                    <button
                        className="datetime-btn"
                        onClick={() => setShowStartPicker(!showStartPicker)}
                        type="button"
                    >
                        {newTask.startDateTime
                            ? `${new Date(newTask.startDateTime).toLocaleDateString()} @ ${new Date(newTask.startDateTime).toLocaleTimeString()}`
                            : 'Select start date & time'}

                    </button>
                    {showStartPicker && (
                        <input
                            type="datetime-local"
                            value={newTask.startDateTime}
                            onChange={e => setNewTask({ ...newTask, startDateTime: e.target.value })}
                        />
                    )}
                </div>
                <div className="form-check form-switch mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="enableDueDateSwitch"
                        checked={enableDueDate}
                        onChange={e => {
                            setEnableDueDate(e.target.checked);
                            if (!e.target.checked) {
                                setNewTask({ ...newTask, dueDateTime: '' });
                            }
                        }}
                    />
                    <label className="form-check-label" htmlFor="enableDueDateSwitch">
                        Enable Due Date
                    </label>
                </div>

                {enableDueDate && (
                    <div className="form-group">
                        <label>Due Date & Time</label>
                        <button
                            className="datetime-btn"
                            onClick={() => setShowDuePicker(!showDuePicker)}
                            type="button"
                        >
                            {newTask.dueDateTime
                                ? `${new Date(newTask.dueDateTime).toLocaleDateString()} @ ${new Date(newTask.dueDateTime).toLocaleTimeString()}`
                                : 'Select start date & time'}
                        </button>
                        {showDuePicker && (
                            <input
                                type="datetime-local"
                                value={newTask.dueDateTime}
                                onChange={e => setNewTask({ ...newTask, dueDateTime: e.target.value })}
                            />
                        )}
                    </div>
                )}
                <div className="form-group">
                    <label>Status</label>
                    <div className="slider-container">
                        <div className="slider">
                            <button
                                className={`slider-btn ${newTask.status === 'TODO' ? 'active' : ''}`}
                                onClick={() => setNewTask({ ...newTask, status: 'TODO' })}
                                type="button"
                            >
                                To Do
                            </button>
                            <button
                                className={`slider-btn ${newTask.status === 'IN_PROGRESS' ? 'active' : ''}`}
                                onClick={() => setNewTask({ ...newTask, status: 'IN_PROGRESS' })}
                                type="button"
                            >
                                In Progress
                            </button>
                            <button
                                className={`slider-btn ${newTask.status === 'DONE' ? 'active' : ''}`}
                                onClick={() => setNewTask({ ...newTask, status: 'DONE' })}
                                type="button"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label>Priority</label>
                    <div className="slider-container">
                        <div className="slider">
                            <button
                                className={`slider-btn ${newTask.priority === 'HIGH' ? 'active' : ''}`}
                                onClick={() => setNewTask({ ...newTask, priority: 'HIGH' })}
                                type="button"
                            >
                                High
                            </button>
                            <button
                                className={`slider-btn ${newTask.priority === 'MEDIUM' ? 'active' : ''}`}
                                onClick={() => setNewTask({ ...newTask, priority: 'MEDIUM' })}
                                type="button"
                            >
                                Medium
                            </button>
                            <button
                                className={`slider-btn ${newTask.priority === 'LOW' ? 'active' : ''}`}
                                onClick={() => setNewTask({ ...newTask, priority: 'LOW' })}
                                type="button"
                            >
                                Low
                            </button>
                        </div>
                    </div>
                </div>
                <button className="add-task-btn" onClick={handleSubmit}>
                    {isEditMode ? 'Update Task' : 'Add Task'}
                </button>
            </div>
        </div>
    );
};

export default TaskFormModal;