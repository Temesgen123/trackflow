// components/tasks/kanban-board.tsx — Drag-and-drop Kanban board
"use client";

import { useState, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import type { TaskStatus, TaskWithAssignee } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "TODO",        label: "To do"       },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "IN_REVIEW",   label: "In review"  },
  { id: "DONE",        label: "Done"        },
];

interface KanbanBoardProps {
  initialTasks: TaskWithAssignee[];
  sprintId: string;
}

export function KanbanBoard({ initialTasks, sprintId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [, startTransition] = useTransition();

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const newStatus = destination.droppableId as TaskStatus;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    // Persist to API
    startTransition(async () => {
      await fetch(`/api/tasks/${draggableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    });
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(({ id, label }) => {
          const colTasks = tasksByStatus(id);
          return (
            <div key={id} className="flex flex-col">
              {/* Column header */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>

              {/* Droppable column */}
              <Droppable droppableId={id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 rounded-xl p-2 min-h-[200px] transition-colors",
                      snapshot.isDraggingOver ? "bg-primary/5 border-2 border-dashed border-primary/30" : "bg-muted/40"
                    )}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "mb-2 rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing",
                              snapshot.isDragging && "shadow-lg ring-2 ring-primary/20"
                            )}
                          >
                            <p className="text-sm font-medium leading-snug mb-2">{task.title}</p>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <PriorityBadge priority={task.priority} />
                              {task.dueDate && (
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(task.dueDate), "MMM d")}
                                </span>
                              )}
                            </div>
                            {task.assignee && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                                  {task.assignee.name?.charAt(0)}
                                </div>
                                <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
