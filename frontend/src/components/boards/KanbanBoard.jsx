import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { TASK_STATUSES } from '../../constants/index.js';
import { KanbanColumn } from './KanbanColumn.jsx';
import { TaskCard } from '../tasks/TaskCard.jsx';

export const KanbanBoard = ({
  tasks,
  onMoveTask,
  onTaskClick,
  onQuickAdd,
}) => {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id;
    const activeTaskObj = tasks.find((t) => t.id === activeTaskId);
    if (!activeTaskObj) return;

    let targetStatus = null;
    let overTaskId = null;

    // Check if dropped directly onto a column or another task
    if (TASK_STATUSES.some((col) => col.id === over.id)) {
      targetStatus = over.id;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetStatus = overTask.status;
        overTaskId = overTask.id;
      }
    }

    if (!targetStatus) return;

    // Get current tasks in target column excluding the active task
    const columnTasks = tasks
      .filter((t) => t.status === targetStatus && t.id !== activeTaskId)
      .sort((a, b) => a.position - b.position);

    let newPosition = 1000.0;

    if (overTaskId) {
      const overIndex = columnTasks.findIndex((t) => t.id === overTaskId);
      if (overIndex === -1) {
        newPosition = (columnTasks.length + 1) * 1000.0;
      } else {
        const prevTask = columnTasks[overIndex - 1];
        const nextTask = columnTasks[overIndex];

        if (!prevTask && nextTask) {
          newPosition = nextTask.position / 2;
        } else if (prevTask && nextTask) {
          newPosition = (prevTask.position + nextTask.position) / 2;
        } else if (prevTask && !nextTask) {
          newPosition = prevTask.position + 1000.0;
        }
      }
    } else {
      // Dropped onto empty space in column
      const last = columnTasks[columnTasks.length - 1];
      newPosition = last ? last.position + 1000.0 : 1000.0;
    }

    // Call move task handler
    onMoveTask({
      taskId: activeTaskId,
      status: targetStatus,
      newPosition,
      targetColumnTaskIds: [...columnTasks.map((t) => t.id), activeTaskId],
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start h-[calc(100vh-170px)] min-h-[500px]">
        {TASK_STATUSES.map((column) => {
          const columnTasks = tasks
            .filter((t) => t.status === column.id)
            .sort((a, b) => a.position - b.position);

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              onTaskClick={onTaskClick}
              onQuickAdd={onQuickAdd}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 scale-105 shadow-2xl opacity-90 cursor-grabbing pointer-events-none">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
