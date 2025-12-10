'use client';

import { ArrowLeft, Lock, Eye, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IsolationModeBarProps {
  groupName: string;
  onExit: () => void;
  childCount: number;
}

export const IsolationModeBar = ({
  groupName,
  onExit,
  childCount,
}: IsolationModeBarProps) => {
  return (
    <div className="bg-primary/10 border-b-2 border-primary px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit Isolation
        </Button>

        <div className="w-px h-6 bg-border-primary" />

        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <div>
            <div className="text-sm font-semibold">Editing: {groupName}</div>
            <div className="text-xs text-text-secondary">{childCount} layers inside</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <Lock className="h-3.5 w-3.5" />
        <span>Other layers are locked</span>
      </div>
    </div>
  );
};
