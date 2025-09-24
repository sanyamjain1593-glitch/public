import { Button } from "@/components/ui/button";
import { Rocket, Columns, History, Palette, Calendar } from "lucide-react";

interface NavbarProps {
  currentView: "kanban" | "history" | "scheduled";
  onViewChange: (view: "kanban" | "history" | "scheduled") => void;
  onToggleThemeSelector: () => void;
}

export function Navbar({ currentView, onViewChange, onToggleThemeSelector }: NavbarProps) {
  return (
    <nav className="navbar-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Rocket className="h-5 w-5 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">FutureBoard</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Productivity</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant={currentView === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("kanban")}
              data-testid="button-switch-kanban"
            >
              <Columns className="h-4 w-4 mr-2" />Board
            </Button>
            <Button
              variant={currentView === "history" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("history")}
              data-testid="button-switch-history"
            >
              <History className="h-4 w-4 mr-2" />History
            </Button>
            <Button
              variant={currentView === "scheduled" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("scheduled")}
              data-testid="button-switch-scheduled"
            >
              <Calendar className="h-4 w-4 mr-2" />Scheduled
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleThemeSelector}
              data-testid="button-toggle-theme"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
