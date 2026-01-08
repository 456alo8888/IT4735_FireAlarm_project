import React, { useCallback } from 'react';
import { useActivities } from '../contexts/ActivityContext';
import { Activity } from '../types';

const ActivityLog: React.FC = () => {
  const { activities } = useActivities();

  const getActivityAriaLabel = useCallback((activity: Activity): string => {
    return `${activity.type}: ${activity.device} - ${activity.description} (${activity.time})`;
  }, []);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-3">Activity Log</h2>
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 flex-grow overflow-y-auto max-h-96 custom-scrollbar">
        <div className="flex flex-col gap-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 p-2 rounded-md hover:bg-gray-800 transition-colors"
              aria-label={getActivityAriaLabel(activity)}
            >
              <span
                className={`material-symbols-outlined mt-1 ${activity.color} flex-shrink-0`}
                aria-hidden="true"
              >
                {activity.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {`${activity.type.toUpperCase()}: ${activity.device}`}
                </p>
                <p className="text-gray-400 text-xs">
                  {`${activity.description} (${activity.time})`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;