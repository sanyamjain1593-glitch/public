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
      case "high": return "bg-red-500/20 text-red-600 border border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-600 border border-green-500/30";
      default: return "bg-muted/20 text-muted-foreground border border-muted/30";
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

  const getCardBackground = (priority: string, status: string) => {
    if (status === "done") {
      return "bg-gradient-to-br from-slate-600 to-slate-700 text-white";
    }
    
    switch (priority) {
      case "high":
        return "bg-gradient-to-br from-rose-700 to-red-800 text-white";
      case "medium":
        return "bg-gradient-to-br from-amber-700 to-orange-800 text-white";
      case "low":
        return "bg-gradient-to-br from-emerald-700 to-teal-800 text-white";
      default:
        return "bg-gradient-to-br from-indigo-700 to-purple-800 text-white";
    }
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
      className={`task-card ${getCardBackground(task.priority, task.status)} backdrop-blur-sm border border-white/20 rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl hover:border-white/30 hover:brightness-110 ${
        isDragging ? "opacity-50 rotate-3 scale-105" : "hover:scale-[1.02]"
      }`}
      data-testid={`task-card-${task.id}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-white pr-2 leading-tight drop-shadow-sm" data-testid="text-task-title">
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
                className="text-white/70 hover:text-white text-sm h-6 w-6 p-0 drop-shadow-sm"
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
                className="text-white/70 hover:text-red-200 text-sm h-6 w-6 p-0 drop-shadow-sm"
                data-testid="button-delete-task"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {task.description && (
        <p className="text-white/90 text-sm mb-3 drop-shadow-sm" data-testid="text-task-description">
          {task.description}
        </p>
      )}
      
      {task.progress !== undefined && task.progress !== null && task.progress > 0 && task.status === "in-progress" && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-white/80 drop-shadow-sm">Progress</span>
            <span className="text-xs text-white font-medium drop-shadow-sm" data-testid="text-task-progress">
              {task.progress}%
            </span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden border border-muted/40">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300 shadow-sm" 
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
            <span className="text-xs text-white/80 drop-shadow-sm" data-testid="text-task-due-date">
              Due {formatDate(task.dueDate)}
            </span>
          )}
          {task.completedAt && (
            <span className="text-xs text-white/80 drop-shadow-sm" data-testid="text-task-completed-date">
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
