// src/contexts/WebSocketContext.tsx
import React, { createContext, useEffect, useState } from "react";

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [latestData, setLatestData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

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
