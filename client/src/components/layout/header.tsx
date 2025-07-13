import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onAction?: () => void;
  actionLabel?: string;
}

export default function Header({ title, subtitle, onAction, actionLabel }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate">{title}</h2>
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
