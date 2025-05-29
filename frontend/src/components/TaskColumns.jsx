import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

const TaskColumns = ({ statuses, statusLabels, groupedTasks, setSelectedTask }) => (
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
);

export default TaskColumns;
