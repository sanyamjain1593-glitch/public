import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function HistoryView() {
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");
  
  const { data: completedTasks = [], isLoading } = useQuery({
    queryKey: ["/api/history"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    staleTime: 5 * 60 * 1000,
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-primary/20 text-primary";
      case "medium": return "bg-secondary/20 text-secondary";
      case "low": return "bg-accent/20 text-accent";
      default: return "bg-muted/20 text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-view">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Task History</h2>
          <p className="text-muted-foreground">Completed tasks and productivity insights</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("week")}
            data-testid="button-week-filter"
          >
            <i className="fas fa-calendar-week mr-2"></i>This Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
            data-testid="button-month-filter"
          >
            <i className="fas fa-calendar-month mr-2"></i>This Month
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Completed Today</p>
                  <p className="text-3xl font-bold text-primary" data-testid="stat-today-completed">
                    {stats.todayCompleted}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <i className="fas fa-check text-primary"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Weekly Average</p>
                  <p className="text-3xl font-bold text-secondary" data-testid="stat-weekly-average">
                    {stats.weeklyAverage}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <i className="fas fa-chart-line text-secondary"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Tasks</p>
                  <p className="text-3xl font-bold text-accent" data-testid="stat-total-tasks">
                    {stats.totalTasks}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <i className="fas fa-tasks text-accent"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Timeline */}
      <Card className="glass-card border-border">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
          
          <div className="space-y-4">
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <i className="fas fa-history text-2xl mb-2 block"></i>
                <p>No completed tasks yet</p>
                <p className="text-sm">Completed tasks will appear here</p>
              </div>
            ) : (
              completedTasks.map((task: any) => (
                <div 
                  key={task.id} 
                  className="flex items-start space-x-4 p-4 rounded-lg bg-muted/10"
                  data-testid={`history-item-${task.id}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-check text-background text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground" data-testid="text-history-task-title">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-muted-foreground text-sm" data-testid="text-history-task-description">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-muted-foreground" data-testid="text-history-completion-date">
                        Completed {formatDate(task.completedAt || task.updatedAt)}
                      </span>
                      {task.category && (
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
