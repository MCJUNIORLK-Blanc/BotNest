import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";

interface TopBarProps {
  title: string;
  description: string;
  onCreateBot?: () => void;
}

export default function TopBar({ title, description, onCreateBot }: TopBarProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          {onCreateBot && (
            <Button 
              onClick={onCreateBot}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              data-testid="create-bot-button"
            >
              <Plus size={16} className="mr-2" />
              Create Bot
            </Button>
          )}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-testid="notifications-button"
            >
              <Bell size={16} />
            </Button>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
