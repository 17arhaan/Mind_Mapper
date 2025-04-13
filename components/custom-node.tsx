"use client"

import { memo, useRef } from "react"
import { Handle, Position, type NodeProps } from "reactflow"

export const CustomNode = memo(({ data, id, isConnectable }: NodeProps) => {
  const { label, details, isMain, type } = data
  const nodeRef = useRef<HTMLDivElement>(null)

  // Determine styling based on node type
  const getNodeStyle = () => {
    if (isMain) {
      return "bg-beige text-black border-beige/70 font-semibold"
    }

    switch (type) {
      case "formula":
        return "bg-[#1a1a1a] text-beige border-beige/30 font-mono"
      case "definition":
        return "bg-[#1a1a1a] text-beige border-beige/30 italic"
      case "detail":
        return "bg-[#0a0a0a] text-beige/80 border-beige/20 text-sm"
      case "subtopic":
        return "bg-[#1a1a1a] text-beige border-beige/30"
      default:
        return "bg-[#1a1a1a] text-beige border-beige/30"
    }
  }

  const toggleDetails = () => {
    if (nodeRef.current) {
      nodeRef.current.classList.toggle("expanded")
    }
  }

  return (
    <div
      ref={nodeRef}
      className={`node-container px-4 py-2 rounded-md shadow-md border ${getNodeStyle()} transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-beige/50`}
      style={{
        minWidth: isMain ? 180 : 150,
        maxWidth: 250,
      }}
      onClick={toggleDetails}
      data-node-id={id}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!bg-beige/70" />

      <div className="text-center">
        <div className="font-medium">{label}</div>

        <div className="details-container hidden mt-2 text-xs opacity-90 text-left border-t border-beige/20 pt-1 max-h-[200px] overflow-y-auto">
          {details || `Information about ${label}`}
        </div>

        {details && !isMain && (
          <div className="expand-hint mt-1 text-xs opacity-70 text-center italic">Click to expand</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-beige/70" />
    </div>
  )
})

CustomNode.displayName = "CustomNode"
