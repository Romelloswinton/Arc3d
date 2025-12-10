import type { Layer } from '@/lib/types/layers';

/**
 * Selection utilities implementing Rule 3:
 * Default selects top-level parent, modifier keys drill down
 */

export interface SelectionPath {
  layerId: string;
  depth: number;
  ancestors: string[]; // IDs from root to selected layer
}

/**
 * Find all layers at a given canvas position
 * Returns from top-most (shallowest) to deepest nested
 */
export function getLayersAtPosition(
  layers: Layer[],
  x: number,
  y: number,
  ancestors: string[] = []
): SelectionPath[] {
  const results: SelectionPath[] = [];

  for (const layer of layers) {
    // Check if position intersects with this layer
    // (This is a simplified check - real implementation would use actual bounds)
    const intersects = isPointInLayer(layer, x, y);

    if (intersects && layer.visible) {
      results.push({
        layerId: layer.id,
        depth: ancestors.length,
        ancestors: [...ancestors],
      });

      // Recursively check children
      if (layer.children && layer.children.length > 0) {
        const childResults = getLayersAtPosition(
          layer.children,
          x - (layer.x || 0),
          y - (layer.y || 0),
          [...ancestors, layer.id]
        );
        results.push(...childResults);
      }
    }
  }

  return results;
}

/**
 * Rule 3.1: Default click behavior - select top-level parent
 */
export function selectTopLevel(
  layers: Layer[],
  x: number,
  y: number
): string | null {
  const layersAtPosition = getLayersAtPosition(layers, x, y);

  if (layersAtPosition.length === 0) return null;

  // Return the shallowest (top-level) layer
  const topLevel = layersAtPosition.reduce((prev, curr) =>
    curr.depth < prev.depth ? curr : prev
  );

  return topLevel.layerId;
}

/**
 * Rule 3.2: Drill-down behavior - select next nested child
 * Used with Ctrl/Cmd + click or double-click
 */
export function drillDownSelection(
  layers: Layer[],
  x: number,
  y: number,
  currentSelection: string | null
): string | null {
  const layersAtPosition = getLayersAtPosition(layers, x, y);

  if (layersAtPosition.length === 0) return null;
  if (layersAtPosition.length === 1) return layersAtPosition[0].layerId;

  // If nothing selected, select top level
  if (!currentSelection) {
    return selectTopLevel(layers, x, y);
  }

  // Find current selection in the list
  const currentIndex = layersAtPosition.findIndex(
    (l) => l.layerId === currentSelection
  );

  // If current selection not at this position, select top level
  if (currentIndex === -1) {
    return selectTopLevel(layers, x, y);
  }

  // Select next deeper layer (drill down)
  const nextIndex = (currentIndex + 1) % layersAtPosition.length;
  return layersAtPosition[nextIndex].layerId;
}

/**
 * Get selection breadcrumb path for display
 */
export function getSelectionBreadcrumb(
  layers: Layer[],
  selectedId: string
): { id: string; name: string }[] {
  const path: { id: string; name: string }[] = [];

  function findPath(
    layers: Layer[],
    targetId: string,
    currentPath: Layer[]
  ): boolean {
    for (const layer of layers) {
      const newPath = [...currentPath, layer];

      if (layer.id === targetId) {
        path.push(...newPath.map((l) => ({ id: l.id, name: l.name })));
        return true;
      }

      if (layer.children) {
        if (findPath(layer.children, targetId, newPath)) {
          return true;
        }
      }
    }
    return false;
  }

  findPath(layers, selectedId, []);
  return path;
}

/**
 * Check if a point is within a layer's bounds
 * Simplified - real implementation would use actual geometry
 */
function isPointInLayer(layer: Layer, x: number, y: number): boolean {
  // This is a placeholder - actual implementation would check:
  // - Layer's bounding box
  // - Transform matrix
  // - Shape type (rect, circle, path, etc.)

  const layerX = layer.x || 0;
  const layerY = layer.y || 0;
  const layerWidth = 100; // Would come from layer data
  const layerHeight = 100;

  return (
    x >= layerX &&
    x <= layerX + layerWidth &&
    y >= layerY &&
    y <= layerY + layerHeight
  );
}

/**
 * Check if user is in "isolated" mode (editing inside a group)
 */
export function getIsolatedGroup(
  layers: Layer[],
  selectedId: string | null
): Layer | null {
  if (!selectedId) return null;

  function findLayer(layers: Layer[], id: string): Layer | null {
    for (const layer of layers) {
      if (layer.id === id) return layer;
      if (layer.children) {
        const found = findLayer(layer.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  const selected = findLayer(layers, selectedId);
  if (selected && (selected.type === 'group' || selected.children)) {
    return selected;
  }

  return null;
}

/**
 * Enter isolated editing mode for a group
 * Returns the layers to display (only the group's children)
 */
export function enterIsolatedMode(
  layer: Layer
): { layers: Layer[]; context: string } | null {
  if (!layer.children || layer.children.length === 0) return null;

  return {
    layers: layer.children,
    context: layer.name,
  };
}

/**
 * Check if click should select parent or drill into children
 */
export function shouldSelectParent(
  layer: Layer,
  clickCount: number,
  modifierKey: boolean
): boolean {
  // Single click without modifier = select parent
  if (clickCount === 1 && !modifierKey) return true;

  // Double click or modifier = drill down
  if (clickCount >= 2 || modifierKey) return false;

  return true;
}
