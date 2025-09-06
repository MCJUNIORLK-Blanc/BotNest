import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import TopBar from "@/components/layout/topbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, 
  Trash2, 
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { Bot, BotLog } from "@shared/schema";

export default function Logs() {
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  const { data: bots = [] } = useQuery<Bot[]>({
    queryKey: ["/api/bots"],
  });

  const { data: logs = [], refetch } = useQuery<BotLog[]>({
    queryKey: ["/api/bots", selectedBotId, "logs"],
    enabled: !!selectedBotId,
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const clearLogsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/bots/${selectedBotId}/logs`),
    onSuccess: () => {
      toast({
        title: "Logs Cleared",
        description: "All logs have been cleared successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots", selectedBotId, "logs"] });
    },
    onError: (error) => {
      toast({
        title: "Clear Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!selectedBotId) return;

    const unsubscribe = subscribe("bot_log_created", (log: BotLog) => {
      if (log.botId === selectedBotId) {
        refetch();
      }
    });

    return unsubscribe;
  }, [subscribe, selectedBotId, refetch]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return { icon: AlertCircle, color: "text-destructive" };
      case "warn":
        return { icon: AlertTriangle, color: "text-orange-400" };
      case "info":
        return { icon: Info, color: "text-accent" };
      case "debug":
        return { icon: Bug, color: "text-muted-foreground" };
      default:
        return { icon: Info, color: "text-muted-foreground" };
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "error":
        return "destructive";
      case "warn":
        return "secondary";
      case "info":
        return "default";
      case "debug":
        return "outline";
      default:
        return "outline";
    }
  };

  const selectedBot = bots.find(bot => bot.id === selectedBotId);
  const errorCount = logs.filter(log => log.level === "error").length;
  const warnCount = logs.filter(log => log.level === "warn").length;

  return (
    <>
      <TopBar
        title="Logs"
        description="View and manage bot logs"
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Controls */}
        <div className="card-gradient rounded-lg border border-border p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedBotId} onValueChange={setSelectedBotId}>
                <SelectTrigger data-testid="bot-select">
                  <SelectValue placeholder="Select a bot to view logs..." />
                </SelectTrigger>
                <SelectContent>
                  {bots.map(bot => (
                    <SelectItem key={bot.id} value={bot.id}>
                      {bot.name} ({bot.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBotId && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="search-logs-input"
                  />
                </div>

                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[140px]" data-testid="level-filter-select">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    data-testid="auto-refresh-toggle"
                  >
                    <RefreshCw size={16} className={autoRefresh ? "animate-spin" : ""} />
                    Auto Refresh
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="download-logs-button"
                  >
                    <Download size={16} />
                    Export
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => clearLogsMutation.mutate()}
                    disabled={clearLogsMutation.isPending}
                    data-testid="clear-logs-button"
                  >
                    <Trash2 size={16} />
                    Clear
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {selectedBotId && (
          <>
            {/* Log Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Logs</p>
                      <p className="text-2xl font-bold" data-testid="total-logs-count">
                        {logs.length}
                      </p>
                    </div>
                    <Info className="text-muted-foreground" size={20} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Errors</p>
                      <p className="text-2xl font-bold text-destructive" data-testid="error-logs-count">
                        {errorCount}
                      </p>
                    </div>
                    <AlertCircle className="text-destructive" size={20} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Warnings</p>
                      <p className="text-2xl font-bold text-orange-400" data-testid="warning-logs-count">
                        {warnCount}
                      </p>
                    </div>
                    <AlertTriangle className="text-orange-400" size={20} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Bot Status</p>
                      <p className="text-lg font-semibold">
                        <Badge 
                          variant={selectedBot?.status === "online" ? "default" : "destructive"}
                          data-testid="bot-status-badge"
                        >
                          {selectedBot?.status}
                        </Badge>
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full bot-status-${selectedBot?.status}`}></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Logs Display */}
            <div className="card-gradient rounded-lg border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Log Entries ({filteredLogs.length})
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    Showing {levelFilter === "all" ? "all levels" : levelFilter} logs
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="p-6 space-y-2">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <Info size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery || levelFilter !== "all" 
                          ? "No logs match your filters"
                          : "No logs available for this bot"
                        }
                      </p>
                    </div>
                  ) : (
                    filteredLogs.map((log) => {
                      const iconInfo = getLevelIcon(log.level);
                      return (
                        <div 
                          key={log.id}
                          className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          data-testid={`log-entry-${log.id}`}
                        >
                          <div className="flex-shrink-0 mt-1">
                            <iconInfo.icon className={iconInfo.color} size={16} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge 
                                variant={getLevelBadgeVariant(log.level)}
                                className="text-xs"
                              >
                                {log.level.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(log.timestamp!), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground font-mono break-words">
                              {log.message}
                            </p>
                          </div>

                          <div className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(log.timestamp!).toLocaleTimeString()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {!selectedBotId && (
          <div className="card-gradient rounded-lg border border-border p-12">
            <div className="text-center">
              <Search size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Select a Bot to View Logs
              </h3>
              <p className="text-muted-foreground">
                Choose a bot from the dropdown above to view its logs and debugging information.
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
