'use client';

import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface SelectionBreadcrumbProps {
  path: BreadcrumbItem[];
  onNavigate: (id: string) => void;
  onExitIsolation?: () => void;
  isIsolated?: boolean;
}

export const SelectionBreadcrumb = ({
  path,
  onNavigate,
  onExitIsolation,
  isIsolated = false,
}: SelectionBreadcrumbProps) => {
  if (path.length === 0) return null;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border-primary rounded-lg px-3 py-2 shadow-lg flex items-center gap-2 text-xs">
      {/* Home/Exit Isolation */}
      {isIsolated && onExitIsolation && (
        <>
          <button
            onClick={onExitIsolation}
            className="p-1 hover:bg-card-hover rounded transition-colors"
            title="Exit isolation mode"
          >
            <Home className="h-3.5 w-3.5 text-text-secondary" />
          </button>
          <ChevronRight className="h-3 w-3 text-text-muted" />
        </>
      )}

      {/* Breadcrumb Path */}
      {path.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(item.id)}
            className={`px-2 py-1 rounded transition-colors ${
              index === path.length - 1
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-text-secondary hover:text-foreground hover:bg-card-hover'
            }`}
          >
            {item.name}
          </button>
          {index < path.length - 1 && (
            <ChevronRight className="h-3 w-3 text-text-muted" />
          )}
        </div>
      ))}

      {/* Selection Depth Indicator */}
      {path.length > 1 && (
        <div className="ml-2 px-2 py-1 bg-card-hover rounded text-text-muted">
          Depth: {path.length - 1}
        </div>
      )}
    </div>
  );
};
