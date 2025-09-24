import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSelector({ isOpen, onClose }: ThemeSelectorProps) {
  const { currentTheme, setTheme } = useTheme();

  const handleSelectTheme = (themeId: string) => {
    setTheme(themeId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Your Theme</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
              className={`theme-preview cursor-pointer rounded-xl p-4 border transition-all ${
                currentTheme === theme.id 
                  ? "border-primary/50 ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/30"
              }`}
              data-testid={`theme-option-${theme.id}`}
            >
              <div 
                className="w-full h-24 rounded-lg mb-3"
                style={{ background: theme.gradient }}
              />
              <p className="text-sm font-medium">{theme.name}</p>
              <p className="text-xs text-muted-foreground">{theme.description}</p>
            </div>
          ))}
          
          {/* Pro themes placeholder */}
          <div className="theme-preview cursor-not-allowed rounded-xl p-4 border border-border opacity-50">
            <div className="w-full h-24 rounded-lg bg-gradient-to-r from-gray-600 to-gray-800 mb-3 flex items-center justify-center">
              <i className="fas fa-lock text-white"></i>
            </div>
            <p className="text-sm font-medium">Pro Theme</p>
            <p className="text-xs text-muted-foreground">Upgrade to unlock</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
