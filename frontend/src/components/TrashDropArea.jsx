import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { FaTrashAlt } from 'react-icons/fa';

const TrashDropArea = () => (
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
);

export default TrashDropArea;
