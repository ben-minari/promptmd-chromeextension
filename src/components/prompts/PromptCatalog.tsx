import React, { useCallback } from "react"
import { PromptCard } from "./PromptCard"
import { Button } from "../ui/Button"
import type { Tool } from "../../services/tools-service"

interface PromptCatalogProps {
  prompts: Tool[]
  onSave?: (prompt: Tool) => void
  onRate?: (prompt: Tool, rating: number) => void
  onShare?: (prompt: Tool) => void
  onCreatePrompt?: () => void
  className?: string
  matchMap?: Record<string, any>
  emptyState?: {
    title: string
    description: string
    showCreate?: boolean
  }
  selectedPrompt: Tool | null
  onSelectPrompt: (prompt: Tool | null) => void
}

export function PromptCatalog({
  prompts,
  onSave,
  onRate,
  onShare,
  onCreatePrompt,
  className,
  matchMap = {},
  emptyState,
  selectedPrompt,
  onSelectPrompt
}: PromptCatalogProps) {
  const handleViewDetails = useCallback((prompt: Tool) => {
    onSelectPrompt(prompt);
  }, [onSelectPrompt]);

  if (prompts.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-slate-800">
          {emptyState?.title || 'No prompts found'}
        </h3>
        <p className="mt-2 text-sm text-slate-600 mb-4">
          {emptyState?.description || 'Try adjusting your search or filters'}
        </p>
        {emptyState?.showCreate && onCreatePrompt && (
          <Button
            variant="primary"
            onClick={onCreatePrompt}
            className="mt-4"
          >
            Create New Prompt
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
            onViewDetails={() => handleViewDetails(prompt)}
            match={matchMap[prompt.id!]}
          />
        ))}
      </div>
    </div>
  )
} 