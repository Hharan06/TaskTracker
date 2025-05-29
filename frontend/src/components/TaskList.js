import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import TaskDetailsBottomSheet from "./TaskDetailsBottomSheet";
import Navbar from './Navbar';
import TaskActions from './TaskActions';
import TaskColumns from './TaskColumns';
import TrashDropArea from './TrashDropArea';
import TaskFormModal from "./TaskFormModal";
import './TaskList.css';
import {FaPlus} from "react-icons/fa";

const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];
const statusLabels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };

const TaskList = ({ onLogout }) => {
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

    // For add/edit modals (not shown in your snippet, but referenced)
    const [enableDueDate, setEnableDueDate] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTaskId, setEditTaskId] = useState(null);
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

    useEffect(() => { fetchTasks(); }, []);

    // Date calculations for filtering
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
        if (task.dueDateTime) dueDate = new Date(task.dueDateTime);
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
            <Navbar onLogout={onLogout} />
            <div className="container mt-4 m-1">
                <h1 className="mb-4">Your Tasks</h1>
                <TaskActions
                    showFilterPopup={showFilterPopup}
                    setShowFilterPopup={setShowFilterPopup}
                    filter={filter}
                    setFilter={setFilter}
                    hoveredFilter={hoveredFilter}
                    setHoveredFilter={setHoveredFilter}
                    showSortPopup={showSortPopup}
                    setShowSortPopup={setShowSortPopup}
                    sortField={sortField}
                    setSortField={setSortField}
                    isClosing={isClosing}
                    setIsClosing={setIsClosing}
                    handleFilter={handleFilter}
                />
                <DragDropContext onDragEnd={onDragEnd}>
                    <TaskColumns
                        statuses={statuses}
                        statusLabels={statusLabels}
                        groupedTasks={groupedTasks}
                        setSelectedTask={setSelectedTask}
                    />
                    <TrashDropArea />
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
                            setIsEditMode(false); // Ensure it's not in edit mode
                            setEditTaskId(null);
                            setEnableDueDate(false); // Optional: reset due date toggle
                        }}
                    >
                        <FaPlus size={28} color="#fff" />
                    </button>
                    <TaskFormModal
                        showAddForm={showAddForm}
                        setShowAddForm={setShowAddForm}
                        isEditMode={isEditMode}
                        setIsEditMode={setIsEditMode}
                        editTaskId={editTaskId}
                        setEditTaskId={setEditTaskId}
                        newTask={newTask}
                        setNewTask={setNewTask}
                        enableDueDate={enableDueDate}
                        setEnableDueDate={setEnableDueDate}
                        showStartPicker={showStartPicker}
                        setShowStartPicker={setShowStartPicker}
                        showDuePicker={showDuePicker}
                        setShowDuePicker={setShowDuePicker}
                        setTasks={setTasks}
                        tasks={tasks}
                    />

                </DragDropContext>


                <div
                    className={`bottom-sheet-overlay ${selectedTask ? 'open' : ''}`}
                    onClick={() => setSelectedTask(null)}
                />
                <TaskDetailsBottomSheet
                    selectedTask={selectedTask}
                    setSelectedTask={setSelectedTask}
                    setNewTask={setNewTask}
                    setEditTaskId={setEditTaskId}
                    setIsEditMode={setIsEditMode}
                    setShowAddForm={setShowAddForm}
                    statusLabels={statusLabels}
                />

            </div>
        </div>
    );
};

export default TaskList;
