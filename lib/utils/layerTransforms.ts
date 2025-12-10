import type { Layer } from '@/lib/types/layers';

/**
 * Transform inheritance utilities for layer hierarchy
 * Rule 1: Children inherit parent transformations but maintain independence
 */

export interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
}

/**
 * Calculate the absolute transform of a layer by combining parent transforms
 * This is used when rendering - children inherit parent transformations
 */
export function getAbsoluteTransform(
  layer: Layer,
  allLayers: Layer[],
  parentTransform: Transform = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 100,
  }
): Transform {
  // Combine parent transform with layer's local transform
  const absoluteTransform: Transform = {
    x: parentTransform.x + (layer.x || 0),
    y: parentTransform.y + (layer.y || 0),
    scaleX: parentTransform.scaleX * (layer.scaleX || 1),
    scaleY: parentTransform.scaleY * (layer.scaleY || 1),
    rotation: parentTransform.rotation + (layer.rotation || 0),
    opacity: (parentTransform.opacity / 100) * (layer.opacity / 100) * 100,
  };

  return absoluteTransform;
}

/**
 * Get the local transform relative to parent
 * This is what the user edits - the layer's position within its parent
 */
export function getLocalTransform(layer: Layer): Transform {
  return {
    x: layer.x || 0,
    y: layer.y || 0,
    scaleX: layer.scaleX || 1,
    scaleY: layer.scaleY || 1,
    rotation: layer.rotation || 0,
    opacity: layer.opacity,
  };
}

/**
 * Find parent layer of a given layer
 */
export function findParentLayer(
  layers: Layer[],
  childId: string,
  currentParent?: Layer
): Layer | null {
  for (const layer of layers) {
    if (layer.children) {
      for (const child of layer.children) {
        if (child.id === childId) {
          return layer;
        }
      }
      // Recursively search in nested children
      const foundParent = findParentLayer(layer.children, childId, layer);
      if (foundParent) return foundParent;
    }
  }
  return null;
}

/**
 * Get all ancestor layers (parent, grandparent, etc.)
 * Used to calculate stacking context chain
 */
export function getAncestorLayers(
  layers: Layer[],
  layerId: string
): Layer[] {
  const ancestors: Layer[] = [];
  let currentId = layerId;

  while (currentId) {
    const parent = findParentLayer(layers, currentId);
    if (parent) {
      ancestors.push(parent);
      currentId = parent.id;
    } else {
      break;
    }
  }

  return ancestors.reverse(); // Return from root to immediate parent
}

/**
 * Check if a layer creates a stacking context
 * Groups and frames create new stacking contexts
 */
export function createsStackingContext(layer: Layer): boolean {
  return layer.type === 'group' || layer.type === 'adjustment';
}

/**
 * Get the z-index within the local stacking context
 * Rule 2: Z-index is local to the parent
 */
export function getLocalZIndex(layer: Layer, siblings: Layer[]): number {
  return siblings.findIndex((l) => l.id === layer.id);
}

/**
 * Compare stacking order of two layers
 * Returns: -1 if layer1 is below layer2, 1 if above, 0 if same level
 */
export function compareStackingOrder(
  layer1: Layer,
  layer2: Layer,
  allLayers: Layer[]
): number {
  const ancestors1 = getAncestorLayers(allLayers, layer1.id);
  const ancestors2 = getAncestorLayers(allLayers, layer2.id);

  // Find common ancestor (the stacking context boundary)
  let commonAncestorIndex = 0;
  while (
    commonAncestorIndex < Math.min(ancestors1.length, ancestors2.length) &&
    ancestors1[commonAncestorIndex].id === ancestors2[commonAncestorIndex].id
  ) {
    commonAncestorIndex++;
  }

  // If one is ancestor of the other, the ancestor's stacking context contains the descendant
  if (ancestors1.length > ancestors2.length && commonAncestorIndex === ancestors2.length) {
    return -1; // layer1 is inside layer2's stacking context
  }
  if (ancestors2.length > ancestors1.length && commonAncestorIndex === ancestors1.length) {
    return 1; // layer2 is inside layer1's stacking context
  }

  // Compare siblings at the divergence point
  if (commonAncestorIndex < ancestors1.length && commonAncestorIndex < ancestors2.length) {
    const parent1 = ancestors1[commonAncestorIndex];
    const parent2 = ancestors2[commonAncestorIndex];

    // Find common parent's children array
    const commonParent = commonAncestorIndex > 0
      ? ancestors1[commonAncestorIndex - 1]
      : null;

    const siblings = commonParent?.children || allLayers;

    const index1 = siblings.findIndex((l) => l.id === parent1.id);
    const index2 = siblings.findIndex((l) => l.id === parent2.id);

    return index1 < index2 ? -1 : 1;
  }

  return 0;
}

/**
 * Move layer to new position or parent (handles nesting)
 */
export function moveLayer(
  layers: Layer[],
  layerId: string,
  targetParentId: string | null,
  position: number
): Layer[] {
  // Implementation for drag-and-drop reordering and nesting
  // This will be used when implementing drag-and-drop
  return layers;
}
