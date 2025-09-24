import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50" data-testid="offline-indicator">
      <Card className="glass-card border-border">
        <CardContent className="px-4 py-2">
          <div className="flex items-center space-x-2">
            <i className="fas fa-wifi-slash text-destructive"></i>
            <span className="text-sm">Offline Mode</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
