import { useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./kanban-column";
import { useTasks } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";
import { Plus } from "lucide-react";

interface KanbanBoardProps {
  onAddTask: (column?: string) => void;
  onEditTask: (task: Task) => void;
}

const columns = [
  { id: "backlog", title: "To Do", color: "hsl(var(--muted-foreground))" },
  { id: "in-progress", title: "In Progress", color: "hsl(var(--secondary))" },
  { id: "done", title: "Done", color: "hsl(var(--primary))" },
];

export function KanbanBoard({ onAddTask, onEditTask }: KanbanBoardProps) {
  const { tasks, updateTask, deleteTask, isLoading } = useTasks();
  const { toast } = useToast();

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTaskStats = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const activeTasks = tasks?.filter(task => {
      if (task.isArchived) return false;
      if (!task.dueDate) return true;
      const taskDueDate = new Date(task.dueDate);
      return taskDueDate <= today;
    }) || [];
    
    const scheduledTasks = tasks?.filter(task => {
      if (task.isArchived || !task.dueDate) return false;
      const taskDueDate = new Date(task.dueDate);
      return taskDueDate > today;
    }) || [];
    
    const completedTasks = activeTasks.filter(task => task.status === "done").length;
    
    const scheduledText = scheduledTasks.length > 0 ? ` • ${scheduledTasks.length} scheduled` : '';
    return `${activeTasks.length} active tasks • ${completedTasks} completed${scheduledText}`;
  };

  const getTasksByStatus = (status: string) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today for proper comparison
    
    return tasks?.filter(task => {
      // Basic filters: status match and not archived
      if (task.status !== status || task.isArchived) return false;
      
      // If task has no due date, show it (immediate tasks)
      if (!task.dueDate) return true;
      
      // If task has a due date, only show if it's due today or overdue
      const taskDueDate = new Date(task.dueDate);
      return taskDueDate <= today;
    }) || [];
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId as Task["status"];

    try {
      await updateTask.mutateAsync({
        id: taskId,
        updates: { status: newStatus },
      });

      toast({
        title: "Task moved",
        description: `Task moved to ${columns.find(col => col.id === newStatus)?.title}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast({
        title: "Task deleted",
        description: "Task has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kanban-view h-full">
      {/* Mobile-Optimized Header */}
      <div className="flex flex-col space-y-3 sm:space-y-4 mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 truncate">Today's Board</h2>
            <div className="text-xs sm:text-sm text-muted-foreground">
              <span data-testid="text-current-date" className="block sm:inline">{getCurrentDate()}</span>
              <span className="hidden sm:inline"> • </span>
              <span data-testid="text-task-stats" className="block sm:inline">{getTaskStats()}</span>
            </div>
          </div>
          
          <Button
            onClick={() => onAddTask()}
            className="floating-button text-background font-medium w-full sm:w-auto shrink-0"
            size="sm"
            data-testid="button-add-task"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Mobile-Optimized Kanban Columns - Horizontal scroll on mobile */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-container">
          <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-6 min-h-0">
            {columns.map(column => (
              <div key={column.id} className="flex-shrink-0 w-72 sm:w-80 md:w-96 lg:flex-1 lg:w-auto">
                <KanbanColumn
                  column={column}
                  tasks={getTasksByStatus(column.id)}
                  onAddTask={() => onAddTask(column.id)}
                  onEditTask={onEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
