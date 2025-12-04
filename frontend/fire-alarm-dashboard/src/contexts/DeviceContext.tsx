import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback
} from 'react';

import {
  Device,
  DeviceStatus,
  DeviceStats,
  DeviceContextType,
  BellStatus,
  RelayStatus
} from '../types';

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

// ─────────────────────────────────────────────
// 1️⃣ Initial Device List (khởi tạo rỗng hoặc 1 device duy nhất)
// ─────────────────────────────────────────────
const initialDevices: Device[] = [
  {
    id: 'FA-101',
    name: 'ESP32 Sensor Node',
    status: 'Normal',
    indexValue1: '0',
    indexValue2: '0',
    indexState1: 0,
    indexState2: 0,
    bellStatus: 'Silent',
    relayStatus: 'Closed',
    location: 'View'
  }
];

// ─────────────────────────────────────────────
// 2️⃣ Hàm tính thống kê
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// 🔥 Hàm tính trạng thái từ flame + gas
// ─────────────────────────────────────────────
const computeStatus = (flame_state: number, gas_state: number): DeviceStatus => {
  if (flame_state === 1 && gas_state === 1) return 'Alarm';
  if (flame_state === 0 && gas_state === 1) return 'Warning';
  return 'Normal';
};

// ─────────────────────────────────────────────
// 3️⃣ Context Provider
// ─────────────────────────────────────────────
export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const stats: DeviceStats = calculateStats(devices);

  // ─────────────────────────────────────────────
  // 🔥 4️⃣ WebSocket Listener — nhận flame + gas
  // ─────────────────────────────────────────────
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        const topic = msg.topic;
        const DO_State = msg.DO_State;
        const AO_Value = msg.AO_Value;

        setDevices(prev =>
          prev.map(device => {
            if (device.id !== 'FA-101') return device;

            // ✅ Read from prev callback parameter to avoid race conditions
            const flame_state = topic === "esp32/flame_sensor"
              ? DO_State
              : device.indexState1;

            const gas_state = topic === "esp32/gas_sensor"
              ? DO_State
              : device.indexState2;

            const flame_value = topic === "esp32/flame_sensor"
              ? AO_Value
              : Number(device.indexValue1);

            const gas_value = topic === "esp32/gas_sensor"
              ? AO_Value
              : Number(device.indexValue2);

            return {
              ...device,
              indexValue1: String(flame_value),
              indexValue2: String(gas_value),
              indexState1: flame_state,
              indexState2: gas_state,
              status: computeStatus(flame_state, gas_state)
            };
          })
        );

      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    ws.onopen = () => console.log("WS connected");
    ws.onerror = () => console.log("WS error");

    return () => ws.close();
  }, []);

  // ─────────────────────────────────────────────
  // 5️⃣ Các hàm API có sẵn của bạn (giữ nguyên)
  // ─────────────────────────────────────────────
  const refreshDevices = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDevices(prev =>
        prev.map(device => {
          const statuses: DeviceStatus[] = ['Normal', 'Warning', 'Alarm'];
          return {
            ...device,
            status: statuses[Math.floor(Math.random() * 3)]
          };
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

  // ─────────────────────────────────────────────
  // 6️⃣ Export context
  // ─────────────────────────────────────────────
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

// Hook
export const useDevices = (): DeviceContextType => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
};
