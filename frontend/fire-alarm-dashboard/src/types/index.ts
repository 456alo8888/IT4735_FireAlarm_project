export type DeviceStatus = 'Alarm' | 'Warning' | 'Normal';
export type BellStatus = 'Active' | 'Silent';
export type RelayStatus = 'Open' | 'Closed';
export type ActivityType = 'Alarm' | 'Command' | 'Warning' | 'Status' | 'Info';

export interface Device {
  readonly id: string;
  readonly name: string;
  status: DeviceStatus;
  // Sensor readings
  readonly indexValue1: string; // e.g., Smoke level percentage
  readonly indexValue2: string; // e.g., Temperature reading
  // Control device status
  bellStatus: BellStatus;
  relayStatus: RelayStatus;
  readonly location: string;
}

export interface Activity {
  readonly id: string;
  readonly type: ActivityType;
  readonly device: string;
  readonly description: string;
  readonly time: string;
  readonly icon: string;
  readonly color: string;
  readonly timestamp: Date;
}

export interface DeviceStats {
  readonly total: number;
  readonly normal: number;
  readonly warning: number;
  readonly alarm: number;
}

export interface AppState {
  readonly devices: readonly Device[];
  readonly activities: readonly Activity[];
  readonly stats: DeviceStats;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export interface DeviceContextType {
  readonly devices: readonly Device[];
  readonly stats: DeviceStats;
  readonly isLoading: boolean;
  readonly error: string | null;
  addDevice: (device: Device) => void;
  updateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  updateBellStatus: (deviceId: string, isActive: boolean) => void;
  updateRelayStatus: (deviceId: string, isOpen: boolean) => void;
  refreshDevices: () => Promise<void>;
}

export interface ActivityContextType {
  readonly activities: readonly Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
}

