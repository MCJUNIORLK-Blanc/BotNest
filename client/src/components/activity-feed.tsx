import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect, useState } from "react";
import { Play, Upload, AlertTriangle, Square, RotateCcw, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Activity } from "@shared/schema";

export default function ActivityFeed() {
  const { subscribe } = useWebSocket();
  const [liveActivities, setLiveActivities] = useState<Activity[]>([]);

  const { data: initialActivities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  useEffect(() => {
    const unsubscribe = subscribe("activity_created", (activity: Activity) => {
      setLiveActivities(prev => [activity, ...prev.slice(0, 9)]);
    });

    return unsubscribe;
  }, [subscribe]);

  const activities = [...liveActivities, ...initialActivities]
    .slice(0, 10)
    .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "bot_start":
        return { icon: Play, color: "text-accent bg-accent/20" };
      case "bot_stop":
        return { icon: Square, color: "text-destructive bg-destructive/20" };
      case "bot_restart":
        return { icon: RotateCcw, color: "text-secondary bg-secondary/20" };
      case "bot_crash":
        return { icon: AlertTriangle, color: "text-orange-400 bg-orange-400/20" };
      case "file_upload":
        return { icon: Upload, color: "text-secondary bg-secondary/20" };
      case "config_update":
        return { icon: Settings, color: "text-primary bg-primary/20" };
      default:
        return { icon: AlertTriangle, color: "text-muted-foreground bg-muted/20" };
    }
  };

  return (
    <div className="card-gradient rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
      </div>
      <div className="p-6 space-y-4">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => {
            const iconInfo = getActivityIcon(activity.type);
            return (
              <div 
                key={activity.id} 
                className="flex items-center space-x-3"
                data-testid={`activity-${activity.id}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconInfo.color}`}>
                  <iconInfo.icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground" data-testid={`activity-message-${activity.id}`}>
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`activity-timestamp-${activity.id}`}>
                    {formatDistanceToNow(new Date(activity.timestamp!), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
