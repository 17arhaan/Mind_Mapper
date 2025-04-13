import type { Node, Edge } from "reactflow"

export interface MindMapData {
  nodes: Node[]
  edges: Edge[]
}

export interface NodeData {
  label: string
  details?: string
  isMain?: boolean
  type?: string
}

export interface PromptAnalysis {
  mainConcept: string
  type: string
  topics: Topic[]
}

export interface Topic {
  name: string
  relation: string
  details?: string
  subtopics: Subtopic[]
}

export interface Subtopic {
  name: string
  relation: string
  details?: string
  children?: Detail[]
}

export interface Detail {
  name: string
  relation: string
  details?: string
}
