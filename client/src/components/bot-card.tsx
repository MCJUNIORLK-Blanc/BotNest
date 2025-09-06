import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Play, Square, RotateCcw, Settings } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Bot as BotType } from "@shared/schema";

interface BotCardProps {
  bot: BotType;
}

export default function BotCard({ bot }: BotCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/bots/${bot.id}/start`),
    onSuccess: () => {
      toast({
        title: "Bot Starting",
        description: `${bot.name} is starting up...`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
    },
    onError: (error) => {
      toast({
        title: "Start Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/bots/${bot.id}/stop`),
    onSuccess: () => {
      toast({
        title: "Bot Stopping",
        description: `${bot.name} is shutting down...`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
    },
    onError: (error) => {
      toast({
        title: "Stop Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const restartMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/bots/${bot.id}/restart`),
    onSuccess: () => {
      toast({
        title: "Bot Restarting",
        description: `${bot.name} is restarting...`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
    },
    onError: (error) => {
      toast({
        title: "Restart Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bot-status-online";
      case "offline":
        return "bot-status-offline";
      case "starting":
        return "bot-status-starting";
      case "stopping":
        return "bot-status-stopping";
      case "error":
        return "bot-status-error";
      default:
        return "bot-status-offline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return { text: "Online", color: "text-accent" };
      case "offline":
        return { text: "Offline", color: "text-destructive" };
      case "starting":
        return { text: "Starting", color: "text-orange-400" };
      case "stopping":
        return { text: "Stopping", color: "text-orange-400" };
      case "error":
        return { text: "Error", color: "text-destructive" };
      default:
        return { text: "Unknown", color: "text-muted-foreground" };
    }
  };

  const formatUptime = (seconds: number) => {
    if (seconds === 0) return "Offline";
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${Math.floor((seconds % 3600) / 60)}m`;
    } else {
      return `${Math.floor(seconds / 60)}m`;
    }
  };

  const statusInfo = getStatusText(bot.status);

  return (
    <div 
      className="bg-muted/30 rounded-lg p-4 border border-border hover:border-primary/50 transition-colors"
      data-testid={`bot-card-${bot.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="text-primary-foreground" size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground" data-testid={`bot-name-${bot.id}`}>
              {bot.name}
            </h4>
            <p className="text-sm text-muted-foreground" data-testid={`bot-description-${bot.id}`}>
              {bot.description}
            </p>
            <div className="flex items-center space-x-4 mt-1">
              <Badge 
                className={cn(
                  "text-xs px-2 py-1 rounded",
                  bot.language === "nodejs" ? "language-nodejs" : "language-python"
                )}
                data-testid={`bot-language-${bot.id}`}
              >
                {bot.language === "nodejs" ? "Node.js" : "Python"}
              </Badge>
              <span className="text-xs text-muted-foreground" data-testid={`bot-uptime-${bot.id}`}>
                Uptime: {formatUptime(bot.uptime || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              getStatusColor(bot.status),
              bot.status === "starting" && "pulse-animation"
            )}></div>
            <span 
              className={cn("text-sm font-medium", statusInfo.color)}
              data-testid={`bot-status-${bot.id}`}
            >
              {statusInfo.text}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {bot.status === "offline" || bot.status === "error" ? (
              <Button
                size="sm"
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid={`bot-start-${bot.id}`}
              >
                <Play size={14} className="mr-1" />
                Start
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => restartMutation.mutate()}
                  disabled={restartMutation.isPending}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  data-testid={`bot-restart-${bot.id}`}
                >
                  <RotateCcw size={14} className="mr-1" />
                  Restart
                </Button>
                <Button
                  size="sm"
                  onClick={() => stopMutation.mutate()}
                  disabled={stopMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-testid={`bot-stop-${bot.id}`}
                >
                  <Square size={14} className="mr-1" />
                  Stop
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="bg-muted text-muted-foreground hover:bg-muted/80"
              data-testid={`bot-manage-${bot.id}`}
            >
              <Settings size={14} className="mr-1" />
              Manage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
