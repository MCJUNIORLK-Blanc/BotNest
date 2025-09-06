import { useSystemStats } from "@/hooks/use-system-stats";

export default function SystemHealth() {
  const { stats, isLoading } = useSystemStats();

  if (isLoading || !stats) {
    return (
      <div className="card-gradient rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-xl font-bold text-foreground">System Health</h3>
        </div>
        <div className="p-6">
          <p className="text-muted-foreground">Loading system stats...</p>
        </div>
      </div>
    );
  }

  const cpuPercentage = stats.cpuUsage;
  const memoryPercentage = Math.round((stats.memoryUsage / stats.memoryTotal) * 100);
  const diskPercentage = Math.round((stats.diskUsage / stats.diskTotal) * 100);
  const networkUsage = stats.networkIn + stats.networkOut;

  const metrics = [
    {
      name: "CPU Usage",
      value: `${cpuPercentage}%`,
      percentage: cpuPercentage,
      barClass: "progress-bar-cpu"
    },
    {
      name: "Memory Usage", 
      value: `${(stats.memoryUsage / 1024).toFixed(1)}GB / ${(stats.memoryTotal / 1024).toFixed(1)}GB`,
      percentage: memoryPercentage,
      barClass: "progress-bar-memory"
    },
    {
      name: "Disk Usage",
      value: `${(stats.diskUsage / 1024).toFixed(1)}GB / ${(stats.diskTotal / 1024).toFixed(1)}GB`,
      percentage: diskPercentage,
      barClass: "progress-bar-disk"
    },
    {
      name: "Network I/O",
      value: `↑ ${stats.networkOut}KB/s ↓ ${stats.networkIn}KB/s`,
      percentage: Math.min(networkUsage * 2, 100), // Arbitrary scaling for visualization
      barClass: "progress-bar-network"
    }
  ];

  return (
    <div className="card-gradient rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-xl font-bold text-foreground">System Health</h3>
      </div>
      <div className="p-6 space-y-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{metric.name}</span>
              <span 
                className="text-foreground font-medium"
                data-testid={`system-${metric.name.toLowerCase().replace(' ', '-')}`}
              >
                {metric.value}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className={metric.barClass}
                style={{ width: `${metric.percentage}%` }}
                data-testid={`system-bar-${metric.name.toLowerCase().replace(' ', '-')}`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
