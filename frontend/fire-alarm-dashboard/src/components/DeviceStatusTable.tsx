import React, { useCallback } from 'react';
import { useDevices } from '../contexts/DeviceContext';
import { DeviceStatus } from '../types';

// Extract styles outside component to prevent recreation
const TABLE_STYLES = {
  header: 'px-3 py-3 text-left text-gray-400 text-sm font-medium leading-normal',
  cell: 'px-3 py-3 text-gray-300 text-sm font-normal',
  rowHover: 'border-t border-t-gray-800 hover:bg-gray-800/50',
  status: {
    common: 'flex items-center justify-center text-sm font-medium rounded-full h-7 px-3',
    variants: {
      Alarm: 'bg-red-500/20 text-red-400',
      Warning: 'bg-yellow-500/20 text-yellow-400',
      Normal: 'bg-green-500/20 text-green-400',
      default: 'bg-gray-700 text-gray-300'
    } as const
  }
} as const;

const DeviceStatusTable: React.FC = () => {
  const { devices } = useDevices();

  const getStatusClass = useCallback((status: DeviceStatus): string => {
    return `${TABLE_STYLES.status.common} ${TABLE_STYLES.status.variants[status] || TABLE_STYLES.status.variants.default}`;
  }, []);

  // Extract map links outside component to prevent recreation
const DEVICE_MAP_LINKS: Record<string, string> = {
  'FA-101': 'https://maps.app.goo.gl/U9KpALUhD6HZynzA6',
  'FA-102': 'https://maps.app.goo.gl/bUmmCemAP9SCcvQs9',
} as const;

const getDeviceMapLink = useCallback((deviceId: string): string => {
  return DEVICE_MAP_LINKS[deviceId] || '#';
}, []);

  const handleLocationClick = useCallback((deviceId: string) => {
    const mapLink = getDeviceMapLink(deviceId);
    window.open(mapLink, '_blank', 'noopener,noreferrer');
  }, [getDeviceMapLink]);


  return (
    <div className="flex flex-col">
      <div className="pb-3">
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Device Status</h2>
      </div>
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5">
              <th className={`${TABLE_STYLES.header} w-20`}>ID</th>
              <th className={`${TABLE_STYLES.header} w-32`}>Name</th>
              <th className={`${TABLE_STYLES.header} w-24`}>Status</th>
              <th className={`${TABLE_STYLES.header} w-28`}>Flame Value</th>
              <th className={`${TABLE_STYLES.header} w-28`}>Gas Value</th>
              <th className={`${TABLE_STYLES.header} w-28`}>Bell Status</th>
              <th className={`${TABLE_STYLES.header} w-28`}>Relay Status</th>
              <th className={`${TABLE_STYLES.header} w-24`}>Location</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id} className={TABLE_STYLES.rowHover}>
                <td className={TABLE_STYLES.cell}>{device.id}</td>
                <td className={TABLE_STYLES.cell}>{device.name}</td>
                <td className={`${TABLE_STYLES.cell} py-3`}>
                  <span className={getStatusClass(device.status)}>
                    {device.status}
                  </span>
                </td>
                <td className={TABLE_STYLES.cell}>{device.indexValue1}</td>
                <td className={TABLE_STYLES.cell}>{device.indexValue2}</td>
                <td className={TABLE_STYLES.cell}>{device.bellStatus}</td>
                <td className={TABLE_STYLES.cell}>{device.relayStatus}</td>
                <td className="px-3 py-3 text-indigo-400 text-sm font-medium tracking-[0.015em]">
                  <button
                    onClick={() => handleLocationClick(device.id)}
                    className="text-inherit hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    aria-label={`View location for ${device.name}`}
                  >
                    {device.location}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceStatusTable;