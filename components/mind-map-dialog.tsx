"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import ReactFlow, {
  Background,
  Controls,
  Panel,
  type Node,
  type Edge,
  ConnectionLineType,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
} from "reactflow"
import "reactflow/dist/style.css"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toPng } from "html-to-image"
import type { MindMapData } from "@/lib/types"
import { CustomNode } from "@/components/custom-node"
import { CustomEdge } from "@/components/custom-edge"
import { MindMapViewer } from "./mind-map-viewer"

interface MindMapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mindMapData: MindMapData | null
  prompt: string
}

// Register custom node and edge types
const nodeTypes = {
  custom: CustomNode,
}

const edgeTypes = {
  custom: CustomEdge,
}

export function MindMapDialog({ open, onOpenChange, mindMapData, prompt }: MindMapDialogProps) {
  const reactFlowRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  // Initialize nodes and edges when mindMapData changes
  useEffect(() => {
    if (mindMapData) {
      setNodes(mindMapData.nodes as Node[])
      setEdges(mindMapData.edges as Edge[])
    }
  }, [mindMapData])

  // Handle node changes (position, selection, etc.)
  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [])

  // Handle edge changes
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [])

  // Handle new connections
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "custom",
            label: "connects to",
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds,
        ),
      ),
    [],
  )

  const exportAsPng = useCallback(() => {
    if (reactFlowRef.current) {
      setIsExporting(true)

      // Wait for the next render cycle to apply the exporting class
      setTimeout(() => {
        toPng(reactFlowRef.current, {
          backgroundColor: "#000000",
          quality: 1,
          pixelRatio: 2,
          filter: (node) => {
            // Filter out UI controls from the export
            return !node.classList?.contains("react-flow__controls") && !node.classList?.contains("react-flow__panel")
          },
        })
          .then((dataUrl) => {
            const link = document.createElement("a")
            link.download = "mind-map.png"
            link.href = dataUrl
            link.click()
            setIsExporting(false)
          })
          .catch((error) => {
            console.error("Error exporting mind map:", error)
            setIsExporting(false)
          })
      }, 100)
    }
  }, [])

  if (!mindMapData) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[1200px] h-[800px] bg-black border-beige/30">
        <DialogTitle className="sr-only">
          Mind Map for {prompt}
        </DialogTitle>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-beige">
              Mind Map: {prompt.substring(0, 40)}
              {prompt.length > 40 ? "..." : ""}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsPng}
              disabled={isExporting}
              className="border-beige/30 text-beige hover:bg-beige/10"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export as PNG"}
            </Button>
          </div>

          <div className={`flex-1 border border-beige/20 rounded-md overflow-hidden ${isExporting ? "exporting" : ""}`}>
            <ReactFlowProvider>
              <div ref={reactFlowRef} className="w-full h-full relative">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView={true}
                  minZoom={0.2}
                  maxZoom={1.5}
                  defaultEdgeOptions={{
                    type: "custom",
                    style: { stroke: "#d7c9aa" },
                  }}
                  connectionLineType={ConnectionLineType.Bezier}
                  proOptions={{ hideAttribution: true }}
                  nodesDraggable={true}
                  nodesConnectable={true}
                  elementsSelectable={true}
                  connectOnClick={false}
                >
                  <Background color="#333" gap={16} />

                  {!isExporting && (
                    <>
                      <Controls className="react-flow__controls bg-black border-beige/30 text-beige" />
                      <Panel
                        position="bottom-center"
                        className="react-flow__panel bg-black/70 text-beige/70 text-xs p-1 rounded"
                      >
                        Click on nodes to see details • Drag to reposition • Connect nodes by dragging from handles
                      </Panel>
                    </>
                  )}
                </ReactFlow>
              </div>
            </ReactFlowProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
