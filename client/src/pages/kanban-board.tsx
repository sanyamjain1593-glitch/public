import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { HistoryView } from "@/components/history/history-view";
import { ScheduledView } from "@/components/kanban/scheduled-view";
import { ThemeSelector } from "@/components/kanban/theme-selector";
import { TaskModal } from "@/components/kanban/task-modal";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export default function KanbanBoardPage() {
  const [currentView, setCurrentView] = useState<"kanban" | "history" | "scheduled">("kanban");
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalData, setTaskModalData] = useState<{
    mode: "create" | "edit";
    task?: any;
    column?: string;
  }>({ mode: "create" });

  const handleAddTask = (column?: string) => {
    setTaskModalData({ mode: "create", column });
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: any) => {
    setTaskModalData({ mode: "edit", task });
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <OfflineIndicator />
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onToggleThemeSelector={() => setIsThemeSelectorOpen(true)}
      />
      
      <main className="p-3 sm:p-4 md:p-6 lg:p-8 min-h-screen">
        {currentView === "kanban" ? (
          <KanbanBoard
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
          />
        ) : currentView === "history" ? (
          <HistoryView />
        ) : (
          <ScheduledView
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
          />
        )}
      </main>

      <ThemeSelector
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        mode={taskModalData.mode}
        task={taskModalData.task}
        defaultColumn={taskModalData.column}
      />

      <InstallPrompt />
    </div>
  );
}
