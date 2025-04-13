"use client"

import { memo } from "react"
import { type EdgeProps, getBezierPath, EdgeLabelRenderer } from "reactflow"

export const CustomEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, label, style = {} }: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })

    return (
      <>
        <path
          id={id}
          className="react-flow__edge-path"
          d={edgePath}
          style={{ ...style, stroke: "#d7c9aa", strokeWidth: 1.5 }}
        />
        {label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: "all",
              }}
              className="px-1.5 py-0.5 rounded text-xs bg-black text-beige border border-beige/20 shadow-sm"
            >
              {label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    )
  },
)

CustomEdge.displayName = "CustomEdge"
