"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { GlobalToolsBar } from "@/components/canvas/GlobalToolsBar"
import { PropertiesPanel } from "@/components/canvas/PropertiesPanel"
import { LeftPanel } from "@/components/panels/LeftPanel"
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
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    "layer-1"
  )

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const [zoom, setZoom] = useState(100)

  // Collaboration State
  const [isLocked, setIsLocked] = useState(false)
  const collaborators = [
    { id: 1, name: "You", avatar: "Y", color: "#9146ff" },
    { id: 2, name: "Alex", avatar: "A", color: "#00f593" },
    { id: 3, name: "Sam", avatar: "S", color: "#00c8ff" },
  ]

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Shape Management
  const addShape = (type: ShapeType) => {
    const shapeId = `${type}-${Date.now()}`
    const newShape: Shape = {
      id: shapeId,
      type,
      x: 100,
      y: 100,
      fill:
        type === "rect" ? "#9146ff" : type === "circle" ? "#00f593" : "#ffffff",
    }

    if (type === "rect") {
      newShape.width = 150
      newShape.height = 100
    } else if (type === "circle") {
      newShape.radius = 50
    } else if (type === "text") {
      newShape.text = "Your Text"
      newShape.width = 200
    }

    // Create corresponding layer
    const newLayer: Layer = {
      id: shapeId,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${
        shapes.length + 1
      }`,
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
    setSaveStatus("unsaved")
    setActiveTool("select")
  }

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool)
    if (tool === "rect" || tool === "circle" || tool === "text") {
      addShape(tool)
    }
  }

  const handleShapeDragEnd = (id: string, x: number, y: number) => {
    // Update both shape and layer positions
    setShapes(
      shapes.map((shape) => (shape.id === id ? { ...shape, x, y } : shape))
    )
    setLayers(
      layers.map((layer) => (layer.id === id ? { ...layer, x, y } : layer))
    )
    setSaveStatus("unsaved")
  }

  const handleShapeUpdate = (id: string, updates: Partial<Shape>) => {
    setShapes(
      shapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape
      )
    )
    setSaveStatus("unsaved")
  }

  const handleShapeDelete = (id: string) => {
    // Delete both shape and layer
    setShapes(shapes.filter((shape) => shape.id !== id))
    setLayers(layers.filter((layer) => layer.id !== id))
    setSelectedId(null)
    setSelectedLayerId(null)
    setSaveStatus("unsaved")
  }

  // Project Management
  const handleSave = () => {
    setSaveStatus("saving")
    setTimeout(() => {
      setSaveStatus("saved")
    }, 1000)
  }

  const handleExport = (format: string, options: any) => {
    console.log("Exporting as:", format, "with options:", options)
  }

  // Layer Management
  const handleLayerAdd = (
    type: "shape" | "text" | "group" | "adjustment" | "mask"
  ) => {
    // For shape/text layers, create actual canvas shape
    if (type === "shape" || type === "text") {
      const shapeType: ShapeType = type === "text" ? "text" : "rect"
      addShape(shapeType)
      return
    }

    // For special layer types (group, adjustment, mask)
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
    // Delete both layer and corresponding shape
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

  // Asset Management
  const handleAssetSelect = (asset: Asset) => {
    console.log("Selected asset:", asset)
    // TODO: Add asset to canvas
  }

  const handleAssetCreate = () => {
    console.log("Create new asset")
    // TODO: Open asset creation modal
  }

  const selectedShape = shapes.find((s) => s.id === selectedId) || null
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null

  // Auto-populate canvas with a centered square on initial load
  useEffect(() => {
    if (shapes.length === 0) {
      const canvasWidth = 1920 / 2 // 960
      const canvasHeight = 1080 / 2 // 540
      const rectWidth = 150
      const rectHeight = 100

      const shapeId = `rect-${Date.now()}`
      const newShape: Shape = {
        id: shapeId,
        type: "rect",
        x: (canvasWidth / 2) - (rectWidth / 2), // Center X
        y: (canvasHeight / 2) - (rectHeight / 2), // Center Y
        fill: "#9146ff",
        width: rectWidth,
        height: rectHeight,
      }

      const newLayer: Layer = {
        id: shapeId,
        name: "Rectangle 1",
        type: "shape",
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: "normal",
        x: (canvasWidth / 2) - (rectWidth / 2),
        y: (canvasHeight / 2) - (rectHeight / 2),
      }

      setShapes([newShape])
      setLayers([...layers, newLayer])
      setSelectedLayerId(shapeId)
      setSelectedId(shapeId)
      setSaveStatus("unsaved")
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save effect: saves 3 seconds after last change
  useEffect(() => {
    // Only auto-save when there are unsaved changes
    if (saveStatus === "unsaved") {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      // Set a new timer for 3 seconds
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave()
      }, 3000)
    }

    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [shapes, layers, saveStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Floating Global Tools Bar */}
      <GlobalToolsBar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        projectName={projectName}
        saveStatus={saveStatus}
        onProjectNameChange={setProjectName}
        onSave={handleSave}
        zoom={zoom}
        onZoomChange={setZoom}
        collaborators={collaborators}
        isLocked={isLocked}
        onLockToggle={() => setIsLocked(!isLocked)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-y-auto pt-20 relative">
        {/* Canvas (full width) */}
        <CanvasWorkspace
          shapes={shapes}
          selectedId={selectedId}
          onShapeSelect={(id) => {
            setSelectedId(id)
            setSelectedLayerId(id)
          }}
          onShapeDragEnd={handleShapeDragEnd}
          zoom={zoom}
          layers={layers}
        />

        {/* Floating Left Panel - Layers & Assets */}
        <div className="absolute left-0 top-24 bottom-4 pointer-events-none z-20">
          <div className="pointer-events-auto">
            <LeftPanel
              layers={layers}
              selectedLayerId={selectedLayerId}
              onLayerSelect={(id) => {
                setSelectedLayerId(id)
                setSelectedId(id) // Sync canvas selection
              }}
              onLayerAdd={handleLayerAdd}
              onLayerDelete={handleLayerDelete}
              onLayerDuplicate={handleLayerDuplicate}
              onLayerUpdate={handleLayerUpdate}
              assets={assets}
              assetCategories={assetCategories}
              onAssetSelect={handleAssetSelect}
              onAssetCreate={handleAssetCreate}
            />
          </div>
        </div>

        {/* Floating Right Panel - Properties */}
        <div className="absolute right-0 top-24 bottom-4 pointer-events-none z-20">
          <div className="pointer-events-auto">
            <PropertiesPanel
              activeTool={activeTool}
              selectedShape={selectedShape}
              selectedLayer={selectedLayer}
              onShapeUpdate={handleShapeUpdate}
              onLayerUpdate={handleLayerUpdate}
              onShapeDelete={handleShapeDelete}
              onExport={handleExport}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
