'use client';

import { useState } from 'react';
import { Search, Plus, FolderOpen, Package, Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Asset, AssetCategory } from '@/lib/types/layers';

interface AssetsPanelProps {
  assets: Asset[];
  categories: AssetCategory[];
  onAssetSelect: (asset: Asset) => void;
  onAssetCreate: () => void;
}

export const AssetsPanel = ({
  assets,
  categories,
  onAssetSelect,
  onAssetCreate,
}: AssetsPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border-primary">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Assets</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid3x3 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onAssetCreate}
              title="Create new asset"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-card-hover border border-border-primary rounded-xl focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-3 py-2 border-b border-border-primary">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors font-medium ${
              selectedCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-card-hover hover:bg-border-primary'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors font-medium ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-card-hover hover:bg-border-primary'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Assets List/Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary text-center">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No assets found</p>
                <p className="text-xs mt-1">Try a different search</p>
              </>
            ) : (
              <>
                <Package className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No assets yet</p>
                <p className="text-xs mt-1">Create your first asset</p>
                <Button size="sm" onClick={onAssetCreate} className="mt-4">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Create Asset
                </Button>
              </>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 gap-2'
                : 'space-y-1'
            }
          >
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => onAssetSelect(asset)}
                className={`${
                  viewMode === 'grid'
                    ? 'flex flex-col p-3'
                    : 'flex items-center gap-3 p-2.5'
                } bg-card-hover hover:bg-border-primary rounded-xl transition-colors text-left group`}
              >
                {/* Thumbnail */}
                <div
                  className={`${
                    viewMode === 'grid' ? 'w-full h-20' : 'w-12 h-12'
                  } bg-card rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden`}
                >
                  {asset.thumbnail ? (
                    <img
                      src={asset.thumbnail}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderOpen className="h-6 w-6 text-text-secondary" />
                  )}
                </div>

                {/* Info */}
                <div className={viewMode === 'grid' ? 'mt-2' : 'flex-1 min-w-0'}>
                  <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                    {asset.name}
                  </p>
                  <p className="text-[10px] text-text-secondary capitalize mt-0.5">
                    {asset.type}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
