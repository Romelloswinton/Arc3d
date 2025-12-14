/**
 * Template Preview Page
 *
 * Read-only preview of a template with "Use Template" button
 */

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PREBUILT_WIDGETS, PREBUILT_OVERLAYS } from '@/lib/constants/widgets'
import { useCreateProject } from '@/lib/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Plus, Layers, Sparkles, Video, Zap, Eye } from 'lucide-react'
import type { Asset } from '@/lib/types/layers'

export default function TemplatePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  const createProject = useCreateProject()

  // Find the template
  const allTemplates = [...PREBUILT_OVERLAYS, ...PREBUILT_WIDGETS]
  const template = allTemplates.find(t => t.id === templateId)

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Template Not Found</h1>
          <p className="text-text-secondary mb-4">The template you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/templates')}>
            Back to Templates
          </Button>
        </div>
      </div>
    )
  }

  const handleUseTemplate = async () => {
    try {
      console.log('Creating project from template:', template)

      const newProject = await createProject.mutateAsync({
        name: `${template.name} Project`,
        description: template.data?.description || null,
        canvas_width: 1920,
        canvas_height: 1080,
        canvas_background_color: '#1a1a2e',
        project_data: {
          shapes: template.data?.shapes || [],
          layers: template.data?.layers || [],
        },
        category: template.category,
        tags: template.data?.tags || null,
      })

      console.log('Project created successfully:', newProject)
      router.push(`/dashboard/overlay-builder/${newProject.id}`)
    } catch (error) {
      console.error('❌ Failed to create project:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to create project:\n\n${errorMessage}`)
    }
  }

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'overlays':
        return <Video className="w-8 h-8" />
      case 'widgets':
        return <Zap className="w-8 h-8" />
      default:
        return <Layers className="w-8 h-8" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/templates')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Templates
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{template.name}</h1>
                <p className="text-sm text-text-secondary capitalize">{template.category} Template</p>
              </div>
            </div>
            <Button
              onClick={handleUseTemplate}
              disabled={createProject.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {createProject.isPending ? 'Creating...' : 'Use This Template'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preview */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden border-2">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-8">
                <div className="aspect-video bg-black rounded-lg shadow-2xl border-2 border-purple-200 dark:border-purple-800 flex items-center justify-center relative overflow-hidden">
                  {/* Check if template has video */}
                  {(() => {
                    const videoShape = template.data?.shapes?.find((s: any) => s.type === 'video' && s.videoUrl)

                    if (videoShape) {
                      return (
                        <>
                          {/* Video Preview */}
                          <video
                            src={videoShape.videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          {/* Overlay gradient for readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
                        </>
                      )
                    }

                    // Fallback to icon if no video
                    return (
                      <>
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }}></div>
                        </div>

                        {/* Preview Icon */}
                        <div className="relative">
                          <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center shadow-2xl">
                            {getTemplateIcon(template.category)}
                            <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                              <Eye className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                      </>
                    )
                  })()}

                  {/* Preview Label */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg border border-purple-200 dark:border-purple-800 backdrop-blur-sm">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {template.data?.shapes?.find((s: any) => s.type === 'video') ? 'Live Preview' : 'Template Preview'}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-sm text-text-secondary mt-4">
                  {template.data?.shapes?.find((s: any) => s.type === 'video')
                    ? 'Video preview shown above - click "Use This Template" to customize and make it your own'
                    : 'Click "Use This Template" to customize and make it your own'}
                </p>
              </div>
            </Card>

            {/* Components Preview */}
            <Card className="mt-6 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Template Components ({template.data?.shapes?.length || 0})
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {template.data?.shapes?.map((shape: any, index: number) => (
                  <div
                    key={shape.id || index}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white ${
                        shape.type === 'video' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                        shape.type === 'text' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                        shape.type === 'rect' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                        shape.type === 'circle' ? 'bg-gradient-to-br from-pink-500 to-pink-600' :
                        'bg-gradient-to-br from-gray-500 to-gray-600'
                      }`}>
                        {shape.type === 'video' && <Video className="w-4 h-4" />}
                        {shape.type === 'text' && 'T'}
                        {shape.type === 'rect' && '□'}
                        {shape.type === 'circle' && '○'}
                        {!['video', 'text', 'rect', 'circle'].includes(shape.type) && '◇'}
                      </div>
                      <p className="text-sm font-medium capitalize truncate flex-1">{shape.type}</p>
                    </div>
                    <div className="text-xs text-text-secondary space-y-0.5">
                      {shape.width && <p>W: {shape.width}px</p>}
                      {shape.height && <p>H: {shape.height}px</p>}
                      {shape.text && <p className="truncate">"{shape.text}"</p>}
                      {shape.videoUrl && <p className="text-blue-600 truncate">🎥 Video</p>}
                    </div>
                  </div>
                ))}
              </div>

              {(!template.data?.shapes || template.data.shapes.length === 0) && (
                <p className="text-text-secondary text-center py-8">No components to preview</p>
              )}
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Description */}
            {template.data?.description && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  About This Template
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {template.data.description}
                </p>
              </Card>
            )}

            {/* What's Included */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                What's Included
              </h3>
              <ul className="space-y-2">
                {template.data?.layers?.slice(0, 8).map((layer: any) => (
                  <li key={layer.id} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    <span>{layer.name}</span>
                  </li>
                ))}
                {template.data?.layers && template.data.layers.length > 8 && (
                  <li className="text-sm text-text-secondary italic">
                    +{template.data.layers.length - 8} more layers...
                  </li>
                )}
              </ul>
            </Card>

            {/* Usage Tips */}
            {template.data?.usage && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Usage Tips
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {template.data.usage}
                </p>
              </Card>
            )}

            {/* Tags */}
            {template.data?.tags && template.data.tags.length > 0 && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {template.data.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Stats */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-200 dark:border-purple-800">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{template.data?.shapes?.length || 0}</p>
                  <p className="text-sm text-text-secondary">Components</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-pink-600">{template.data?.layers?.length || 0}</p>
                  <p className="text-sm text-text-secondary">Layers</p>
                </div>
              </div>
            </Card>

            {/* CTA */}
            <Button
              onClick={handleUseTemplate}
              disabled={createProject.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg shadow-lg"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {createProject.isPending ? 'Creating Project...' : 'Use This Template'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
