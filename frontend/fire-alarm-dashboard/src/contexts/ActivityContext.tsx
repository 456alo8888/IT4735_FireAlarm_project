import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Activity, ActivityContextType } from '../types';

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

interface ActivityProviderProps {
  children: ReactNode;
}

const initialActivities: Activity[] = [
  { id: '1', type: 'Alarm', device: 'FA-101', description: 'Smoke detected in Lobby.', time: '1 min ago', icon: 'error', color: 'text-red-500', timestamp: new Date(Date.now() - 60000) },
  { id: '2', type: 'Command', device: 'Bell On', description: 'Manual command sent to FA-101.', time: '1 min ago', icon: 'send', color: 'text-blue-500', timestamp: new Date(Date.now() - 60000) },
  { id: '3', type: 'Command', device: 'Relay Open', description: 'Manual command sent to main panel.', time: '2 mins ago', icon: 'send', color: 'text-blue-500', timestamp: new Date(Date.now() - 120000) },
  { id: '4', type: 'Warning', device: 'FA-102', description: 'High temperature in Corridor.', time: '5 mins ago', icon: 'warning', color: 'text-yellow-500', timestamp: new Date(Date.now() - 300000) },
  { id: '5', type: 'Status', device: 'FA-201', description: 'Device back to normal.', time: '10 mins ago', icon: 'check_circle', color: 'text-green-500', timestamp: new Date(Date.now() - 600000) },
  { id: '6', type: 'Info', device: 'System Update', description: 'Firmware v2.1.0 installed.', time: '12 mins ago', icon: 'info', color: 'text-gray-400', timestamp: new Date(Date.now() - 720000) },
  { id: '7', type: 'Command', device: 'Bell Off', description: 'Manual command sent to FA-101.', time: '20 mins ago', icon: 'send', color: 'text-blue-500', timestamp: new Date(Date.now() - 1200000) },
  { id: '8', type: 'Warning', device: 'FA-202', description: 'Communication lost with device.', time: '35 mins ago', icon: 'warning', color: 'text-yellow-500', timestamp: new Date(Date.now() - 2100000) },
  { id: '9', type: 'Status', device: 'Normal', description: 'System check complete.', time: '1 hour ago', icon: 'check_circle', color: 'text-green-500', timestamp: new Date(Date.now() - 3600000) },
];

const getTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

export const ActivityProvider: React.FC<ActivityProviderProps> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>): void => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date(),
      time: 'Just now',
    };

    setActivities(prev => [newActivity, ...prev].slice(0, 50)); // Keep only last 50 activities
  }, []);

  const clearActivities = useCallback((): void => {
    setActivities([]);
  }, []);

  // Update time ago strings every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => 
        prev.map(activity => ({
          ...activity,
          time: getTimeAgo(activity.timestamp),
        }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const value: ActivityContextType = {
    activities,
    addActivity,
    clearActivities,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivities = (): ActivityContextType => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
};