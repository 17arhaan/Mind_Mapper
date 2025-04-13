import { MarkerType } from "reactflow"
import type { MindMapData } from "@/lib/types"
import { analyzePrompt } from "@/lib/prompt-analyzer"

// Main function to generate a mind map from a prompt
export async function generateMindMap(prompt: string): Promise<MindMapData> {
  try {
    // First, try to generate a structured mindmap using the API
    const mindmapData = await generateStructuredMindMap(prompt)
    if (mindmapData) {
      return mindmapData
    }

    // Fallback to the local analysis if API fails
    const analysis = await analyzePrompt(prompt)
    return convertAnalysisToMindMap(analysis)
  } catch (error) {
    console.error("Error generating mind map:", error)
    // Final fallback - generate a simple mind map
    return generateSimpleMindMap(prompt)
  }
}

// Generate a structured mindmap using the API
async function generateStructuredMindMap(prompt: string): Promise<MindMapData | null> {
  try {
    const response = await fetch("/api/generate-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Create a mind map structure for: "${prompt}".
        
        Format your response as follows:
        
        MAIN TOPIC: [Short title for the main topic]
        DESCRIPTION: [Brief description of the main topic]
        
        SUBTOPICS:
        1. [Subtopic 1]
           - [Detail 1]
           - [Detail 2]
        
        2. [Subtopic 2]
           - [Detail 1]
           - [Detail 2]
        
        3. [Subtopic 3]
           - [Detail 1]
           - [Detail 2]
        
        4. [Subtopic 4]
           - [Detail 1]
           - [Detail 2]
        
        5. [Subtopic 5]
           - [Detail 1]
           - [Detail 2]
        
        Keep each subtopic and detail short and concise.
        DO NOT provide the response as JSON or code.`,
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const content = data.content || ""

    // Parse the structured content and build the mind map
    return buildMindMapFromStructuredContent(content, prompt)
  } catch (error) {
    console.error("Error generating structured mindmap:", error)
    return null
  }
}

// Build a mind map from structured content
function buildMindMapFromStructuredContent(content: string, originalPrompt: string): MindMapData {
  console.log("Raw content from API:", content)

  // Initialize nodes and edges
  const nodes = []
  const edges = []

  // Extract the main topic
  let mainTopic = originalPrompt
  let mainDescription = `Mind map for: ${originalPrompt}`

  // Try to extract main topic from content
  const mainTopicMatch =
    content.match(/main topic:?\s*([^\n]+)/i) || content.match(/topic:?\s*([^\n]+)/i) || content.match(/^#\s*([^\n]+)/m)

  if (mainTopicMatch && mainTopicMatch[1]) {
    mainTopic = mainTopicMatch[1].trim()
  }

  // Try to extract main description - look for multi-line descriptions
  const mainDescMatch =
    content.match(/description:?\s*([^\n]+(?:\n[^\n]+)*)/i) || content.match(/overview:?\s*([^\n]+(?:\n[^\n]+)*)/i)

  if (mainDescMatch && mainDescMatch[1]) {
    // Get the full description, which might span multiple lines
    let fullDesc = mainDescMatch[1].trim()

    // If the description continues on the next lines (not starting with a keyword or bullet)
    const lines = content.split("\n")
    const startIndex = lines.findIndex((line) => line.includes(fullDesc.substring(0, 20)))

    if (startIndex >= 0) {
      let endIndex = startIndex + 1
      while (
        endIndex < lines.length &&
        !lines[endIndex].match(/^(main|topic|subtopic|overview|\d+\.|\*|-)/i) &&
        lines[endIndex].trim().length > 0
      ) {
        fullDesc += " " + lines[endIndex].trim()
        endIndex++
      }
    }

    mainDescription = fullDesc
  }

  // Create the main node
  nodes.push({
    id: "main",
    type: "custom",
    data: {
      label: mainTopic,
      details: mainDescription,
      isMain: true,
    },
    position: { x: 0, y: 0 },
  })

  // Extract subtopics using various patterns
  let subtopics = []

  // Try multiple approaches to extract subtopics

  // Approach 1: Look for numbered subtopics
  const numberedSubtopicRegex = /(?:^|\n)(?:\d+\.|$$\d+$$)\s*([^\n:]+)(?::?\s*([^\n]*))?/g
  let match
  while ((match = numberedSubtopicRegex.exec(content)) !== null) {
    const title = match[1].trim()
    const description = match[2] ? match[2].trim() : `Related to ${mainTopic}`

    // Skip if this looks like a header or is too short
    if (title.toLowerCase().includes("subtopic") || title.length < 3) continue

    subtopics.push({
      title,
      description,
      relation: "related to",
      details: extractDetails(content, title),
    })
  }

  // Approach 2: Look for bulleted lists if no numbered lists found
  if (subtopics.length === 0) {
    const bulletedSubtopicRegex = /(?:^|\n)(?:\*|-)\s*([^\n:]+)(?::?\s*([^\n]*))?/g
    while ((match = bulletedSubtopicRegex.exec(content)) !== null) {
      const title = match[1].trim()
      const description = match[2] ? match[2].trim() : `Related to ${mainTopic}`

      // Skip if this looks like a header or is too short
      if (title.toLowerCase().includes("subtopic") || title.length < 3) continue

      subtopics.push({
        title,
        description,
        relation: "related to",
        details: extractDetails(content, title),
      })
    }
  }

  // Approach 3: Look for lines that might be subtopics
  if (subtopics.length === 0) {
    const lines = content.split("\n")
    for (const line of lines) {
      const trimmedLine = line.trim()
      // Skip short lines, headers, or lines that look like instructions
      if (
        trimmedLine.length < 5 ||
        trimmedLine.startsWith("#") ||
        trimmedLine.toLowerCase().includes("topic:") ||
        trimmedLine.toLowerCase().includes("description:") ||
        trimmedLine.toLowerCase().includes("subtopic") ||
        trimmedLine.toLowerCase().includes("detail")
      )
        continue

      // If line is not too long and looks like a potential topic
      if (trimmedLine.length > 3 && trimmedLine.length < 50) {
        subtopics.push({
          title: trimmedLine,
          description: `Aspect of ${mainTopic}`,
          relation: "related to",
          details: [],
        })
      }

      // Limit to 6 subtopics
      if (subtopics.length >= 6) break
    }
  }

  // If still no subtopics, extract key phrases from the content
  if (subtopics.length === 0) {
    subtopics = extractKeyPhrases(content, originalPrompt)
  }

  // If still no subtopics, create some based on the original prompt
  if (subtopics.length === 0) {
    const words = originalPrompt
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .filter((word, index, self) => self.indexOf(word) === index)

    for (let i = 0; i < Math.min(5, words.length); i++) {
      subtopics.push({
        title: words[i],
        description: `Aspect of ${mainTopic}`,
        relation: "related to",
        details: [],
      })
    }
  }

  // Create nodes and edges for subtopics
  const topicCount = subtopics.length
  const radius = Math.max(250, 150 + topicCount * 20)

  subtopics.forEach((subtopic, index) => {
    const angle = (index / topicCount) * 2 * Math.PI
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)

    const nodeId = `topic-${index}`
    nodes.push({
      id: nodeId,
      type: "custom",
      data: {
        label: subtopic.title,
        details: subtopic.description,
        type: "topic",
      },
      position: { x, y },
    })

    // Create edge from main node to this topic
    edges.push({
      id: `edge-main-${index}`,
      source: "main",
      target: nodeId,
      label: subtopic.relation,
      type: "custom",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    })

    // Add details for each subtopic
    subtopic.details.forEach((detail, detailIndex) => {
      // Calculate position in a second ring around the subtopic
      const detailAngle =
        angle + ((detailIndex - (subtopic.details.length - 1) / 2) * 0.4) / Math.max(1, subtopic.details.length)
      const detailRadius = radius + 180
      const detailX = detailRadius * Math.cos(detailAngle)
      const detailY = detailRadius * Math.sin(detailAngle)

      const detailId = `detail-${index}-${detailIndex}`
      nodes.push({
        id: detailId,
        type: "custom",
        data: {
          label: detail.title,
          details: detail.description,
          type: "detail",
        },
        position: { x: detailX, y: detailY },
      })

      // Create edge from subtopic to detail
      edges.push({
        id: `edge-detail-${index}-${detailIndex}`,
        source: nodeId,
        target: detailId,
        label: detail.relation || "includes",
        type: "custom",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      })
    })
  })

  // Apply force-directed layout adjustments to prevent node overlap
  applyForceDirectedLayout(nodes, 50)

  return { nodes, edges }
}

// Extract key phrases that might be subtopics
function extractKeyPhrases(
  content: string,
  originalPrompt: string,
): Array<{
  title: string
  description: string
  relation: string
  details: Array<{ title: string; description: string; relation: string }>
}> {
  const phrases = []

  // Split content into sentences
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10)

  // Extract noun phrases or key terms from each sentence
  for (const sentence of sentences) {
    // Skip sentences that are too short or look like instructions
    if (
      sentence.length < 15 ||
      sentence.toLowerCase().includes("topic") ||
      sentence.toLowerCase().includes("subtopic") ||
      sentence.toLowerCase().includes("detail")
    )
      continue

    // Extract potential key phrases (3-5 word sequences)
    const words = sentence.trim().split(/\s+/)
    if (words.length >= 3) {
      // Try to extract a meaningful phrase
      const phraseLength = Math.min(5, Math.max(3, Math.floor(words.length / 2)))
      const startIndex = Math.floor((words.length - phraseLength) / 2)
      const phrase = words.slice(startIndex, startIndex + phraseLength).join(" ")

      phrases.push({
        title: phrase,
        description: sentence.trim(),
        relation: "related to",
        details: [],
      })

      // Limit to 5 phrases
      if (phrases.length >= 5) break
    }
  }

  // Add details to each phrase
  phrases.forEach((phrase) => {
    // Generate 1-2 details for each phrase
    phrase.details.push({
      title: `Key aspect of ${phrase.title}`,
      description: `Important characteristic related to ${phrase.title}`,
      relation: "includes",
    })

    // Add a second detail for some phrases
    if (Math.random() > 0.5) {
      phrase.details.push({
        title: `Application of ${phrase.title}`,
        description: `How ${phrase.title} is applied or used`,
        relation: "used for",
      })
    }
  })

  return phrases
}

// Extract details for a subtopic
function extractDetails(
  content: string,
  subtopic: string,
): Array<{ title: string; description: string; relation: string }> {
  const details = []

  // Find the subtopic in the content
  const subtopicIndex = content.indexOf(subtopic)
  if (subtopicIndex === -1) return generateGenericDetails(subtopic)

  // Look for details after the subtopic
  const afterSubtopic = content.substring(subtopicIndex + subtopic.length)

  // Try multiple approaches to extract details

  // Approach 1: Look for indented bullet points
  const bulletRegex = /(?:^|\n)\s+(?:\*|-)\s*([^\n:]+)(?::?\s*([^\n]*))?/g
  let match
  while ((match = bulletRegex.exec(afterSubtopic)) !== null && details.length < 3) {
    // Stop if we hit what looks like another main subtopic
    if (match[0].match(/^\s*\d+\./)) break

    const title = match[1].trim()
    const description = match[2] ? match[2].trim() : `Detail of ${subtopic}`

    // Skip if too short
    if (title.length < 2) continue

    details.push({
      title,
      description,
      relation: "includes",
    })

    // Only get a few details per subtopic
    if (details.length >= 3) break
  }

  // Approach 2: Look for any bullet points if no indented ones found
  if (details.length === 0) {
    const simpleBulletRegex = /(?:^|\n)(?:\*|-)\s*([^\n:]+)(?::?\s*([^\n]*))?/g

    // Reset lastIndex to start from the beginning of afterSubtopic
    simpleBulletRegex.lastIndex = 0

    while ((match = simpleBulletRegex.exec(afterSubtopic)) !== null && details.length < 3) {
      const title = match[1].trim()
      const description = match[2] ? match[2].trim() : `Detail of ${subtopic}`

      // Skip if too short
      if (title.length < 2) continue

      details.push({
        title,
        description,
        relation: "includes",
      })

      // Only get a few details per subtopic
      if (details.length >= 3) break
    }
  }

  // Approach 3: Look for sentences that might be details
  if (details.length === 0) {
    const sentences = afterSubtopic.split(/[.!?]+/).filter((s) => s.trim().length > 0)

    // Take the first 1-2 sentences as details
    for (let i = 0; i < Math.min(2, sentences.length); i++) {
      const sentence = sentences[i].trim()

      // Skip if too short or looks like a header
      if (sentence.length < 10 || sentence.toLowerCase().includes("subtopic")) continue

      // Use more of the sentence as the description
      details.push({
        title: sentence.length > 40 ? sentence.substring(0, 40) + "..." : sentence,
        description: sentence, // Use the full sentence
        relation: "includes",
      })

      if (details.length >= 2) break
    }
  }

  // If no details found, create some generic ones
  if (details.length === 0) {
    return generateGenericDetails(subtopic)
  }

  return details
}

// Generate generic details for a subtopic
function generateGenericDetails(subtopic: string): Array<{ title: string; description: string; relation: string }> {
  return [
    {
      title: `Key aspect of ${subtopic}`,
      description: `This represents an important characteristic or feature related to ${subtopic}. Understanding this aspect provides deeper insight into how ${subtopic} functions and its significance in the broader context.`,
      relation: "includes",
    },
    {
      title: `Application of ${subtopic}`,
      description: `This shows how ${subtopic} is applied or used in practical scenarios. Real-world applications demonstrate the value and utility of ${subtopic} in solving problems or addressing needs.`,
      relation: "used for",
    },
  ]
}

// Convert analysis result to mind map data
function convertAnalysisToMindMap(analysis: any): MindMapData {
  // Generate nodes and edges based on the analysis
  const nodes = []
  const edges = []

  // Create the main/central node
  nodes.push({
    id: "main",
    type: "custom",
    data: {
      label: analysis.mainConcept,
      details: `This mind map explores ${analysis.mainConcept} in detail, showing key concepts and relationships.`,
      isMain: true,
    },
    position: { x: 0, y: 0 },
  })

  // Create nodes for main topics in a circular pattern
  const topicCount = analysis.topics.length
  const radius = Math.max(250, 150 + topicCount * 20) // Adjust radius based on number of topics

  analysis.topics.forEach((topic, index) => {
    const angle = (index / topicCount) * 2 * Math.PI
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)

    const nodeId = `topic-${index}`
    nodes.push({
      id: nodeId,
      type: "custom",
      data: {
        label: topic.name,
        details: topic.details || `Key aspects of ${topic.name} related to ${analysis.mainConcept}.`,
        type: "topic",
      },
      position: { x, y },
    })

    // Create edge from main node to this topic
    edges.push({
      id: `edge-main-${index}`,
      source: "main",
      target: nodeId,
      label: topic.relation,
      type: "custom",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    })

    // Create subtopic nodes
    topic.subtopics.forEach((subtopic, subIndex) => {
      // Calculate position in a second ring around the main topic
      // This creates a fan-like arrangement around each topic
      const subtopicAngle =
        angle + ((subIndex - (topic.subtopics.length - 1) / 2) * 0.8) / Math.max(1, topic.subtopics.length - 1)
      const subtopicRadius = radius + 180
      const subtopicX = subtopicRadius * Math.cos(subtopicAngle)
      const subtopicY = subtopicRadius * Math.sin(subtopicAngle)

      const subtopicId = `subtopic-${index}-${subIndex}`
      nodes.push({
        id: subtopicId,
        type: "custom",
        data: {
          label: subtopic.name,
          details: subtopic.details || `${subtopic.name} is a key aspect of ${topic.name}.`,
          type: "subtopic",
        },
        position: { x: subtopicX, y: subtopicY },
      })

      // Create edge from topic to subtopic
      edges.push({
        id: `edge-subtopic-${index}-${subIndex}`,
        source: nodeId,
        target: subtopicId,
        label: subtopic.relation,
        type: "custom",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      })

      // Add details for some subtopics (if they exist)
      if (subtopic.children && subtopic.children.length > 0) {
        subtopic.children.forEach((detail, detailIndex) => {
          const detailAngle =
            subtopicAngle +
            ((detailIndex - (subtopic.children.length - 1) / 2) * 0.4) / Math.max(1, subtopic.children.length - 1)
          const detailRadius = subtopicRadius + 150
          const detailX = detailRadius * Math.cos(detailAngle)
          const detailY = detailRadius * Math.sin(detailAngle)

          const detailId = `detail-${index}-${subIndex}-${detailIndex}`
          nodes.push({
            id: detailId,
            type: "custom",
            data: {
              label: detail.name,
              details: detail.details || `${detail.name} - ${detail.relation} ${subtopic.name}.`,
              type: "detail",
            },
            position: { x: detailX, y: detailY },
          })

          // Create edge from subtopic to detail
          edges.push({
            id: `edge-detail-${index}-${subIndex}-${detailIndex}`,
            source: subtopicId,
            target: detailId,
            label: detail.relation,
            type: "custom",
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          })
        })
      }
    })
  })

  // Apply force-directed layout adjustments to prevent node overlap
  applyForceDirectedLayout(nodes, 50)

  return { nodes, edges }
}

// Generate a simple mind map as a last resort fallback
function generateSimpleMindMap(prompt: string): MindMapData {
  const words = prompt.split(/\s+/).filter((word) => word.length > 3)
  const uniqueWords = [...new Set(words)].slice(0, 10) // Limit to 10 unique words

  const centerNode = {
    id: "main",
    type: "custom",
    data: {
      label: prompt.split(/\s+/).slice(0, 3).join(" ") + "...",
      details: prompt,
      isMain: true,
    },
    position: { x: 0, y: 0 },
  }

  const nodes = [centerNode]
  const edges = []

  // Create nodes in a circular pattern around the center
  uniqueWords.forEach((word, index) => {
    const angle = (index / uniqueWords.length) * 2 * Math.PI
    const radius = 200
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)

    const nodeId = `node-${index}`
    nodes.push({
      id: nodeId,
      type: "custom",
      data: {
        label: word,
        details: `Related to ${prompt}`,
        type: "topic",
      },
      position: { x, y },
    })

    edges.push({
      id: `edge-${index}`,
      source: "main",
      target: nodeId,
      label: "related to",
      type: "custom",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    })
  })

  return { nodes, edges }
}

// Helper function to apply a simple force-directed layout to prevent node overlap
function applyForceDirectedLayout(nodes: any[], minDistance: number): void {
  const iterations = 20
  const repulsionForce = 0.5

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i]

      // Skip the main node to keep it centered
      if (nodeA.id === "main") continue

      let dx = 0
      let dy = 0

      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue

        const nodeB = nodes[j]
        const deltaX = nodeA.position.x - nodeB.position.x
        const deltaY = nodeA.position.y - nodeB.position.y

        // Calculate distance between nodes
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        // Apply repulsive force if nodes are too close
        if (distance < minDistance && distance > 0) {
          const force = (repulsionForce * (minDistance - distance)) / distance
          dx += deltaX * force
          dy += deltaY * force
        }
      }

      // Apply the calculated force
      nodeA.position.x += dx
      nodeA.position.y += dy

      // Keep nodes from moving too far from center
      const distanceFromCenter = Math.sqrt(nodeA.position.x * nodeA.position.x + nodeA.position.y * nodeA.position.y)

      if (distanceFromCenter > 800) {
        const angle = Math.atan2(nodeA.position.y, nodeA.position.x)
        nodeA.position.x = 800 * Math.cos(angle)
        nodeA.position.y = 800 * Math.sin(angle)
      }
    }
  }
}

// This function is kept for backward compatibility
export function generateMindMapFromPrompt(prompt: string): MindMapData {
  return generateSimpleMindMap(prompt)
}
