import { useEffect, useRef } from "react";
import { websocketManager } from "@/lib/websocket";

export function useWebSocket() {
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!isConnectedRef.current) {
      websocketManager.connect();
      isConnectedRef.current = true;
    }

    return () => {
      // Don't disconnect on unmount to keep connection alive for other components
    };
  }, []);

  const subscribe = (type: string, callback: (data: any) => void) => {
    return websocketManager.on(type, callback);
  };

  return { subscribe };
}
