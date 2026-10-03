// components/tasks/kanban-board.tsx — Full drag-and-drop Kanban board
"use client";

import { useState, useTransition, useOptimistic } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { PriorityBadge } from "@/components/ui/priority-badge";
import type { TaskStatus, TaskWithAssignee } from "@/types";
import { STATUS_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { GripVertical } from "lucide-react";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "TODO",        label: "To do",       color: "bg-gray-400" },
  { id: "IN_PROGRESS", label: "In progress", color: "bg-blue-500" },
  { id: "IN_REVIEW",   label: "In review",   color: "bg-orange-400" },
  { id: "DONE",        label: "Done",        color: "bg-green-500" },
];

const COLUMN_BG: Record<TaskStatus, string> = {
  TODO:        "bg-gray-50 border-gray-200",
  IN_PROGRESS: "bg-blue-50/50 border-blue-100",
  IN_REVIEW:   "bg-orange-50/50 border-orange-100",
  DONE:        "bg-green-50/50 border-green-100",
  BLOCKED:     "bg-red-50/50 border-red-100",
};

const COLUMN_DRAG_OVER: Record<TaskStatus, string> = {
  TODO:        "ring-2 ring-gray-300 bg-gray-100",
  IN_PROGRESS: "ring-2 ring-blue-300 bg-blue-50",
  IN_REVIEW:   "ring-2 ring-orange-300 bg-orange-50",
  DONE:        "ring-2 ring-green-300 bg-green-50",
  BLOCKED:     "ring-2 ring-red-300 bg-red-50",
};

interface KanbanBoardProps {
  initialTasks: TaskWithAssignee[];
  sprintId: string;
  sprintName?: string;
}

export function KanbanBoard({ initialTasks, sprintId, sprintName }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<TaskWithAssignee[]>(initialTasks);
  const [, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  async function handleDragEnd(result: DropResult) {
    setDraggingId(null);
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const newStatus = destination.droppableId as TaskStatus;
    const oldStatus = source.droppableId as TaskStatus;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    // Persist
    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Revert on failure
        setTasks((prev) =>
          prev.map((t) => (t.id === draggableId ? { ...t, status: oldStatus } : t))
        );
      }
    } catch {
      // Revert on network error
      setTasks((prev) =>
        prev.map((t) => (t.id === draggableId ? { ...t, status: oldStatus } : t))
      );
    }
  }

  const totalTasks = tasks.length;
  const doneTasks  = tasks.filter((t) => t.status === "DONE").length;
  const progress   = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Sprint info bar */}
      {sprintName && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse inline-block"/>
              Active sprint
            </span>
            <span className="text-sm font-medium">{sprintName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{doneTasks}/{totalTasks} done</span>
            <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
        </div>
      )}

      {/* Board */}
      <DragDropContext
        onDragStart={(start) => setDraggingId(start.draggableId)}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-3">
          {COLUMNS.map(({ id, label, color }) => {
            const colTasks = tasksByStatus(id);
            return (
              <div key={id} className="flex flex-col min-w-0">
                {/* Column header */}
                <div className="mb-2 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", color)} />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {label}
                    </span>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>

                {/* Droppable */}
                <Droppable droppableId={id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 rounded-xl border p-2 min-h-[320px] transition-all duration-150",
                        COLUMN_BG[id],
                        snapshot.isDraggingOver && COLUMN_DRAG_OVER[id]
                      )}
                    >
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "mb-2 rounded-lg border bg-card p-3 transition-shadow",
                                snapshot.isDragging
                                  ? "shadow-lg ring-2 ring-primary/30 rotate-1 opacity-95"
                                  : "shadow-sm hover:shadow-md",
                                task.status === "DONE" && "opacity-60"
                              )}
                            >
                              {/* Drag handle + title row */}
                              <div className="flex items-start gap-1.5 mb-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-muted-foreground/40 hover:text-muted-foreground mt-0.5 cursor-grab active:cursor-grabbing shrink-0"
                                >
                                  <GripVertical className="h-3.5 w-3.5" />
                                </div>
                                <p className={cn(
                                  "text-sm font-medium leading-snug flex-1 min-w-0",
                                  task.status === "DONE" && "line-through text-muted-foreground"
                                )}>
                                  {task.title}
                                </p>
                              </div>

                              {/* Meta */}
                              <div className="flex flex-wrap items-center gap-1.5 pl-5">
                                <PriorityBadge priority={task.priority} />
                                {task.dueDate && (
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(task.dueDate), "MMM d")}
                                  </span>
                                )}
                              </div>

                              {/* Assignee */}
                              {task.assignee && (
                                <div className="mt-2 pl-5 flex items-center gap-1.5">
                                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                                    {task.assignee.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {task.assignee.name}
                                  </span>
                                </div>
                              )}

                              {/* Milestone label */}
                              {task.milestone && (
                                <div className="mt-1.5 pl-5">
                                  <span className="text-[10px] text-muted-foreground/70 truncate block">
                                    {task.milestone.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Empty state */}
                      {colTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex h-20 items-center justify-center">
                          <p className="text-xs text-muted-foreground/50">Drop tasks here</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Blocked column — shown separately below if any blocked tasks */}
      {tasks.filter((t) => t.status === "BLOCKED").length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Blocked
            </span>
            <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-semibold">
              {tasks.filter((t) => t.status === "BLOCKED").length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {tasks.filter((t) => t.status === "BLOCKED").map((task) => (
              <div key={task.id} className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                <p className="text-sm font-medium leading-snug">{task.title}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
