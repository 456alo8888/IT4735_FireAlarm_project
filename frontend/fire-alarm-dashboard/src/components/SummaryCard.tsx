import React from 'react';

type CardColor = 'gray' | 'green' | 'yellow' | 'red';

interface SummaryCardProps {
  icon: string;
  title: string;
  value: string;
  color: CardColor;
}

// Extract color classes outside component to prevent recreation
const COLOR_CLASSES = {
  gray: {
    bg: 'bg-gray-900',
    border: 'border-gray-800',
    iconBg: 'bg-gray-800',
    iconText: 'text-gray-400',
    titleText: 'text-gray-400',
    valueText: 'text-white',
  },
  green: {
    bg: 'bg-green-900/40',
    border: 'border-green-800',
    iconBg: 'bg-green-500/20',
    iconText: 'text-green-400',
    titleText: 'text-green-300',
    valueText: 'text-green-400',
  },
  yellow: {
    bg: 'bg-yellow-900/40',
    border: 'border-yellow-800',
    iconBg: 'bg-yellow-500/20',
    iconText: 'text-yellow-400',
    titleText: 'text-yellow-300',
    valueText: 'text-yellow-400',
  },
  red: {
    bg: 'bg-red-900/40',
    border: 'border-red-800',
    iconBg: 'bg-red-500/20',
    iconText: 'text-red-500',
    titleText: 'text-red-300',
    valueText: 'text-red-500',
  },
} as const;

const SummaryCard: React.FC<SummaryCardProps> = React.memo(({ icon, title, value, color }) => {
  const classes = COLOR_CLASSES[color] || COLOR_CLASSES.gray;

  return (
    <div className={`flex items-center gap-4 rounded-xl p-4 shadow-sm border ${classes.bg} ${classes.border}`}>
      <div className={`flex items-center justify-center size-12 rounded-lg ${classes.iconBg}`}>
        <span className={`material-symbols-outlined text-3xl ${classes.iconText}`} aria-hidden="true">{icon}</span>
      </div>
      <div className="flex flex-col">
        <p className={`text-sm font-medium leading-normal ${classes.titleText}`}>{title}</p>
        <p className={`tracking-tight text-2xl font-bold leading-tight ${classes.valueText}`}>{value}</p>
      </div>
    </div>
  );
});

SummaryCard.displayName = 'SummaryCard';

export default SummaryCard;