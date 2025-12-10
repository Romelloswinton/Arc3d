'use client';

import { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text as KonvaText } from 'react-konva';
import { Palette } from 'lucide-react';
import { SelectionIndicator } from './SelectionIndicator';
import type { Shape } from '@/lib/types/canvas';
import type { Layer as LayerType, BlendMode } from '@/lib/types/layers';

// Map blend modes to Konva's globalCompositeOperation
const getCompositeOperation = (blendMode: BlendMode): GlobalCompositeOperation => {
  const blendModeMap: Record<BlendMode, GlobalCompositeOperation> = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'darken': 'darken',
    'lighten': 'lighten',
    'color-dodge': 'color-dodge',
    'color-burn': 'color-burn',
    'hard-light': 'hard-light',
    'soft-light': 'soft-light',
    'difference': 'difference',
    'exclusion': 'exclusion',
  };
  return blendModeMap[blendMode] || 'source-over';
};

interface CanvasWorkspaceProps {
  shapes: Shape[];
  selectedId: string | null;
  onShapeSelect: (id: string | null) => void;
  onShapeDragEnd: (id: string, x: number, y: number) => void;
  zoom: number;
  layers: LayerType[];
}

type SelectionMode = 'default' | 'drill-down' | 'isolated';

export const CanvasWorkspace = ({
  shapes,
  selectedId,
  onShapeSelect,
  onShapeDragEnd,
  zoom,
  layers,
}: CanvasWorkspaceProps) => {
  const canvasWidth = (1920 / 2) * (zoom / 100);
  const canvasHeight = (1080 / 2) * (zoom / 100);

  // Helper to find layer for a shape
  const findLayerById = (id: string): LayerType | null => {
    const findInLayers = (layerList: LayerType[]): LayerType | null => {
      for (const layer of layerList) {
        if (layer.id === id) return layer;
        if (layer.children) {
          const found = findInLayers(layer.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInLayers(layers);
  };

  const [selectionMode, setSelectionMode] = useState<SelectionMode>('default');
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [modifierKeyPressed, setModifierKeyPressed] = useState(false);

  // Track modifier keys (Ctrl/Cmd)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setModifierKeyPressed(true);
        setSelectionMode('drill-down');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setModifierKeyPressed(false);
        setSelectionMode('default');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle click behavior (single vs double click)
  const handleShapeClick = (id: string) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    // Double-click detection (within 300ms)
    if (timeSinceLastClick < 300) {
      setClickCount(2);
      // TODO: Implement drill-down logic
      console.log('Double-click detected - drill down into:', id);
    } else {
      setClickCount(1);
      // Rule 3.1: Default - select top level (or current shape if modifier pressed)
      if (modifierKeyPressed) {
        console.log('Modifier + click - drill down to:', id);
      } else {
        console.log('Single click - select top level:', id);
      }
      onShapeSelect(id);
    }

    setLastClickTime(now);

    // Reset click count after delay
    setTimeout(() => setClickCount(0), 400);
  };

  return (
    <main className="flex-1 flex flex-col bg-background p-8">
      {/* Selection Mode Indicator */}
      <div className="absolute top-24 left-8 z-30">
        <SelectionIndicator
          mode={selectionMode}
          hint={
            modifierKeyPressed
              ? 'Click to select nested layers'
              : clickCount === 2
              ? 'Double-click to drill into groups'
              : undefined
          }
        />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
        {/* Canvas Container */}
        <div
          className="border-2 border-border-primary rounded-lg overflow-hidden bg-[#0e0e10] shadow-2xl relative"
          style={{
            width: canvasWidth,
            height: canvasHeight,
          }}
        >
          <Stage
            width={canvasWidth}
            height={canvasHeight}
            scaleX={zoom / 100}
            scaleY={zoom / 100}
            onClick={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) {
                onShapeSelect(null);
              }
            }}
          >
            <Layer>
              {shapes.map((shape) => {
                const layer = findLayerById(shape.id);
                const isSelected = shape.id === selectedId;

                // Don't render if layer is hidden
                if (layer && !layer.visible) return null;

                // Calculate opacity from layer
                const opacity = layer ? layer.opacity / 100 : 1;

                // Check if draggable (not locked)
                const draggable = layer ? !layer.locked : true;

                // Get blend mode from layer
                const blendMode = layer?.blendMode || 'normal';
                const compositeOperation = getCompositeOperation(blendMode);

                const commonProps = {
                  key: shape.id,
                  x: layer?.x ?? shape.x,
                  y: layer?.y ?? shape.y,
                  draggable,
                  fill: shape.fill,
                  opacity,
                  globalCompositeOperation: compositeOperation,
                  stroke: isSelected ? '#00f593' : undefined,
                  strokeWidth: isSelected ? 2 : 0,
                  onClick: () => handleShapeClick(shape.id),
                  onDragEnd: (e: any) => {
                    onShapeDragEnd(shape.id, e.target.x(), e.target.y());
                  },
                  // Visual feedback for locked layers
                  shadowEnabled: layer?.locked,
                  shadowColor: 'red',
                  shadowBlur: layer?.locked ? 5 : 0,
                  shadowOpacity: layer?.locked ? 0.3 : 0,
                };

                if (shape.type === 'rect') {
                  return (
                    <Rect
                      {...commonProps}
                      width={shape.width}
                      height={shape.height}
                    />
                  );
                } else if (shape.type === 'circle') {
                  return <Circle {...commonProps} radius={shape.radius} />;
                } else if (shape.type === 'text') {
                  return (
                    <KonvaText
                      {...commonProps}
                      text={shape.text}
                      fontSize={24}
                      fontFamily="Arial"
                      width={shape.width}
                    />
                  );
                }
                return null;
              })}
            </Layer>
          </Stage>

          {/* Empty State */}
          {shapes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-text-secondary">
                <Palette className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-base font-medium">Canvas is empty</p>
                <p className="text-xs mt-1">Use the tools above to add elements</p>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-4 px-4 py-2 bg-card border border-border-primary rounded-lg text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-card-hover rounded border border-border-primary font-mono">
              Click
            </kbd>
            <span>Select top-level</span>
          </div>
          <div className="w-px h-4 bg-border-primary" />
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-card-hover rounded border border-border-primary font-mono">
              Ctrl/⌘ + Click
            </kbd>
            <span>Drill down</span>
          </div>
          <div className="w-px h-4 bg-border-primary" />
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-card-hover rounded border border-border-primary font-mono">
              Double-click
            </kbd>
            <span>Enter group</span>
          </div>
        </div>
      </div>
    </main>
  );
};
