import { useTasks } from "@/hooks/use-tasks";
import { TaskCard } from "./task-card";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";

interface ScheduledViewProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export function ScheduledView({ onAddTask, onEditTask }: ScheduledViewProps) {
  const { tasks, isLoading, deleteTask } = useTasks();

  const getScheduledTasks = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return tasks?.filter(task => {
      if (task.isArchived || !task.dueDate) return false;
      const taskDueDate = new Date(task.dueDate);
      return taskDueDate > today;
    }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()) || [];
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const groupTasksByDate = (tasks: Task[]) => {
    const grouped: { [key: string]: Task[] } = {};
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = new Date(task.dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading scheduled tasks...</p>
        </div>
      </div>
    );
  }

  const scheduledTasks = getScheduledTasks();
  const groupedTasks = groupTasksByDate(scheduledTasks);

  return (
    <div className="scheduled-view">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Scheduled Tasks</h2>
          <p className="text-muted-foreground">
            {scheduledTasks.length} tasks scheduled for future dates
          </p>
        </div>
        
        <Button
          onClick={onAddTask}
          className="floating-button text-background font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Task
        </Button>
      </div>

      {scheduledTasks.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Scheduled Tasks</h3>
          <p className="text-muted-foreground mb-6">
            Create tasks with future due dates to see them here
          </p>
          <Button onClick={onAddTask} className="floating-button text-background">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Your First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTasks).map(([date, dateTasks]) => (
            <div key={date} className="space-y-4">
              <div className="glass-card rounded-xl p-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  {date}
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                    {dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                    isDragging={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}