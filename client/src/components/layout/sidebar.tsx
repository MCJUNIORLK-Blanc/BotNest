import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home,
  Bot,
  FolderOpen,
  ScrollText,
  Settings,
  Users,
  LogOut,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Bots", href: "/bots", icon: Bot },
  { name: "File Manager", href: "/file-manager", icon: FolderOpen },
  { name: "Logs", href: "/logs", icon: ScrollText },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Users", href: "/users", icon: Users },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="sidebar-gradient w-64 flex-shrink-0 border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="text-primary-foreground text-xl" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">BotCommander</h1>
            <p className="text-xs text-muted-foreground">Discord Bot Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <User className="text-accent-foreground" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">admin</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <button 
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="logout-button"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
