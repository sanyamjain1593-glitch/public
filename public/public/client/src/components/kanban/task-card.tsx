import { Button } from "@/components/ui/button";
import { Task } from "@shared/schema";
import { Edit, Trash2, CheckCircle } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, isDragging }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-primary/20 text-primary";
      case "medium": return "bg-secondary/20 text-secondary";
      case "low": return "bg-accent/20 text-accent";
      default: return "bg-muted/20 text-muted-foreground";
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (initials?: string | null) => {
    return initials || "??";
  };

  const getAssigneeGradient = (initials?: string | null) => {
    const colors = [
      "from-primary to-secondary",
      "from-secondary to-accent",
      "from-accent to-primary",
      "from-primary to-accent",
    ];
    const index = initials ? initials.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <div 
      className={`task-card rounded-xl p-4 cursor-pointer transition-all ${
        isDragging ? "opacity-50 rotate-3" : "hover:scale-[1.02]"
      } ${task.status === "done" ? "opacity-75" : ""}`}
      data-testid={`task-card-${task.id}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-foreground pr-2" data-testid="text-task-title">
          {task.title}
        </h4>
        <div className="flex space-x-2 flex-shrink-0">
          {task.status === "done" ? (
            <CheckCircle className="h-4 w-4 text-primary" />
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-muted-foreground hover:text-primary text-sm h-6 w-6 p-0"
                data-testid="button-edit-task"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-muted-foreground hover:text-destructive text-sm h-6 w-6 p-0"
                data-testid="button-delete-task"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {task.description && (
        <p className="text-muted-foreground text-sm mb-3" data-testid="text-task-description">
          {task.description}
        </p>
      )}
      
      {task.progress !== undefined && task.progress > 0 && task.status === "in-progress" && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs text-primary" data-testid="text-task-progress">
              {task.progress}%
            </span>
          </div>
          <div className="w-full bg-muted/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all" 
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
            {task.status === "done" ? "Completed" : task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          {task.dueDate && (
            <span className="text-xs text-muted-foreground" data-testid="text-task-due-date">
              Due {formatDate(task.dueDate)}
            </span>
          )}
          {task.completedAt && (
            <span className="text-xs text-muted-foreground" data-testid="text-task-completed-date">
              Completed {formatDate(task.completedAt)}
            </span>
          )}
        </div>
        
        <div 
          className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAssigneeGradient(task.assigneeInitials)} flex items-center justify-center text-xs font-medium text-background`}
          data-testid="avatar-assignee"
        >
          {getInitials(task.assigneeInitials)}
        </div>
      </div>
    </div>
  );
}
