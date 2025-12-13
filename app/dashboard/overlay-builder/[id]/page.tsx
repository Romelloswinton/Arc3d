"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { GlobalToolsBar } from "@/components/canvas/GlobalToolsBar"
import { PropertiesPanel } from "@/components/canvas/PropertiesPanel"
import { LeftPanel } from "@/components/panels/LeftPanel"
import { ExportModal } from "@/components/canvas/ExportModal"
import { useProject } from "@/lib/hooks/useProjects"
import { useAutoSave } from "@/lib/hooks/useAutoSave"
import type { ToolType, SaveStatus, Shape, ShapeType } from "@/lib/types/canvas"
import type { Layer, Asset, AssetCategory } from "@/lib/types/layers"

// Dynamically import CanvasWorkspace to prevent SSR and multiple Konva instances
const CanvasWorkspace = dynamic(
  () =>
    import("@/components/canvas/CanvasWorkspace").then(
      (mod) => mod.CanvasWorkspace
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-text-secondary text-sm">Loading canvas...</div>
      </div>
    ),
  }
)

export default function OverlayBuilder() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  // Load project from database
  const { data: project, isLoading, error } = useProject(projectId)

  // Canvas State
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Layers State
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "layer-1",
      name: "Background",
      type: "shape",
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: "normal",
    },
  ])
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>("layer-1")
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([])

  // Assets State
  const [assets, setAssets] = useState<Asset[]>([])
  const [assetCategories] = useState<AssetCategory[]>([
    { id: "overlays", name: "Overlays" },
    { id: "badges", name: "Badges" },
    { id: "widgets", name: "Widgets" },
    { id: "templates", name: "Templates" },
  ])

  // Tools State
  const [activeTool, setActiveTool] = useState<ToolType>("select")

  // Project State
  const [projectName, setProjectName] = useState("Untitled Overlay")
  const [zoom, setZoom] = useState(100)

  // Collaboration State
  const [isLocked, setIsLocked] = useState(false)
  const collaborators = [
    { id: 1, name: "You", avatar: "Y", color: "#9146ff" },
  ]

  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState<{ shape: Shape; layer: Layer } | null>(null)

  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Sync project data from database to local state
  useEffect(() => {
    if (project) {
      setProjectName(project.name)
      setShapes(project.project_data.shapes || [])
      setLayers(project.project_data.layers || [])
    }
  }, [project])

  // Auto-save to database
  const { isSaving, lastSaved, error: saveError } = useAutoSave({
    projectId,
    shapes,
    layers,
    enabled: !isLoading && !!project,
    debounceMs: 3000,
    createVersionInterval: 10,
  })

  // Derive save status from auto-save hook
  const saveStatus: SaveStatus = isSaving ? "saving" : "saved"

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text-secondary">Loading project...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error Loading Project</h1>
          <p className="text-text-secondary mb-4">{error.message}</p>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
          >
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  // Shape Management
  const addShape = (type: ShapeType) => {
    const shapeId = `${type}-${Date.now()}`
    const newShape: Shape = {
      id: shapeId,
      type,
      x: 100,
      y: 100,
      fill:
        type === "rect" ? "#9146ff" :
        type === "circle" ? "#00f593" :
        type === "diamond" ? "#ff6b6b" :
        type === "polygon" ? "#4ecdc4" :
        "#ffffff",
    }

    if (type === "rect") {
      newShape.width = 150
      newShape.height = 100
    } else if (type === "diamond") {
      newShape.width = 100
      newShape.height = 100
    } else if (type === "polygon") {
      newShape.width = 100
      newShape.height = 100
      newShape.points = [0, -50, 47.5, -15.5, 29.4, 40.5, -29.4, 40.5, -47.5, -15.5]
    } else if (type === "circle") {
      newShape.radius = 50
    } else if (type === "text") {
      newShape.text = "Your Text"
      newShape.width = 200
    }

    const newLayer: Layer = {
      id: shapeId,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${shapes.length + 1}`,
      type: type === "text" ? "text" : "shape",
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: "normal",
      x: 100,
      y: 100,
    }

    setShapes([...shapes, newShape])
    setLayers([...layers, newLayer])
    setSelectedLayerId(shapeId)
    setSelectedId(shapeId)
    setActiveTool("select")
  }

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool)
  }

  const handleCanvasClick = (x: number, y: number) => {
    if (activeTool === "rect" || activeTool === "diamond" || activeTool === "polygon" || activeTool === "circle" || activeTool === "text") {
      const shapeId = `${activeTool}-${Date.now()}`
      const newShape: Shape = {
        id: shapeId,
        type: activeTool as ShapeType,
        x: x,
        y: y,
        fill:
          activeTool === "rect" ? "#9146ff" :
          activeTool === "circle" ? "#00f593" :
          activeTool === "diamond" ? "#ff6b6b" :
          activeTool === "polygon" ? "#4ecdc4" :
          "#ffffff",
      }

      if (activeTool === "rect") {
        newShape.width = 150
        newShape.height = 100
      } else if (activeTool === "diamond") {
        newShape.width = 100
        newShape.height = 100
      } else if (activeTool === "polygon") {
        newShape.width = 100
        newShape.height = 100
        newShape.points = [0, -50, 47.5, -15.5, 29.4, 40.5, -29.4, 40.5, -47.5, -15.5]
      } else if (activeTool === "circle") {
        newShape.radius = 50
      } else if (activeTool === "text") {
        newShape.text = "Your Text"
        newShape.width = 200
      }

      const newLayer: Layer = {
        id: shapeId,
        name: `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} ${shapes.length + 1}`,
        type: activeTool === "text" ? "text" : "shape",
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: "normal",
        x: x,
        y: y,
      }

      setShapes([...shapes, newShape])
      setLayers([...layers, newLayer])
      setSelectedLayerId(shapeId)
      setSelectedId(shapeId)
      setActiveTool("select")
    }
  }

  const handleShapeDragEnd = (id: string, x: number, y: number) => {
    setShapes(
      shapes.map((shape) => (shape.id === id ? { ...shape, x, y } : shape))
    )
    setLayers(
      layers.map((layer) => (layer.id === id ? { ...layer, x, y } : layer))
    )
  }

  const handleShapeUpdate = (id: string, updates: Partial<Shape>) => {
    setShapes(
      shapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape
      )
    )
  }

  const handleShapeDelete = (id: string) => {
    setShapes(shapes.filter((shape) => shape.id !== id))
    setLayers(layers.filter((layer) => layer.id !== id))
    setSelectedId(null)
    setSelectedLayerId(null)
  }

  const handleExport = (format: string, options: any) => {
    console.log("Exporting as:", format, "with options:", options)
  }

  const handleLayerAdd = (
    type: "shape" | "text" | "group" | "adjustment" | "mask"
  ) => {
    if (type === "shape" || type === "text") {
      const shapeType: ShapeType = type === "text" ? "text" : "rect"
      addShape(shapeType)
      return
    }

    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
      type,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: "normal",
      hasMask: type === "mask",
      children: type === "group" ? [] : undefined,
    }
    setLayers([...layers, newLayer])
    setSelectedLayerId(newLayer.id)
  }

  const handleLayerDelete = (id: string) => {
    setLayers(layers.filter((l) => l.id !== id))
    setShapes(shapes.filter((s) => s.id !== id))
    if (selectedLayerId === id) {
      setSelectedLayerId(null)
      setSelectedId(null)
    }
  }

  const handleLayerDuplicate = (id: string) => {
    const layer = layers.find((l) => l.id === id)
    if (layer) {
      const duplicate: Layer = {
        ...layer,
        id: `layer-${Date.now()}`,
        name: `${layer.name} Copy`,
      }
      setLayers([...layers, duplicate])
    }
  }

  const handleLayerUpdate = (id: string, updates: Partial<Layer>) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, ...updates } : l)))
  }

  const handleAssetSelect = (asset: Asset) => {
    console.log("Selected asset:", asset)
  }

  const handleAssetCreate = () => {
    console.log("Create new asset")
  }

  const handleLayerContextMenu = (action: string, layerId: string) => {
    console.log("Context menu action:", action, "for layer:", layerId)

    switch (action) {
      case 'copy':
        const shape = shapes.find(s => s.id === layerId)
        const layer = layers.find(l => l.id === layerId)
        if (shape && layer) {
          setClipboard({ shape, layer })
        }
        break
      case 'cut':
        const cutShape = shapes.find(s => s.id === layerId)
        const cutLayer = layers.find(l => l.id === layerId)
        if (cutShape && cutLayer) {
          setClipboard({ shape: cutShape, layer: cutLayer })
          handleLayerDelete(layerId)
        }
        break
      case 'duplicate':
        handleLayerDuplicate(layerId)
        break
      case 'paste':
        if (clipboard) {
          const shapeId = `${clipboard.shape.type}-${Date.now()}`
          const newShape: Shape = {
            ...clipboard.shape,
            id: shapeId,
            x: clipboard.shape.x + 20,
            y: clipboard.shape.y + 20,
          }
          const newLayer: Layer = {
            ...clipboard.layer,
            id: shapeId,
            name: `${clipboard.layer.name} Copy`,
            x: clipboard.layer.x ? clipboard.layer.x + 20 : undefined,
            y: clipboard.layer.y ? clipboard.layer.y + 20 : undefined,
          }
          setShapes([...shapes, newShape])
          setLayers([...layers, newLayer])
          setSelectedLayerId(shapeId)
          setSelectedId(shapeId)
        }
        break
      case 'bring-to-front':
        const layerToFront = layers.find(l => l.id === layerId)
        if (layerToFront) {
          setLayers([...layers.filter(l => l.id !== layerId), layerToFront])
        }
        break
      case 'send-to-back':
        const layerToBack = layers.find(l => l.id === layerId)
        if (layerToBack) {
          setLayers([layerToBack, ...layers.filter(l => l.id !== layerId)])
        }
        break
      case 'use-as-mask':
        const currentLayerIndex = layers.findIndex(l => l.id === layerId)
        if (currentLayerIndex !== -1) {
          const targetLayerIndex = currentLayerIndex - 1
          if (targetLayerIndex >= 0) {
            const targetLayer = layers[targetLayerIndex]
            const updatedLayers = layers.map((l, idx) => {
              if (idx === currentLayerIndex) {
                return {
                  ...l,
                  isMask: true,
                  maskTargetId: targetLayer.id,
                  visible: true
                }
              } else if (idx === targetLayerIndex) {
                return { ...l, hasMask: true }
              }
              return l
            })
            setLayers(updatedLayers)
          }
        }
        break
      case 'group-selection':
        if (selectedLayerIds.length > 1) {
          const groupId = `group-${Date.now()}`
          const groupName = `Group ${layers.filter(l => l.type === 'group').length + 1}`
          const layersToGroup = layers.filter(l => selectedLayerIds.includes(l.id))
          const groupLayer: Layer = {
            id: groupId,
            name: groupName,
            type: 'group',
            visible: true,
            locked: false,
            opacity: 100,
            blendMode: 'normal',
            children: layersToGroup,
          }
          const remainingLayers = layers.filter(l => !selectedLayerIds.includes(l.id))
          setLayers([...remainingLayers, groupLayer])
          setSelectedLayerIds([])
          setSelectedLayerId(groupId)
        }
        break
      case 'ungroup':
        const groupLayer = layers.find(l => l.id === layerId)
        if (groupLayer && groupLayer.type === 'group' && groupLayer.children) {
          const otherLayers = layers.filter(l => l.id !== layerId)
          const updatedLayers = [...otherLayers, ...groupLayer.children]
          setLayers(updatedLayers)
          setSelectedLayerId(null)
        }
        break
      case 'unmask':
        const updatedLayers = layers.map(l => {
          if (l.id === layerId) {
            if (l.hasMask) {
              const { hasMask, ...rest } = l;
              return rest;
            }
            if (l.isMask) {
              const { isMask, maskTargetId, ...rest } = l;
              return rest;
            }
          }
          if (l.isMask && l.maskTargetId === layerId) {
            const { isMask, maskTargetId, ...rest } = l;
            return rest;
          }
          return l;
        });
        setLayers(updatedLayers);
        break
      default:
        console.log("Action not implemented yet:", action)
    }
  }

  const selectedShape = shapes.find((s) => s.id === selectedId) || null
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      if (cmdOrCtrl && e.key === 'c' && selectedId) {
        e.preventDefault()
        const shape = shapes.find(s => s.id === selectedId)
        const layer = layers.find(l => l.id === selectedId)
        if (shape && layer) {
          setClipboard({ shape, layer })
        }
      }

      if (cmdOrCtrl && e.key === 'v' && clipboard) {
        e.preventDefault()
        const shapeId = `${clipboard.shape.type}-${Date.now()}`
        const newShape: Shape = {
          ...clipboard.shape,
          id: shapeId,
          x: clipboard.shape.x + 20,
          y: clipboard.shape.y + 20,
        }
        const newLayer: Layer = {
          ...clipboard.layer,
          id: shapeId,
          name: `${clipboard.layer.name} Copy`,
          x: clipboard.layer.x ? clipboard.layer.x + 20 : undefined,
          y: clipboard.layer.y ? clipboard.layer.y + 20 : undefined,
        }
        setShapes([...shapes, newShape])
        setLayers([...layers, newLayer])
        setSelectedLayerId(shapeId)
        setSelectedId(shapeId)
      }

      if (cmdOrCtrl && e.key === 'd' && selectedId) {
        e.preventDefault()
        const shape = shapes.find(s => s.id === selectedId)
        const layer = layers.find(l => l.id === selectedId)
        if (shape && layer) {
          const shapeId = `${shape.type}-${Date.now()}`
          const newShape: Shape = {
            ...shape,
            id: shapeId,
            x: shape.x + 20,
            y: shape.y + 20,
          }
          const newLayer: Layer = {
            ...layer,
            id: shapeId,
            name: `${layer.name} Copy`,
            x: layer.x ? layer.x + 20 : undefined,
            y: layer.y ? layer.y + 20 : undefined,
          }
          setShapes([...shapes, newShape])
          setLayers([...layers, newLayer])
          setSelectedLayerId(shapeId)
          setSelectedId(shapeId)
        }
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        handleShapeDelete(selectedId)
      }

      if (cmdOrCtrl && e.key === 'a') {
        e.preventDefault()
        if (shapes.length > 0) {
          setSelectedId(shapes[0].id)
          setSelectedLayerId(shapes[0].id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shapes, layers, selectedId, clipboard])

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <GlobalToolsBar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        projectName={projectName}
        saveStatus={saveStatus}
        onProjectNameChange={setProjectName}
        onSave={() => {}} // Auto-save handles this
        zoom={zoom}
        onZoomChange={setZoom}
        collaborators={collaborators}
        isLocked={isLocked}
        onLockToggle={() => setIsLocked(!isLocked)}
      />

      <div className="flex-1 flex overflow-y-auto pt-20 relative">
        <CanvasWorkspace
          shapes={shapes}
          selectedId={selectedId}
          selectedLayerIds={selectedLayerIds}
          activeTool={activeTool}
          onShapeSelect={(id) => {
            setSelectedId(id)
            setSelectedLayerId(id)
            setSelectedLayerIds([])
          }}
          onShapeDragEnd={handleShapeDragEnd}
          onShapeUpdate={handleShapeUpdate}
          onCanvasClick={handleCanvasClick}
          zoom={zoom}
          layers={layers}
        />

        <div className="absolute left-0 top-24 bottom-4 pointer-events-none z-20">
          <div className="pointer-events-auto">
            <LeftPanel
              layers={layers}
              selectedLayerId={selectedLayerId}
              selectedLayerIds={selectedLayerIds}
              onLayerSelect={(id, event) => {
                const isMultiSelect = event?.ctrlKey || event?.metaKey
                if (isMultiSelect) {
                  if (selectedLayerIds.includes(id)) {
                    const newSelectedIds = selectedLayerIds.filter(lid => lid !== id)
                    setSelectedLayerIds(newSelectedIds)
                    if (newSelectedIds.length > 0) {
                      const lastId = newSelectedIds[newSelectedIds.length - 1]
                      setSelectedLayerId(lastId)
                      setSelectedId(lastId)
                    } else {
                      setSelectedLayerId(null)
                      setSelectedId(null)
                    }
                  } else {
                    setSelectedLayerIds([...selectedLayerIds, id])
                    setSelectedLayerId(id)
                    setSelectedId(id)
                  }
                } else {
                  setSelectedLayerId(id)
                  setSelectedId(id)
                  setSelectedLayerIds([])
                }
              }}
              onLayerAdd={handleLayerAdd}
              onLayerDelete={handleLayerDelete}
              onLayerUpdate={handleLayerUpdate}
              onContextMenuAction={handleLayerContextMenu}
              assets={assets}
              assetCategories={assetCategories}
              onAssetSelect={handleAssetSelect}
              onAssetCreate={handleAssetCreate}
            />
          </div>
        </div>

        <div className="absolute right-0 top-24 bottom-4 pointer-events-none z-20">
          <div className="pointer-events-auto">
            <PropertiesPanel
              activeTool={activeTool}
              selectedShape={selectedShape}
              selectedLayer={selectedLayer}
              onShapeUpdate={handleShapeUpdate}
              onLayerUpdate={handleLayerUpdate}
              onShapeDelete={handleShapeDelete}
              onExportClick={() => setIsExportModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  )
}
