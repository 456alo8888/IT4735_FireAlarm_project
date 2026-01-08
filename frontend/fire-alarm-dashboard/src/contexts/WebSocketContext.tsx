// src/contexts/WebSocketContext.tsx
import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface WebSocketContextValue {
  latestData: any;
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [latestData, setLatestData] = useState<any>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onopen = () => console.log("✔ WebSocket connected");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Realtime:", data);
        setLatestData(data);
      } catch (e) {
        console.error("Invalid WS message", e);
      }
    };

    ws.onclose = () => console.log("✖ WebSocket closed");

    return () => ws.close();
  }, []);

  return (
    <WebSocketContext.Provider value={{ latestData }}>
      {children}
    </WebSocketContext.Provider>
  );
};
