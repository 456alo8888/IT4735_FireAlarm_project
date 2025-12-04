import React, { useState, useCallback, useMemo } from 'react';
import { useDevices } from '../contexts/DeviceContext';
import { useActivities } from '../contexts/ActivityContext';

const CommandPanel: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { devices, updateBellStatus, updateRelayStatus } = useDevices();
  const { addActivity } = useActivities();

  // Memoize device lookup to prevent repeated array operations
  const currentDevice = useMemo(() =>
    devices.find(d => d.id === selectedDevice),
    [devices, selectedDevice]
  );

  const handleBellToggle = useCallback(async () => {
    if (!selectedDevice) {
      alert('Please select a device first');
      return;
    }

    setIsLoading(true);
    const isCurrentlyActive = currentDevice?.bellStatus === 'Active';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateBellStatus(selectedDevice, !isCurrentlyActive);

      if (isCurrentlyActive) {
        addActivity({
          type: 'Command',
          device: 'Bell Off',
          description: `Manual command sent to ${selectedDevice}.`,
          time: 'Just now',
          icon: 'notifications_off',
          color: 'text-blue-500'
        });
      } else {
        addActivity({
          type: 'Command',
          device: 'Bell On',
          description: `Manual command sent to ${selectedDevice}.`,
          time: 'Just now',
          icon: 'notifications_active',
          color: 'text-blue-500'
        });
      }
    } catch (error) {
      console.error('Error toggling bell:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDevice, updateBellStatus, addActivity]);

  const handleRelayToggle = useCallback(async () => {
    if (!selectedDevice) {
      alert('Please select a device first');
      return;
    }

    setIsLoading(true);
    const isCurrentlyOpen = currentDevice?.relayStatus === 'Open';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateRelayStatus(selectedDevice, !isCurrentlyOpen);

      if (isCurrentlyOpen) {
        addActivity({
          type: 'Command',
          device: 'Relay Close',
          description: `Manual command sent to main panel.`,
          time: 'Just now',
          icon: 'door_back',
          color: 'text-orange-500'
        });
      } else {
        addActivity({
          type: "Command",
          device: 'Relay Open',
          description: `Manual command sent to main panel.`,
          time: 'Just now',
          icon: 'door_open',
          color: 'text-orange-500'
        });
      }
    } catch (error) {
      console.error('Error toggling relay:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDevice, updateRelayStatus, addActivity]);

  // Extract button config outside component to prevent recreation
const BUTTON_CONFIG = {
  bell: {
    active: 'bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed',
    inactive: 'bg-primary text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
  },
  relay: {
    active: 'bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed',
    inactive: 'bg-primary text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
  }
} as const;

const getButtonClass = (commandType: 'bell' | 'relay', isActive: boolean): string => {
  return BUTTON_CONFIG[commandType][isActive ? 'active' : 'inactive'];
};

  return (
    <div className="flex flex-col">
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-3">Command Panel</h2>
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-7 flex flex-col gap-2">
            <label className="text-gray-400 text-sm font-medium" htmlFor="device-select">
              Select Device
            </label>
            <select
              className="w-full rounded-md border-gray-600 bg-gray-700 text-white focus:ring-primary focus:border-primary focus:outline-none focus:ring-2"
              id="device-select"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              aria-label="Select device for command"
            >
              <option value="">Choose a device...</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {`${device.id} - ${device.name}`}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-5 flex items-center gap-3">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${getButtonClass('bell', currentDevice?.bellStatus === 'Active')}`}
              onClick={handleBellToggle}
              disabled={isLoading || !selectedDevice}
              aria-label={currentDevice?.bellStatus === 'Active' ? 'Turn bell off' : 'Turn bell on for selected device'}
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">notifications_active</span>
              <span>{isLoading ? 'Processing...' : (currentDevice?.bellStatus === 'Active' ? 'Bell Off' : 'Bell On')}</span>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${getButtonClass('relay', currentDevice?.relayStatus === 'Open')}`}
              onClick={handleRelayToggle}
              disabled={isLoading || !selectedDevice}
              aria-label={currentDevice?.relayStatus === 'Open' ? 'Close relay for selected device' : 'Open relay for selected device'}
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">door_open</span>
              <span>{isLoading ? 'Processing...' : (currentDevice?.relayStatus === 'Open' ? 'Close Relay' : 'Open Relay')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPanel;