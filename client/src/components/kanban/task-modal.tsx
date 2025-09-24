import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTasks } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  task?: Task;
  defaultColumn?: string;
}

export function TaskModal({ isOpen, onClose, mode, task, defaultColumn }: TaskModalProps) {
  const { createTask, updateTask } = useTasks();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    status: "backlog" as const,
    dueDate: "",
    assigneeInitials: "",
    category: "",
    progress: 0,
  });

  useEffect(() => {
    if (mode === "edit" && task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
        assigneeInitials: task.assigneeInitials || "",
        category: task.category || "",
        progress: task.progress || 0,
      });
    } else if (mode === "create") {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: (defaultColumn as any) || "backlog",
        dueDate: "",
        assigneeInitials: "",
        category: "",
        progress: 0,
      });
    }
  }, [mode, task, defaultColumn, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        assigneeInitials: formData.assigneeInitials.trim() || undefined,
        category: formData.category.trim() || undefined,
        progress: formData.status === "in-progress" ? formData.progress : 0,
      };

      if (mode === "create") {
        await createTask.mutateAsync(taskData);
        toast({
          title: "Task created",
          description: "Your task has been successfully created",
        });
      } else if (task) {
        await updateTask.mutateAsync({
          id: task.id,
          updates: taskData,
        });
        toast({
          title: "Task updated",
          description: "Your task has been successfully updated",
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} task`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">
            {mode === "create" ? "Add New Task" : "Edit Task"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              className="bg-input border-border"
              data-testid="input-task-title"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description..."
              rows={3}
              className="bg-input border-border"
              data-testid="textarea-task-description"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-input border-border" data-testid="select-task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-input border-border" data-testid="select-task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="bg-input border-border"
                data-testid="input-task-due-date"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.dueDate && new Date(formData.dueDate) > new Date() ? 
                  "⏰ Task will be scheduled for the future" : 
                  "📅 Task will appear on today's board"}
              </p>
            </div>
            
            <div>
              <Label htmlFor="assigneeInitials">Assignee Initials</Label>
              <Input
                id="assigneeInitials"
                value={formData.assigneeInitials}
                onChange={(e) => setFormData(prev => ({ ...prev, assigneeInitials: e.target.value.slice(0, 3) }))}
                placeholder="e.g., JD"
                maxLength={3}
                className="bg-input border-border"
                data-testid="input-task-assignee"
              />
            </div>
          </div>

          {formData.status === "in-progress" && (
            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                className="bg-input border-border"
                data-testid="input-task-progress"
              />
            </div>
          )}

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Development, Design"
              className="bg-input border-border"
              data-testid="input-task-category"
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-task"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="floating-button text-background"
              disabled={createTask.isPending || updateTask.isPending}
              data-testid="button-save-task"
            >
              {createTask.isPending || updateTask.isPending ? "Saving..." : "Save Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
