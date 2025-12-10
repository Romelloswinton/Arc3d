'use client';

import { useState } from 'react';
import { X, Download, FileImage, FileCode, FileJson, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string, options: ExportOptions) => void;
}

interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'json';
  quality: number;
  scale: number;
  transparent: boolean;
  width?: number;
  height?: number;
}

export const ExportModal = ({ isOpen, onClose, onExport }: ExportModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'svg' | 'json'>('png');
  const [quality, setQuality] = useState(100);
  const [scale, setScale] = useState(1);
  const [transparent, setTransparent] = useState(true);
  const [customWidth, setCustomWidth] = useState<number>(1920);
  const [customHeight, setCustomHeight] = useState<number>(1080);

  if (!isOpen) return null;

  const formats = [
    { id: 'png', name: 'PNG', icon: FileImage, description: 'High quality with transparency' },
    { id: 'jpg', name: 'JPG', icon: ImageIcon, description: 'Compressed, no transparency' },
    { id: 'svg', name: 'SVG', icon: FileCode, description: 'Scalable vector graphics' },
    { id: 'json', name: 'JSON', icon: FileJson, description: 'Project data for re-import' },
  ];

  const handleExport = () => {
    const options: ExportOptions = {
      format: selectedFormat,
      quality,
      scale,
      transparent,
      width: customWidth,
      height: customHeight,
    };
    onExport(selectedFormat, options);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary">
          <div>
            <h2 className="text-2xl font-bold">Export Overlay</h2>
            <p className="text-sm text-text-secondary mt-1">
              Choose your export format and settings
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              {formats.map((format) => {
                const Icon = format.icon;
                const isSelected = selectedFormat === format.id;
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id as any)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border-primary hover:border-border-secondary'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-primary' : 'text-text-secondary'}`} />
                      <div>
                        <div className="font-semibold">{format.name}</div>
                        <div className="text-xs text-text-secondary mt-1">
                          {format.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resolution Settings */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Resolution</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-secondary mb-2 block">Width (px)</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-card border border-border-primary rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-2 block">Height (px)</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-card border border-border-primary rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setCustomWidth(1920); setCustomHeight(1080); }}
                className="px-3 py-1.5 text-xs border border-border-primary rounded-lg hover:bg-card-hover"
              >
                1920 × 1080
              </button>
              <button
                onClick={() => { setCustomWidth(2560); setCustomHeight(1440); }}
                className="px-3 py-1.5 text-xs border border-border-primary rounded-lg hover:bg-card-hover"
              >
                2560 × 1440
              </button>
              <button
                onClick={() => { setCustomWidth(3840); setCustomHeight(2160); }}
                className="px-3 py-1.5 text-xs border border-border-primary rounded-lg hover:bg-card-hover"
              >
                3840 × 2160
              </button>
            </div>
          </div>

          {/* Scale */}
          <div>
            <label className="text-sm font-semibold mb-3 block">
              Scale: {scale}x
            </label>
            <input
              type="range"
              min="1"
              max="4"
              step="0.5"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>1x</span>
              <span>2x</span>
              <span>3x</span>
              <span>4x</span>
            </div>
          </div>

          {/* Quality (for JPG/PNG) */}
          {(selectedFormat === 'png' || selectedFormat === 'jpg') && (
            <div>
              <label className="text-sm font-semibold mb-3 block">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          )}

          {/* Transparency (for PNG) */}
          {selectedFormat === 'png' && (
            <div className="flex items-center justify-between p-4 bg-card-hover rounded-lg">
              <div>
                <div className="text-sm font-semibold">Transparent Background</div>
                <div className="text-xs text-text-secondary mt-1">
                  Remove background for overlay use
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={transparent}
                  onChange={(e) => setTransparent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-card border border-border-primary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border-primary">
          <div className="text-sm text-text-secondary">
            Output: {customWidth} × {customHeight}px {selectedFormat.toUpperCase()}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
