'use client';

import { Layers, Folder, Type, Image as ImageIcon, Sliders, CircleDot } from 'lucide-react';
import type { Layer } from '@/lib/types/layers';

interface LayerDragPreviewProps {
  layer: Layer;
}

export const LayerDragPreview = ({ layer }: LayerDragPreviewProps) => {
  const getLayerIcon = () => {
    switch (layer.type) {
      case 'group':
        return <Folder className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'adjustment':
        return <Sliders className="h-4 w-4 text-info" />;
      case 'mask':
        return <CircleDot className="h-4 w-4 text-text-secondary" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-card border-2 border-primary rounded-lg px-3 py-2 shadow-xl flex items-center gap-2 opacity-90">
      <div className="h-6 w-6 rounded bg-card-hover flex items-center justify-center text-text-secondary">
        {getLayerIcon()}
      </div>
      <span className="text-sm font-medium">{layer.name}</span>
      {layer.children && layer.children.length > 0 && (
        <span className="text-xs text-text-secondary ml-1">
          ({layer.children.length})
        </span>
      )}
    </div>
  );
};
