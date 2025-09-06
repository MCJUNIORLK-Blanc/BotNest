import { Bot, CircleDot, MemoryStick, Cpu } from "lucide-react";
import { useSystemStats } from "@/hooks/use-system-stats";
import { useQuery } from "@tanstack/react-query";
import type { Bot as BotType } from "@shared/schema";

export default function StatsCards() {
  const { stats } = useSystemStats();
  
  const { data: bots = [] } = useQuery<BotType[]>({
    queryKey: ["/api/bots"],
  });

  const totalBots = bots.length;
  const onlineBots = bots.filter(bot => bot.status === "online").length;
  const memoryUsage = (stats && 'memoryUsage' in stats) ? `${(stats.memoryUsage / 1024).toFixed(1)}GB` : "0GB";
  const cpuUsage = (stats && 'cpuUsage' in stats) ? `${stats.cpuUsage}%` : "0%";

  const statsData = [
    {
      title: "Total Bots",
      value: totalBots.toString(),
      icon: Bot,
      color: "text-primary",
      bgColor: "bg-primary/20"
    },
    {
      title: "Online Bots", 
      value: onlineBots.toString(),
      icon: CircleDot,
      color: "text-accent pulse-animation",
      bgColor: "bg-accent/20"
    },
    {
      title: "Memory Usage",
      value: memoryUsage,
      icon: MemoryStick,
      color: "text-secondary",
      bgColor: "bg-secondary/20"
    },
    {
      title: "CPU Usage",
      value: cpuUsage,
      icon: Cpu,
      color: "text-orange-400",
      bgColor: "bg-orange-400/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <div 
          key={stat.title}
          className="card-gradient p-6 rounded-lg border border-border"
          data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{stat.title}</p>
              <p className="text-3xl font-bold text-foreground" data-testid={`stat-value-${stat.title.toLowerCase().replace(' ', '-')}`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`${stat.color} text-xl`} size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
