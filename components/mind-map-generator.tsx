"use client"

import { useState } from "react"
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeChange,
  applyNodeChanges,
  MarkerType,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Zap } from "lucide-react"
import { toPng } from "html-to-image"

export function MindMapGenerator() {
  const [prompt, setPrompt] = useState("")
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const onNodesChange = (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds))
  }

  const generateMindMap = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    try {
      // This is a simplified algorithm to generate a mind map
      // In a real app, you might use an AI model to generate a more meaningful structure
      const words = prompt.split(/\s+/).filter((word) => word.length > 3)
      const uniqueWords = [...new Set(words)].slice(0, 10) // Limit to 10 unique words

      const centerNode = {
        id: "center",
        data: { label: prompt.split(/\s+/).slice(0, 3).join(" ") + "..." },
        position: { x: 250, y: 250 },
        style: {
          background: "#7c3aed",
          color: "white",
          border: "1px solid #5b21b6",
          borderRadius: "8px",
          padding: "10px",
          width: 180,
        },
      }

      const newNodes: Node[] = [centerNode]
      const newEdges: Edge[] = []

      // Create nodes in a circular pattern around the center
      uniqueWords.forEach((word, index) => {
        const angle = (index / uniqueWords.length) * 2 * Math.PI
        const radius = 200
        const x = 250 + radius * Math.cos(angle)
        const y = 250 + radius * Math.sin(angle)

        const nodeId = `node-${index}`
        newNodes.push({
          id: nodeId,
          data: { label: word },
          position: { x, y },
          style: {
            background: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "10px",
            width: 120,
          },
        })

        newEdges.push({
          id: `edge-${index}`,
          source: "center",
          target: nodeId,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { stroke: "#9ca3af" },
        })
      })

      setNodes(newNodes)
      setEdges(newEdges)
    } catch (error) {
      console.error("Error generating mind map:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportAsPng = () => {
    const flowElement = document.querySelector(".react-flow") as HTMLElement
    if (flowElement) {
      toPng(flowElement, { backgroundColor: "#ffffff" })
        .then((dataUrl) => {
          const link = document.createElement("a")
          link.download = "mindmap.png"
          link.href = dataUrl
          link.click()
        })
        .catch((error) => {
          console.error("Error exporting mind map:", error)
        })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <Textarea
            placeholder="Enter your idea or concept here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] mb-4"
          />
          <div className="flex gap-2 justify-end">
            <Button
              onClick={generateMindMap}
              disabled={!prompt.trim() || isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="mr-2 h-4 w-4" />
              Generate Mind Map
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="h-[600px] border rounded-lg overflow-hidden bg-white">
        {nodes.length > 0 ? (
          <>
            <div className="p-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={exportAsPng}>
                <Download className="mr-2 h-4 w-4" />
                Export as PNG
              </Button>
            </div>
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} fitView>
              <Controls />
              <Background />
            </ReactFlow>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Enter a prompt and generate a mind map to see it here
          </div>
        )}
      </div>
    </div>
  )
}
