import React from 'react';
import "./TaskList.css";

const TaskActions = ({
                         showFilterPopup, setShowFilterPopup,
                         filter, setFilter,
                         hoveredFilter, setHoveredFilter,
                         showSortPopup, setShowSortPopup,
                         sortField, setSortField,
                         isClosing, setIsClosing,
                         handleFilter
                     }) => (
    <div className="task-actions">
        <div className="sort-button-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
            <button
                className="btn btn-primary"
                onClick={() => {
                    setIsClosing(showSortPopup);
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
                    <div className="sort-option" onClick={() => setSortField('priority')}>Priority</div>
                    <div className="sort-option" onClick={() => setSortField('startDateTime')}>Start Date/Time</div>
                    <div className="sort-option" onClick={() => setSortField('dueDateTime')}>Due Date/Time</div>
                </div>
            )}
        </div>
    </div>
);

export default TaskActions;
