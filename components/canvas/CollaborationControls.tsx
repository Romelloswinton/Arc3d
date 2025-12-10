'use client';

import { Users, Lock, Unlock } from 'lucide-react';
import type { Collaborator } from '@/lib/types/canvas';

interface CollaborationControlsProps {
  collaborators: Collaborator[];
  isLocked: boolean;
  onLockToggle: () => void;
}

export const CollaborationControls = ({
  collaborators,
  isLocked,
  onLockToggle,
}: CollaborationControlsProps) => {
  return (
    <div className="bg-card/95 backdrop-blur-md border border-border-primary rounded-xl shadow-2xl px-3 py-2 flex items-center gap-3">
      {/* Collaborator Avatars */}
      <div className="flex -space-x-1.5">
        {collaborators.slice(0, 3).map((collab) => (
          <div
            key={collab.id}
            className="h-7 w-7 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-semibold transition-transform hover:scale-110 cursor-pointer"
            style={{ backgroundColor: collab.color }}
            title={collab.name}
          >
            {collab.avatar}
          </div>
        ))}
      </div>

      {/* Share Button */}
      <button
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card-hover hover:bg-border-primary transition-all flex items-center gap-1.5"
      >
        <Users className="h-3.5 w-3.5" />
        Share
      </button>

      {/* Lock/Unlock Toggle */}
      <button
        onClick={onLockToggle}
        className={`p-1.5 rounded-lg transition-all ${
          isLocked ? 'bg-primary text-white' : 'text-text-secondary hover:bg-card-hover'
        }`}
        title={isLocked ? 'Unlock editing' : 'Lock from editing'}
      >
        {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
      </button>
    </div>
  );
};
