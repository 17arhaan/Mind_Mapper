"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, Loader2 } from "lucide-react"
import { MindMapDialog } from "@/components/mind-map-dialog"
import { generateMindMapFromPrompt } from "@/lib/mind-map-generator"
import type { MindMapData } from "@/lib/types"

export function PromptMapper() {
  const [prompt, setPrompt] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleGenerateMindMap = async () => {
    if (!prompt.trim() || isAnalyzing) return

    setIsAnalyzing(true)

    try {
      // Generate mind map from the prompt
      const data = generateMindMapFromPrompt(prompt)
      setMindMapData(data)
      setDialogOpen(true)
    } catch (error) {
      console.error("Error generating mind map:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleGenerateMindMap()
    }
  }

  return (
    <>
      <Card className="bg-black border-beige/20">
        <CardContent className="pt-6">
          <Textarea
            ref={textareaRef}
            placeholder="Enter any prompt and press Enter to generate a mind map..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] mb-4 bg-black text-beige border-beige/30 focus:border-beige/50 placeholder:text-beige/40"
          />
          <div className="flex gap-2 justify-end">
            <Button
              onClick={handleGenerateMindMap}
              disabled={!prompt.trim() || isAnalyzing}
              className="bg-beige hover:bg-beige/90 text-black"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Generate Mind Map
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <MindMapDialog open={dialogOpen} onOpenChange={setDialogOpen} mindMapData={mindMapData} prompt={prompt} />
    </>
  )
}
