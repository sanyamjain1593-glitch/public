import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 3 seconds if not dismissed
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed) {
          setIsVisible(true);
        }
      }, 3000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    
    if (result.outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:w-80 z-50"
      data-testid="pwa-install-prompt"
    >
      <Card className="glass-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <i className="fas fa-mobile-alt text-background"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Install FutureBoard</h4>
              <p className="text-sm text-muted-foreground">Get the full experience with offline access</p>
              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="floating-button text-background"
                  data-testid="button-install-pwa"
                >
                  Install
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  data-testid="button-dismiss-pwa"
                >
                  Later
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground p-1"
              data-testid="button-close-pwa"
            >
              <i className="fas fa-times text-sm"></i>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
