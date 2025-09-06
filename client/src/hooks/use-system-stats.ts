import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "./use-websocket";
import { useEffect, useState } from "react";
import type { SystemStats } from "@shared/schema";

export function useSystemStats() {
  const { subscribe } = useWebSocket();
  const [liveStats, setLiveStats] = useState<SystemStats | null>(null);

  const { data: initialStats, isLoading } = useQuery({
    queryKey: ["/api/system/stats"],
  });

  useEffect(() => {
    const unsubscribe = subscribe("system_stats", (stats: SystemStats) => {
      setLiveStats(stats);
    });

    return unsubscribe;
  }, [subscribe]);

  const stats = liveStats || initialStats;

  return {
    stats,
    isLoading,
  };
}
