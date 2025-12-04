import React from 'react';
import SummaryCard from './components/SummaryCard';
import DeviceStatusTable from './components/DeviceStatusTable';
import CommandPanel from './components/CommandPanel';
import ActivityLog from './components/ActivityLog';
import { useDevices } from './contexts/DeviceContext';

const App: React.FC = () => {
  const { stats } = useDevices();

  return (
    <div className="bg-background-dark min-h-screen font-display text-gray-200">
      <main className="w-full overflow-y-auto p-6 lg:p-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Fire Alarm System</p>
            </div>
          </div>
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <SummaryCard icon="router" title="Total Devices" value={stats.total.toString()} color="gray" />
              <SummaryCard icon="check_circle" title="Normal" value={stats.normal.toString()} color="green" />
              <SummaryCard icon="warning" title="Warning" value={stats.warning.toString()} color="yellow" />
              <SummaryCard icon="error" title="Alarm" value={stats.alarm.toString()} color="red" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8 flex flex-col gap-6">
                <DeviceStatusTable />
                <CommandPanel />
              </div>
              <div className="xl:col-span-4 flex flex-col gap-6">
                <ActivityLog />
              </div>
            </div>
          </>
        </div>
      </main>
    </div>
  );
};

export default App;