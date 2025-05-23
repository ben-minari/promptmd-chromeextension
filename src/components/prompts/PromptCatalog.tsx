import React, { useState, useEffect } from "react"
import { PromptCard } from "./PromptCard"
import { SearchBar } from "./SearchBar"
import { SearchableDropdown } from "./SearchableDropdown"
import { PromptDetails } from "./PromptDetails"
import { Button } from "../ui/Button"
import type { Tool } from "../../services/tools-service"
import { useAuth } from "../../contexts/AuthContext"
import { toolsService } from "../../services/tools-service"

interface PromptCatalogProps {
  prompts: Tool[]
  availableTags: {
    specialty: string[]
    useCase: string[]
    userType: string[]
    appModel: string[]
  }
  onSave?: (prompt: Tool) => void
  onRate?: (prompt: Tool, rating: number) => void
  onShare?: (prompt: Tool) => void
  onCreatePrompt?: () => void
  className?: string
  matchMap?: Record<string, any>
}

export function PromptCatalog({
  prompts,
  availableTags,
  onSave,
  onRate,
  onShare,
  onCreatePrompt,
  className,
  matchMap = {}
}: PromptCatalogProps) {
  const { currentUser } = useAuth()
  const [savedTools, setSavedTools] = React.useState<Set<string>>(new Set())
  const [selectedPrompt, setSelectedPrompt] = useState<Tool | null>(null)

  useEffect(() => {
    if (currentUser) {
      loadSavedTools()
    }
  }, [currentUser])

  const loadSavedTools = async () => {
    if (!currentUser) return
    try {
      const saved = await toolsService.getSavedTools(currentUser.uid)
      setSavedTools(new Set(saved.map((tool) => tool.id!)))
    } catch (error) {
      console.error("Failed to load saved tools:", error)
    }
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-slate-800">No prompts found</h3>
        <p className="mt-2 text-sm text-slate-600 mb-4">
          Try adjusting your search or filters
        </p>
        {onCreatePrompt && (
          <Button
            variant="primary"
            onClick={onCreatePrompt}
            className="mt-4"
          >
            Create Your First Prompt
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4">
        {prompts.map(prompt => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onSave={() => onSave?.(prompt)}
            onRate={(rating) => onRate?.(prompt, rating)}
            onShare={() => onShare?.(prompt)}
            onViewDetails={() => setSelectedPrompt(prompt)}
            match={matchMap[prompt.id!]}
          />
        ))}
      </div>

      {selectedPrompt && (
        <PromptDetails
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          onSave={() => {
            onSave?.(selectedPrompt)
            setSelectedPrompt(null)
          }}
          onShare={() => {
            onShare?.(selectedPrompt)
            setSelectedPrompt(null)
          }}
        />
      )}
    </div>
  )
} 