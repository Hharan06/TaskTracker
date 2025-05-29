import React from "react";
import "./TaskList.css";

const TaskDetailsBottomSheet = ({
                                    selectedTask,
                                    setSelectedTask,
                                    setNewTask,
                                    setEditTaskId,
                                    setIsEditMode,
                                    setShowAddForm,
                                    statusLabels
                                }) => {
    if (!selectedTask) return null;

    return (
        <div className={`bottom-sheet open`}>
            <button
                className="close-bottom-sheet"
                onClick={() => setSelectedTask(null)}
            >
                ×
            </button>
            <h2>{selectedTask.title}</h2>
            <p>
                <strong>Description:</strong> {selectedTask.description}
            </p>
            <p>
                <strong>Status:</strong> {statusLabels[selectedTask.status]}
            </p>
            <p>
                <strong>Priority:</strong> {selectedTask.priority}
            </p>
            {selectedTask.dueDateTime && (
                <p>
                    <strong>Due Date:</strong>{" "}
                    {new Date(selectedTask.dueDateTime).toLocaleDateString()}
                </p>
            )}
            <p>
                <strong>Start Date :</strong>
                {new Date(selectedTask.startDateTime).toLocaleDateString()}
            </p>
            <button
                onClick={() => {
                    setNewTask({
                        title: selectedTask.title,
                        description: selectedTask.description,
                        startDateTime: selectedTask.startDateTime,
                        dueDateTime: selectedTask.dueDateTime || "",
                        status: selectedTask.status,
                        priority: selectedTask.priority
                    });
                    setEditTaskId(selectedTask.task_id);
                    setIsEditMode(true);
                    setShowAddForm(true);
                }}
            >
                Edit
            </button>
        </div>
    );
};

export default TaskDetailsBottomSheet;
