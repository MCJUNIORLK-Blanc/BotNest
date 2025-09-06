import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect } from "react";
import TopBar from "@/components/layout/topbar";
import StatsCards from "@/components/stats-cards";
import BotCard from "@/components/bot-card";
import ActivityFeed from "@/components/activity-feed";
import SystemHealth from "@/components/system-health";
import CreateBotModal from "@/components/create-bot-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import type { Bot } from "@shared/schema";

export default function Dashboard() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { subscribe } = useWebSocket();

  const { data: bots = [], refetch } = useQuery<Bot[]>({
    queryKey: ["/api/bots"],
  });

  useEffect(() => {
    const unsubscribeBotUpdated = subscribe("bot_updated", () => {
      refetch();
    });

    const unsubscribeBotCreated = subscribe("bot_created", () => {
      refetch();
    });

    const unsubscribeBotDeleted = subscribe("bot_deleted", () => {
      refetch();
    });

    return () => {
      unsubscribeBotUpdated();
      unsubscribeBotCreated();
      unsubscribeBotDeleted();
    };
  }, [subscribe, refetch]);

  const filteredBots = bots.filter(bot =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <TopBar
        title="Dashboard"
        description="Manage your Discord bots"
        onCreateBot={() => setCreateModalOpen(true)}
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards />

        {/* Bots List */}
        <div className="card-gradient rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">Your Bots</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    type="text"
                    placeholder="Search bots..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="search-bots-input"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-muted text-muted-foreground hover:bg-muted/80"
                  data-testid="filter-bots-button"
                >
                  <Filter size={16} />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {filteredBots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery ? "No bots match your search." : "No bots created yet. Create your first bot to get started!"}
                </p>
              </div>
            ) : (
              filteredBots.map((bot) => (
                <BotCard key={bot.id} bot={bot} />
              ))
            )}
          </div>
        </div>

        {/* Activity and System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed />
          <SystemHealth />
        </div>
      </main>

      <CreateBotModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
    </>
  );
}
