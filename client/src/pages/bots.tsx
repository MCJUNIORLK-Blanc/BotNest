import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopBar from "@/components/layout/topbar";
import BotCard from "@/components/bot-card";
import CreateBotModal from "@/components/create-bot-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import type { Bot } from "@shared/schema";

export default function Bots() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");

  const { data: bots = [] } = useQuery<Bot[]>({
    queryKey: ["/api/bots"],
  });

  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bot.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || bot.status === statusFilter;
    const matchesLanguage = languageFilter === "all" || bot.language === languageFilter;
    
    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const onlineBots = bots.filter(bot => bot.status === "online").length;
  const offlineBots = bots.filter(bot => bot.status === "offline").length;

  return (
    <>
      <TopBar
        title="Bots"
        description={`${bots.length} total bots • ${onlineBots} online • ${offlineBots} offline`}
        onCreateBot={() => setCreateModalOpen(true)}
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="card-gradient rounded-lg border border-border">
          {/* Filters */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  type="text"
                  placeholder="Search bots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-bots-input"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]" data-testid="status-filter-select">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="starting">Starting</SelectItem>
                  <SelectItem value="stopping">Stopping</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>

              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-[140px]" data-testid="language-filter-select">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="nodejs">Node.js</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bots List */}
          <div className="p-6 space-y-4">
            {filteredBots.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  {searchQuery || statusFilter !== "all" || languageFilter !== "all" 
                    ? "No bots match your filters." 
                    : "No bots created yet."
                  }
                </p>
                {!searchQuery && statusFilter === "all" && languageFilter === "all" && (
                  <Button 
                    onClick={() => setCreateModalOpen(true)}
                    data-testid="create-first-bot-button"
                  >
                    Create Your First Bot
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBots.map((bot) => (
                  <BotCard key={bot.id} bot={bot} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <CreateBotModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
    </>
  );
}
