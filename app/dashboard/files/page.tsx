/**
 * Files & Assets Page
 *
 * Combines file manager and assets library in one interface.
 */

'use client'

import { useState } from 'react'
import { useAssets, useAssetCategories, useCreateAsset, useDeleteAsset } from '@/lib/hooks/useAssets'
import { uploadAssetMedia } from '@/lib/api/storage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, File, Image, Video, FileText, Trash2, Download, Search, Grid3x3, List, Folder, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type TabType = 'media' | 'assets'
type ViewMode = 'grid' | 'list'

export default function FilesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('media')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [uploading, setUploading] = useState(false)

  const { data: assets, isLoading: assetsLoading } = useAssets(selectedCategory)
  const { data: categories } = useAssetCategories()
  const createAsset = useCreateAsset()
  const deleteAsset = useDeleteAsset()

  // Media files state (from Supabase Storage)
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)

  const supabase = createClient()

  // Load media files from storage
  const loadMediaFiles = async () => {
    setMediaLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.storage
        .from('asset-media')
        .list(user.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (error) throw error

      const filesWithUrls = data?.map(file => ({
        ...file,
        url: supabase.storage.from('asset-media').getPublicUrl(`${user.id}/${file.name}`).data.publicUrl,
      })) || []

      setMediaFiles(filesWithUrls)
    } catch (error) {
      console.error('Failed to load media files:', error)
    } finally {
      setMediaLoading(false)
    }
  }

  // Load media files when tab switches
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (tab === 'media' && mediaFiles.length === 0) {
      loadMediaFiles()
    }
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      for (const file of Array.from(files)) {
        const fileName = `${user.id}/${Date.now()}-${file.name}`

        const { error } = await supabase.storage
          .from('asset-media')
          .upload(fileName, file)

        if (error) throw error
      }

      // Reload media files
      await loadMediaFiles()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  // Handle media file delete
  const handleDeleteMedia = async (fileName: string) => {
    if (!confirm('Delete this file?')) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.storage
        .from('asset-media')
        .remove([`${user.id}/${fileName}`])

      if (error) throw error

      await loadMediaFiles()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  // Handle asset delete
  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Delete this asset?')) return

    try {
      await deleteAsset.mutateAsync(assetId)
    } catch (error) {
      console.error('Failed to delete asset:', error)
    }
  }

  const filteredAssets = assets?.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMedia = mediaFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return Image
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) return Video
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Files & Assets</h1>
            <p className="text-text-secondary">
              Manage your media files and reusable design assets
            </p>
          </div>

          {activeTab === 'media' && (
            <div>
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload">
                <Button disabled={uploading} className="cursor-pointer" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => handleTabChange('media')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'media'
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <File className="w-4 h-4 inline mr-2" />
            Media Files
          </button>
          <button
            onClick={() => handleTabChange('assets')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'assets'
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Folder className="w-4 h-4 inline mr-2" />
            Design Assets
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder={activeTab === 'media' ? 'Search files...' : 'Search assets...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Category filter (for assets only) */}
          {activeTab === 'assets' && (
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || undefined)}
              className="px-4 py-2 border border-border rounded-md bg-background"
            >
              <option value="">All Categories</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}

          {/* View Toggle */}
          <div className="flex gap-2 border border-border rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'media' ? (
          /* Media Files Tab */
          mediaLoading ? (
            <div className="text-center py-16 text-text-secondary">Loading files...</div>
          ) : filteredMedia.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'flex flex-col gap-3'}>
              {filteredMedia.map((file) => {
                const Icon = getFileIcon(file.name)
                const isImage = Icon === Image

                return (
                  <Card
                    key={file.name}
                    className={`group relative ${viewMode === 'grid' ? 'p-4' : 'flex items-center p-4'}`}
                  >
                    {/* Preview */}
                    <div className={`bg-surface rounded-md flex items-center justify-center mb-3 ${viewMode === 'grid' ? 'aspect-square' : 'w-16 h-16 flex-shrink-0'}`}>
                      {isImage ? (
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <Icon className="w-8 h-8 text-text-secondary" />
                      )}
                    </div>

                    {/* Info */}
                    <div className={viewMode === 'list' ? 'flex-1 ml-4' : ''}>
                      <h3 className="font-medium text-sm mb-1 truncate" title={file.name}>
                        {file.name}
                      </h3>
                      <p className="text-xs text-text-secondary">
                        {formatFileSize(file.metadata?.size || 0)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={file.url}
                        download
                        className="p-2 rounded-md bg-surface hover:bg-surface-hover"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteMedia(file.name)}
                        className="p-2 rounded-md bg-surface hover:bg-red-50 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Upload className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No files yet</h3>
              <p className="text-text-secondary mb-6">
                {searchQuery ? `No files match "${searchQuery}"` : 'Upload images and videos to get started'}
              </p>
              {!searchQuery && (
                <label htmlFor="file-upload">
                  <Button disabled={uploading} asChild>
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Your First File
                    </span>
                  </Button>
                </label>
              )}
            </div>
          )
        ) : (
          /* Assets Tab */
          assetsLoading ? (
            <div className="text-center py-16 text-text-secondary">Loading assets...</div>
          ) : filteredAssets && filteredAssets.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'flex flex-col gap-3'}>
              {filteredAssets.map((asset) => (
                <Card
                  key={asset.id}
                  className={`group relative ${viewMode === 'grid' ? 'p-4' : 'flex items-center p-4'}`}
                >
                  {/* Thumbnail */}
                  <div className={`bg-surface rounded-md flex items-center justify-center mb-3 ${viewMode === 'grid' ? 'aspect-square' : 'w-16 h-16 flex-shrink-0'}`}>
                    {asset.thumbnail_url ? (
                      <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <Folder className="w-8 h-8 text-text-secondary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className={viewMode === 'list' ? 'flex-1 ml-4' : ''}>
                    <h3 className="font-semibold mb-1 truncate">{asset.name}</h3>
                    {asset.description && (
                      <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                        {asset.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="capitalize">{asset.type}</span>
                      <span>•</span>
                      <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-2 rounded-md bg-surface opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Folder className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No assets yet</h3>
              <p className="text-text-secondary mb-6">
                {searchQuery
                  ? `No assets match "${searchQuery}"`
                  : 'Create reusable design components from your projects'}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
