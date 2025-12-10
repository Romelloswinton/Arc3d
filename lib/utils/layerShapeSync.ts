import type { Layer } from '@/lib/types/layers';
import type { Shape, ShapeType } from '@/lib/types/canvas';

/**
 * Utilities to sync layers with canvas shapes
 * Ensures layers panel controls affect canvas rendering
 */

/**
 * Convert a Shape to a Layer representation
 */
export function shapeToLayer(shape: Shape): Layer {
  return {
    id: shape.id,
    name: `${shape.type.charAt(0).toUpperCase() + shape.type.slice(1)} ${shape.id.slice(-4)}`,
    type: shape.type === 'rect' || shape.type === 'circle' ? 'shape' : 'text',
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    x: shape.x,
    y: shape.y,
  };
}

/**
 * Apply layer properties to shape for rendering
 */
export function applyLayerToShape(shape: Shape, layer: Layer | null): Shape {
  if (!layer) return shape;

  return {
    ...shape,
    x: layer.x ?? shape.x,
    y: layer.y ?? shape.y,
    // Store layer properties for rendering
    _layerVisible: layer.visible,
    _layerLocked: layer.locked,
    _layerOpacity: layer.opacity / 100,
    _layerBlendMode: layer.blendMode,
  } as any; // Extended with layer metadata
}

/**
 * Find layer by shape ID
 */
export function findLayerByShapeId(
  layers: Layer[],
  shapeId: string
): Layer | null {
  for (const layer of layers) {
    if (layer.id === shapeId) return layer;
    if (layer.children) {
      const found = findLayerByShapeId(layer.children, shapeId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Update layer position from shape drag
 */
export function updateLayerPosition(
  layers: Layer[],
  layerId: string,
  x: number,
  y: number
): Layer[] {
  return layers.map((layer) => {
    if (layer.id === layerId) {
      return { ...layer, x, y };
    }
    if (layer.children) {
      return {
        ...layer,
        children: updateLayerPosition(layer.children, layerId, x, y),
      };
    }
    return layer;
  });
}

/**
 * Check if a shape should be rendered based on layer visibility
 */
export function shouldRenderShape(layer: Layer | null): boolean {
  if (!layer) return true;

  // Check if layer or any parent is hidden
  return layer.visible;
}

/**
 * Check if a shape should be draggable based on layer lock
 */
export function isShapeDraggable(layer: Layer | null): boolean {
  if (!layer) return true;

  // Locked layers can't be dragged
  return !layer.locked;
}

/**
 * Get composite opacity including parent layers
 */
export function getCompositeOpacity(
  layers: Layer[],
  layerId: string
): number {
  const layer = findLayerByShapeId(layers, layerId);
  if (!layer) return 1;

  // For now, just return layer's own opacity
  // In full implementation, would multiply with parent opacities
  return layer.opacity / 100;
}

/**
 * Sync layers array when shapes change
 * Creates layers for new shapes, removes layers for deleted shapes
 */
export function syncLayersWithShapes(
  layers: Layer[],
  shapes: Shape[]
): Layer[] {
  const shapeIds = new Set(shapes.map((s) => s.id));
  const layerIds = new Set(layers.map((l) => l.id));

  // Remove layers for deleted shapes
  const filteredLayers = layers.filter((layer) => shapeIds.has(layer.id));

  // Add layers for new shapes
  const newLayers = shapes
    .filter((shape) => !layerIds.has(shape.id))
    .map((shape) => shapeToLayer(shape));

  return [...filteredLayers, ...newLayers];
}
