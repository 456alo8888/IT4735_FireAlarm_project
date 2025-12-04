import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Device, DeviceStatus, DeviceStats, DeviceContextType, BellStatus, RelayStatus } from '../types';

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

const initialDevices: Device[] = [
  {
    id: 'FA-101',
    name: 'Lobby Smoke Detector',
    status: 'Alarm',
    indexValue1: '95%',
    indexValue2: '72°C',
    bellStatus: 'Active' as BellStatus,
    relayStatus: 'Open' as RelayStatus,
    location: 'View'
  },
  {
    id: 'FA-102',
    name: 'Corridor Heat Sensor',
    status: 'Warning',
    indexValue1: '65°C',
    indexValue2: '85%',
    bellStatus: 'Silent' as BellStatus,
    relayStatus: 'Closed' as RelayStatus,
    location: 'View'
  },
] as const;

const calculateStats = (devices: Device[]): DeviceStats => {
  const stats = devices.reduce(
    (acc, device) => {
      acc.total++;
      acc[device.status.toLowerCase() as keyof Omit<DeviceStats, 'total'>]++;
      return acc;
    },
    { total: 0, normal: 0, warning: 0, alarm: 0 }
  );
  return stats;
};

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const stats: DeviceStats = calculateStats(devices);

  const refreshDevices = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would fetch from an API
      // For now, we'll just simulate random status changes
      setDevices(prevDevices =>
        prevDevices.map(device => {
          const random = Math.random();
          let newStatus: DeviceStatus = device.status;

          if (random < 0.1) {
            const statuses: DeviceStatus[] = ['Normal', 'Warning', 'Alarm'];
            newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          }

          return { ...device, status: newStatus };
        })
      );
    } catch (err) {
      setError('Failed to refresh devices');
      console.error('Error refreshing devices:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addDevice = useCallback((device: Device): void => {
    setDevices(prev => [...prev, device]);
  }, []);

  const updateDeviceStatus = useCallback((deviceId: string, status: DeviceStatus): void => {
    setDevices(prev =>
      prev.map(device =>
        device.id === deviceId ? { ...device, status } : device
      )
    );
  }, []);

  const updateBellStatus = useCallback((deviceId: string, isActive: boolean): void => {
    setDevices(prev =>
      prev.map(device =>
        device.id === deviceId
          ? { ...device, bellStatus: (isActive ? 'Active' : 'Silent') as BellStatus }
          : device
      )
    );
  }, []);

  const updateRelayStatus = useCallback((deviceId: string, isOpen: boolean): void => {
    setDevices(prev =>
      prev.map(device =>
        device.id === deviceId
          ? { ...device, relayStatus: (isOpen ? 'Open' : 'Closed') as RelayStatus }
          : device
      )
    );
  }, []);

  const value: DeviceContextType = {
    devices,
    stats,
    isLoading,
    error,
    addDevice,
    updateDeviceStatus,
    updateBellStatus,
    updateRelayStatus,
    refreshDevices,
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevices = (): DeviceContextType => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
};