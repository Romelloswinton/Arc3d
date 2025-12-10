'use client';

import { ToolsPalette } from './ToolsPalette';
import { UnifiedControls } from './UnifiedControls';
import type { ToolType, SaveStatus, Collaborator } from '@/lib/types/canvas';

interface GlobalToolsBarProps {
  // Tools
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;

  // Project
  projectName: string;
  saveStatus: SaveStatus;
  onProjectNameChange: (name: string) => void;
  onSave: () => void;

  // Zoom
  zoom: number;
  onZoomChange: (zoom: number) => void;

  // Collaboration
  collaborators: Collaborator[];
  isLocked: boolean;
  onLockToggle: () => void;
}

export const GlobalToolsBar = ({
  activeTool,
  onToolChange,
  projectName,
  saveStatus,
  onProjectNameChange,
  onSave,
  zoom,
  onZoomChange,
  collaborators,
  isLocked,
  onLockToggle,
}: GlobalToolsBarProps) => {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 pointer-events-auto">
      {/* Tools Palette */}
      <ToolsPalette activeTool={activeTool} onToolChange={onToolChange} />

      {/* Unified Project & Collaboration Controls */}
      <UnifiedControls
        projectName={projectName}
        saveStatus={saveStatus}
        zoom={zoom}
        onProjectNameChange={onProjectNameChange}
        onSave={onSave}
        onZoomChange={onZoomChange}
        collaborators={collaborators}
        isLocked={isLocked}
        onLockToggle={onLockToggle}
      />
    </div>
  );
};
