import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Bell, Wifi, WifiOff, CloudCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  subtitle: string;
  onAction?: () => void;
  actionLabel?: string;
}

export default function Header({ title, subtitle, onAction, actionLabel }: HeaderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate">{title}</h2>
            {isOnline ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 px-2 py-0">
                <CloudCheck className="w-3 h-3" />
                <span className="text-[10px] uppercase font-bold">Synced</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 px-2 py-0">
                <WifiOff className="w-3 h-3" />
                <span className="text-[10px] uppercase font-bold">Offline Mode</span>
              </Badge>
            )}
          </div>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {actionLabel && onAction && (
            <Button onClick={onAction} className="bg-primary text-white hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5 text-gray-500" />
          </Button>
        </div>
      </div>
    </header>
  );
}
