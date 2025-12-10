'use client';

import {
  MousePointer2,
  Hand,
  Pencil,
  Image as ImageIcon,
  Layers,
  Square,
  Circle as CircleIcon,
  Type,
} from 'lucide-react';
import type { ToolType } from '@/lib/types/canvas';

interface ToolsPaletteProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
  { id: 'rect', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: CircleIcon, label: 'Circle', shortcut: 'O' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'pen', icon: Pencil, label: 'Pen', shortcut: 'P' },
  { id: 'image', icon: ImageIcon, label: 'Image', shortcut: 'I' },
];

export const ToolsPalette = ({ activeTool, onToolChange }: ToolsPaletteProps) => {
  return (
    <div className="bg-card/95 backdrop-blur-md border border-border-primary rounded-xl shadow-2xl px-2 py-2 flex items-center gap-1">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id as ToolType)}
            className={`relative group p-2 rounded-lg transition-all ${
              isActive
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-card-hover hover:text-foreground'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <Icon className="h-5 w-5" />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border-primary rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {tool.label}
              <span className="ml-2 text-text-muted">{tool.shortcut}</span>
            </div>
          </button>
        );
      })}

      {/* Separator */}
      <div className="w-px h-6 bg-border-primary mx-1" />

      {/* Layers Panel Toggle */}
      <button
        className="p-2 rounded-lg text-text-secondary hover:bg-card-hover hover:text-foreground transition-all"
        title="Layers"
      >
        <Layers className="h-5 w-5" />
      </button>
    </div>
  );
};
