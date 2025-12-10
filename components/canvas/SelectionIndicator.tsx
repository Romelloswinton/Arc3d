'use client';

import { Info } from 'lucide-react';

interface SelectionIndicatorProps {
  mode: 'default' | 'drill-down' | 'isolated';
  hint?: string;
}

export const SelectionIndicator = ({ mode, hint }: SelectionIndicatorProps) => {
  const getModeConfig = () => {
    switch (mode) {
      case 'drill-down':
        return {
          bg: 'bg-info/10',
          border: 'border-info',
          text: 'text-info',
          label: 'Drill-Down Mode',
          description: hint || 'Hold Ctrl/Cmd to select nested layers',
        };
      case 'isolated':
        return {
          bg: 'bg-primary/10',
          border: 'border-primary',
          text: 'text-primary',
          label: 'Isolation Mode',
          description: hint || 'Editing inside group - other layers hidden',
        };
      default:
        return {
          bg: 'bg-card',
          border: 'border-border-primary',
          text: 'text-text-secondary',
          label: 'Normal Mode',
          description: hint || 'Click selects top-level layer',
        };
    }
  };

  const config = getModeConfig();

  if (mode === 'default') return null; // Don't show indicator for normal mode

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-lg px-3 py-2 flex items-start gap-2 shadow-lg max-w-xs`}
    >
      <Info className={`h-4 w-4 ${config.text} flex-shrink-0 mt-0.5`} />
      <div>
        <div className={`text-xs font-semibold ${config.text}`}>
          {config.label}
        </div>
        <div className="text-xs text-text-secondary mt-0.5">
          {config.description}
        </div>
      </div>
    </div>
  );
};
