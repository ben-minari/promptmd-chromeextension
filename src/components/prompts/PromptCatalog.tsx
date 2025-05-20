import React, { useState, useEffect } from "react"
import { PromptCard } from "./PromptCard"
import { SearchBar } from "./SearchBar"
import { TagFilterGroup } from "./TagFilterGroup"
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
  className?: string
}

export function PromptCatalog({
  prompts,
  availableTags,
  onSave,
  onRate,
  onShare,
  className
}: PromptCatalogProps) {
  const { currentUser } = useAuth()
  const [savedTools, setSavedTools] = React.useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<{
    specialty: string[]
    useCase: string[]
    userType: string[]
    appModel: string[]
  }>({
    specialty: [],
    useCase: [],
    userType: [],
    appModel: []
  })

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

  const handleTagSelect = (category: string, tag: string) => {
    setSelectedTags(prev => ({
      ...prev,
      [category]: prev[category].includes(tag)
        ? prev[category].filter(t => t !== tag)
        : [...prev[category], tag]
    }))
  }

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTags = Object.entries(selectedTags).every(([category, tags]) => {
      if (tags.length === 0) return true
      return tags.every(tag => prompt.tags[category].includes(tag))
    })
    
    return matchesSearch && matchesTags
  })

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold text-slate-800">No prompts found</h3>
        <p className="mt-2 text-sm text-slate-600">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-6 space-y-4">
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search prompts..."
        />
        <div className="space-y-4">
          <TagFilterGroup
            category="specialty"
            tags={availableTags.specialty}
            selectedTags={selectedTags.specialty}
            onTagSelect={handleTagSelect}
          />
          <TagFilterGroup
            category="useCase"
            tags={availableTags.useCase}
            selectedTags={selectedTags.useCase}
            onTagSelect={handleTagSelect}
          />
          <TagFilterGroup
            category="userType"
            tags={availableTags.userType}
            selectedTags={selectedTags.userType}
            onTagSelect={handleTagSelect}
          />
          <TagFilterGroup
            category="appModel"
            tags={availableTags.appModel}
            selectedTags={selectedTags.appModel}
            onTagSelect={handleTagSelect}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onSave={() => onSave?.(prompt)}
            onRate={(rating) => onRate?.(prompt, rating)}
            onShare={() => onShare?.(prompt)}
          />
        ))}
      </div>
    </div>
  )
} 