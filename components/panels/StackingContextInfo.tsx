'use client';

import { Info, Layers } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StackingContextInfoProps {
  layerName: string;
  depth: number;
  localZIndex: number;
  isInStackingContext: boolean;
}

export const StackingContextInfo = ({
  layerName,
  depth,
  localZIndex,
  isInStackingContext,
}: StackingContextInfoProps) => {
  return (
    <Card className="p-3 text-xs">
      <div className="flex items-start gap-2 mb-2">
        <Info className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-foreground mb-1">Stacking Context</div>
          <p className="text-text-secondary leading-relaxed">
            <span className="font-medium text-foreground">{layerName}</span> is at{' '}
            <span className="font-medium text-primary">position {localZIndex + 1}</span> within its parent.
          </p>
        </div>
      </div>

      {isInStackingContext && (
        <div className="mt-2 pt-2 border-t border-border-primary">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Layers className="h-3.5 w-3.5" />
            <span>
              This layer creates a new stacking context. All children stack within this boundary.
            </span>
          </div>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-border-primary text-text-muted">
        <p className="leading-relaxed">
          <strong>Rule:</strong> Z-index is local to the parent. This layer can only be reordered
          among its siblings, not globally.
        </p>
      </div>
    </Card>
  );
};
