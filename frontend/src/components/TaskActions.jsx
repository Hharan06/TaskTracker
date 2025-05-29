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
                                <div className="submenu-option" onClick={() => handleFilter("this_week")}>This Week</div>
                                <div className="submenu-option" onClick={() => handleFilter("next_week")}>Next Week</div>
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
                                <div className="submenu-option" onClick={() => handleFilter("this_month")}>This Month</div>
                                <div className="submenu-option" onClick={() => handleFilter("next_month")}>Next Month</div>
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
