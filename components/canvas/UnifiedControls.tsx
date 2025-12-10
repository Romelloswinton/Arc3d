'use client';

import { useState } from 'react';
import { Save, History, RotateCcw, Check, Clock, ZoomIn, ZoomOut, Users, Lock, Unlock } from 'lucide-react';
import type { SaveStatus, Collaborator } from '@/lib/types/canvas';

interface UnifiedControlsProps {
  projectName: string;
  saveStatus: SaveStatus;
  zoom: number;
  onProjectNameChange: (name: string) => void;
  onSave: () => void;
  onZoomChange: (zoom: number) => void;
  collaborators: Collaborator[];
  isLocked: boolean;
  onLockToggle: () => void;
}

export const UnifiedControls = ({
  projectName,
  saveStatus,
  zoom,
  onProjectNameChange,
  onSave,
  onZoomChange,
  collaborators,
  isLocked,
  onLockToggle,
}: UnifiedControlsProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  return (
    <div className="bg-card/95 backdrop-blur-md border border-border-primary rounded-xl shadow-2xl px-4 py-2 flex items-center gap-4">
      {/* Project Name & Save Status */}
      <div className="flex items-center gap-3">
        {isEditingName ? (
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
            className="bg-card border border-primary px-2 py-1 rounded text-xs font-semibold focus:outline-none w-32"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-xs font-semibold hover:text-primary transition-colors"
          >
            {projectName}
          </button>
        )}

        {/* Save Status */}
        {saveStatus === 'saved' && (
          <span className="flex items-center gap-1 text-xs text-success">
            <Check className="h-3 w-3" />
          </span>
        )}
        {saveStatus === 'saving' && (
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <Clock className="h-3 w-3 animate-spin" />
          </span>
        )}
        {saveStatus === 'unsaved' && (
          <span className="flex items-center gap-1 text-xs text-warning">
            <Clock className="h-3 w-3" />
          </span>
        )}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-border-primary" />

      {/* Version Control */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSave}
          disabled={saveStatus === 'saved'}
          className="p-2 rounded-lg text-text-secondary hover:bg-card-hover hover:text-foreground transition-all disabled:opacity-50"
          title="Save"
        >
          <Save className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="p-2 rounded-lg text-text-secondary hover:bg-card-hover hover:text-foreground transition-all"
            title="History"
          >
            <History className="h-4 w-4" />
          </button>

          {showVersionHistory && (
            <>
              {/* Backdrop to close */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowVersionHistory(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border-primary rounded-lg shadow-xl p-2 z-50">
                <div className="text-xs font-semibold mb-2 px-2">Version History</div>
                <div className="space-y-1 text-xs">
                  <div className="p-2 hover:bg-card-hover rounded cursor-pointer">
                    <div className="font-medium">Current version</div>
                    <div className="text-text-secondary text-[10px]">Just now</div>
                  </div>
                  <div className="p-2 hover:bg-card-hover rounded cursor-pointer">
                    <div className="font-medium">Auto-save #12</div>
                    <div className="text-text-secondary text-[10px]">5 minutes ago</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          className="p-2 rounded-lg text-text-secondary hover:bg-card-hover hover:text-foreground transition-all"
          title="Revert"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-border-primary" />

      {/* Zoom Control */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onZoomChange(Math.max(25, zoom - 25))}
          className="p-1.5 rounded hover:bg-card-hover transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5 text-text-secondary" />
        </button>
        <span className="text-xs font-medium text-text-secondary min-w-[3rem] text-center">
          {zoom}%
        </span>
        <button
          onClick={() => onZoomChange(Math.min(400, zoom + 25))}
          className="p-1.5 rounded hover:bg-card-hover transition-all"
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5 text-text-secondary" />
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-border-primary" />

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
