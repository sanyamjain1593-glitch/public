import { Button } from "@/components/ui/button";
import { Rocket, Columns, History, Palette, Calendar, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  currentView: "kanban" | "history" | "scheduled";
  onViewChange: (view: "kanban" | "history" | "scheduled") => void;
  onToggleThemeSelector: () => void;
}

export function Navbar({ currentView, onViewChange, onToggleThemeSelector }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar-glass sticky top-0 z-50">
      <div className="px-3 sm:px-4 md:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and Title - Optimized for mobile */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-background" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">FutureBoard</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Productivity</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleThemeSelector}
              data-testid="button-toggle-theme-mobile"
            >
              <Palette className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-3 border-t border-border/20 mt-2 pt-3">
            <div className="flex flex-col space-y-1">
              <Button
                variant={currentView === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  onViewChange("kanban");
                  setIsMobileMenuOpen(false);
                }}
                className="justify-start"
                data-testid="button-switch-kanban-mobile"
              >
                <Columns className="h-4 w-4 mr-3" />Board
              </Button>
              <Button
                variant={currentView === "history" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  onViewChange("history");
                  setIsMobileMenuOpen(false);
                }}
                className="justify-start"
                data-testid="button-switch-history-mobile"
              >
                <History className="h-4 w-4 mr-3" />History
              </Button>
              <Button
                variant={currentView === "scheduled" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  onViewChange("scheduled");
                  setIsMobileMenuOpen(false);
                }}
                className="justify-start"
                data-testid="button-switch-scheduled-mobile"
              >
                <Calendar className="h-4 w-4 mr-3" />Scheduled
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
