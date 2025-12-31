import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Bell, WifiOff, Cloud, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { translations, toBS } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle: string;
  onAction?: () => void;
  actionLabel?: string;
}

export default function Header({ title, subtitle, onAction, actionLabel }: HeaderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lang, setLang] = useState(localStorage.getItem("preferred_lang") || "en");
  const t = translations[lang] || translations.en;
  const today = new Date();

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

  const toggleLang = () => {
    const newLang = lang === "en" ? "ne" : "en";
    setLang(newLang);
    localStorage.setItem("preferred_lang", newLang);
    window.location.reload(); // Simple reload to update all UI
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate">{title}</h2>
            {isOnline ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 px-2 py-0">
                <Cloud className="w-3 h-3" />
                <span className="text-[10px] uppercase font-bold">{t.synced}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 px-2 py-0">
                <WifiOff className="w-3 h-3" />
                <span className="text-[10px] uppercase font-bold">{t.offline}</span>
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600 text-sm">{subtitle}</p>
            <span className="text-gray-300">|</span>
            <p className="text-xs font-medium text-slate-500">
              {toBS(today)} BS ({today.toLocaleDateString()})
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleLang}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            {lang === "en" ? "नेपाली" : "English"}
          </Button>

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
