import React, { useEffect, useState } from 'react';

import axios from 'axios';

import './TaskList.css';

import TaskCard from './TaskCard';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { FaPlus, FaTrashAlt } from 'react-icons/fa';

import {Link} from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

const priorityOrder = {
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
};

const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];

const statusLabels = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done',
};

const TaskList = ({onLogout}) => {
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [filterBy, setFilterBy] = useState(null);
    const [hoveredFilter, setHoveredFilter] = useState(null);
    const [showSortPopup, setShowSortPopup] = useState(false);
    const [sortField, setSortField] = useState('priority');
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [filter, setFilter] = useState(null);
    const [enableDueDate, setEnableDueDate] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        startDateTime: '',
        dueDateTime: '',
        status: 'TODO',
        priority: 'MEDIUM',
    });
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showDuePicker, setShowDuePicker] = useState(false);

    const handleFilter = (filterType) => {
        setFilter(filterType);
        setShowFilterPopup(false);
    };

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const nextWeekStart = new Date(endOfWeek);
    nextWeekStart.setDate(endOfWeek.getDate() + 1);

    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    const filteredTasks = tasks.filter(task => {
        let dueDate = null;
        if (task.dueDateTime) {
            dueDate = new Date(task.dueDateTime);
        }
        if (!dueDate || isNaN(dueDate.getTime())) return true;

        switch (filter) {
            case 'this_week': return dueDate >= startOfWeek && dueDate <= endOfWeek;
            case 'next_week': return dueDate >= nextWeekStart && dueDate <= nextWeekEnd;
            case 'this_month': return dueDate >= startOfMonth && dueDate <= endOfMonth;
            case 'next_month': return dueDate >= nextMonthStart && dueDate <= nextMonthEnd;
            default: return true;
        }
    });

    const groupedTasks = statuses.reduce((acc, status) => {
        const tasksInStatus = filteredTasks.filter(task => task.status === status);
        const sortedTasks = [...tasksInStatus].sort((a, b) => {
            if (sortField === 'priority') {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (sortField === 'startDateTime') {
                return new Date(a.startDateTime) - new Date(b.startDateTime);
            } else if (sortField === 'dueDateTime') {
                return new Date(a.dueDateTime) - new Date(b.dueDateTime);
            }
            return 0;
        });
        acc[status] = sortedTasks;
        return acc;
    }, {});

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;

        if (destination.droppableId === 'trash') {
            const taskToDelete = tasks.find(task => task.task_id.toString() === draggableId);
            if (!taskToDelete) return;

            setTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskToDelete.task_id));

            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8080/api/tasks/${taskToDelete.task_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                console.error('Failed to delete task:', error);
                setTasks(prevTasks => [...prevTasks, taskToDelete]);
            }
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const draggedTask = tasks.find(task => task.task_id.toString() === draggableId);
        if (!draggedTask) return;

        const newStatus = destination.droppableId;

        if (draggedTask.status !== newStatus) {
            const updatedTask = { ...draggedTask, status: newStatus };
            setTasks(prevTasks => {
                let newTasks = prevTasks.filter(task => task.task_id !== draggedTask.task_id);
                newTasks.push(updatedTask);
                return newTasks;
            });

            try {
                const token = localStorage.getItem('token');
                await axios.put(
                    `http://localhost:8080/api/tasks/${draggedTask.task_id}`,
                    updatedTask,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error('Failed to update task status:', error);
                setTasks(prevTasks => prevTasks.map(task => (task.task_id === draggedTask.task_id ? draggedTask : task)));
            }
        }
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">TaskTracker</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <Link className="nav-link " aria-current="page" to="/">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/profile">Profile</Link>
                            </li>
                            <li className="nav-item ">
                                <Link className="nav-link active" to="/tasks">Tasks</Link>
                            </li>

                            {/* Add more nav items as needed */}
                        </ul>
                        <NotificationDropdown/>
                        <button onClick={onLogout} className="btn btn-outline-danger ms-lg-3 mt-2 mt-lg-0">Logout</button>
                    </div>
                </div>
            </nav>
            <div className="container mt-4 m-1">
                <h1 className="mb-4">Your Tasks</h1>
                <div className="task-actions">
                    <div className="filter-button-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowFilterPopup(!showFilterPopup)}
                        >
                            Filter
                        </button>

                        {showFilterPopup && (
                            <div className="filter-popup">
                                <div
                                    className="filter-option"
                                    onMouseEnter={() => setHoveredFilter('week')}
                                    onMouseLeave={() => setHoveredFilter(null)}
                                >
                                    By Week
                                    {hoveredFilter === 'week' && (
                                        <div className="submenu">
                                            <div className="submenu-option" onClick={() => handleFilter("this_week")}>
                                                This Week
                                            </div>
                                            <div className="submenu-option" onClick={() => handleFilter("next_week")}>
                                                Next Week
                                            </div>

                                        </div>
                                    )}
                                </div>
                                <div
                                    className="filter-option"
                                    onMouseEnter={() => setHoveredFilter('month')}
                                    onMouseLeave={() => setHoveredFilter(null)}
                                >
                                    By Month
                                    {hoveredFilter === 'month' && (
                                        <div className="submenu">
                                            <div className="submenu-option" onClick={() => handleFilter("this_month")}>
                                                This Month
                                            </div>
                                            <div className="submenu-option" onClick={() => handleFilter("next_month")}>
                                                Next Month
                                            </div>

                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {filter && (
                        <div className="clear-filter-container mt-2">
                            <button
                                className="btn btn-secondary text-sm"
                                onClick={() => setFilter(null)}
                            >
                                Clear Filter
                            </button>
                        </div>
                    )}



                    <div className="sort-button-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setIsClosing(showSortPopup) //if we're opening, it's not closing
                                setShowSortPopup(!showSortPopup);
                            }}
                        >
                            Sort
                        </button>

                        {showSortPopup && (
                            <div
                                className={`sort-popup ${isClosing ? 'closing' : ''}`}
                                onAnimationEnd={() => setIsClosing(false)}
                            >

                                <div className="sort-option" onClick={() => setSortField('priority')}>
                                    Priority
                                </div>
                                <div className="sort-option" onClick={() => setSortField('startDateTime')}>
                                    Start Date/Time
                                </div>
                                <div className="sort-option" onClick={() => setSortField('dueDateTime')}>
                                    Due Date/Time
                                </div>
                            </div>
                        )}
                    </div>
                </div>



                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="task-columns">
                        {statuses.map(status => (
                            <Droppable droppableId={status} key={status}>
                                {(provided, snapshot) => (
                                    <div
                                        className="task-column"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        style={{
                                            background: snapshot.isDraggingOver ? '#e3f2fd' : '#fff',
                                            transition: 'background-color 0.2s ease',
                                        }}
                                    >
                                        <h3 className="column-title">{statusLabels[status]}</h3>
                                        <div className="task-scroll">
                                            {groupedTasks[status].length > 0 ? (
                                                groupedTasks[status].map((task, index) => (
                                                    <Draggable key={task.task_id.toString()} draggableId={task.task_id.toString()} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    userSelect: 'none',
                                                                    marginBottom: 8,
                                                                    boxShadow: snapshot.isDragging ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                                                                }}
                                                                onClick={() => setSelectedTask(task)}
                                                            >
                                                                <TaskCard task={task} />
                                                            </div>

                                                        )}
                                                    </Draggable>

                                                ))
                                            ) : (
                                                <p className="no-tasks">No tasks</p>
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                    <Droppable droppableId="trash" direction="vertical">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="floating-trash"
                                style={{
                                    backgroundColor: snapshot.isDraggingOver ? '#ffdddd' : '#fff',
                                    borderColor: snapshot.isDraggingOver ? 'red' : '#ccc',
                                }}
                            >
                                <FaTrashAlt size={28} color={snapshot.isDraggingOver ? 'red' : '#555'} />
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <button
                        className="floating-add"
                        onClick={() => {
                            setShowAddForm(true);
                            setNewTask({
                                title: '',
                                description: '',
                                startDateTime: new Date().toISOString().slice(0, 16), // format: 'YYYY-MM-DDTHH:mm'
                                dueDateTime: '',
                                status: 'TODO',
                                priority: 'MEDIUM',
                            });
                        }}

                    >
                        <FaPlus size={28} color="#fff" />
                    </button>
                </DragDropContext>


                {/* Task Detail Sidebar */}
                <div
                    className={`bottom-sheet-overlay ${selectedTask ? 'open' : ''}`}
                    onClick={() => setSelectedTask(null)}
                />
                <div className={`bottom-sheet ${selectedTask ? 'open' : ''}`}>
                    {selectedTask && (
                        <>
                            <button
                                className="close-bottom-sheet"
                                onClick={() => setSelectedTask(null)}
                            >
                                ×
                            </button>
                            <h2>{selectedTask.title}</h2>
                            <p><strong>Description:</strong> {selectedTask.description}</p>
                            <p><strong>Status:</strong> {statusLabels[selectedTask.status]}</p>
                            <p><strong>Priority:</strong> {selectedTask.priority}</p>
                            {selectedTask.dueDateTime && (
                                <p><strong>Due Date:</strong> {new Date(selectedTask.dueDateTime).toLocaleDateString()}</p>
                            )}

                            <p><strong>Start Date :</strong>{new Date(selectedTask.startDateTime).toLocaleDateString()}</p>
                            {/* Add more details as needed */}
                        </>
                    )}
                </div>
                {showAddForm && (
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
                            <h3>Add New Task</h3>
                            <div className="form-group">
                                <label>Task Name</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="Task name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Description"
                                />
                            </div>
                            <div className="form-group">
                                <label>Start Date & Time</label>
                                <button
                                    className="datetime-btn"
                                    onClick={() => setShowStartPicker(!showStartPicker)}
                                >
                                    {newTask.startDateTime || 'Select start date & time'}
                                </button>
                                {showStartPicker && (
                                    <input
                                        type="datetime-local"
                                        value={newTask.startDateTime}
                                        onChange={(e) => setNewTask({ ...newTask, startDateTime: e.target.value })}
                                    />
                                )}
                            </div>
                            <div className="form-group">
                                <label>Enable Due Date</label>
                                <input
                                    type="checkbox"
                                    checked={enableDueDate}
                                    onChange={(e) => {
                                        setEnableDueDate(e.target.checked);
                                        if (!e.target.checked) {
                                            setNewTask({ ...newTask, dueDateTime: '' });
                                        }
                                    }}
                                />
                            </div>

                            {enableDueDate && (
                                <div className="form-group">
                                    <label>Due Date & Time</label>
                                    <button
                                        className="datetime-btn"
                                        onClick={() => setShowDuePicker(!showDuePicker)}
                                    >
                                        {newTask.dueDateTime || 'Select due date & time'}
                                    </button>
                                    {showDuePicker && (
                                        <input
                                            type="datetime-local"
                                            value={newTask.dueDateTime}
                                            onChange={(e) => setNewTask({ ...newTask, dueDateTime: e.target.value })}
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
                                        >
                                            To Do
                                        </button>
                                        <button
                                            className={`slider-btn ${newTask.status === 'IN_PROGRESS' ? 'active' : ''}`}
                                            onClick={() => setNewTask({ ...newTask, status: 'IN_PROGRESS' })}
                                        >
                                            In Progress
                                        </button>
                                        <button
                                            className={`slider-btn ${newTask.status === 'DONE' ? 'active' : ''}`}
                                            onClick={() => setNewTask({ ...newTask, status: 'DONE' })}
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
                                        >
                                            High
                                        </button>
                                        <button
                                            className={`slider-btn ${newTask.priority === 'MEDIUM' ? 'active' : ''}`}
                                            onClick={() => setNewTask({ ...newTask, priority: 'MEDIUM' })}
                                        >
                                            Medium
                                        </button>
                                        <button
                                            className={`slider-btn ${newTask.priority === 'LOW' ? 'active' : ''}`}
                                            onClick={() => setNewTask({ ...newTask, priority: 'LOW' })}
                                        >
                                            Low
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="add-task-btn"
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem('token');
                                        const response = await axios.post(
                                            'http://localhost:8080/api/tasks',
                                            {
                                                ...newTask,
                                                user: null, // or remove if not needed, your backend may handle user
                                            },
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            }
                                        );
                                        setTasks([...tasks, response.data]);
                                        setShowAddForm(false);
                                        setNewTask({
                                            title: '',
                                            description: '',
                                            startDateTime: '',
                                            dueDateTime: '',
                                            status: 'TODO',
                                            priority: 'MEDIUM',
                                        });
                                    } catch (error) {
                                        console.error('Failed to add task:', error);
                                    }
                                }}
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default TaskList;
