import { useState, useEffect } from "react"
import type { Prompt } from "../types"
import { useDebounce } from "./useDebounce"

export function usePromptSearch(prompts: Prompt[]) {
  const [search, setSearch] = useState("")
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    const filtered = prompts.filter(prompt => 
      prompt.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      prompt.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      prompt.category.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      prompt.specialty.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      prompt.tools.some(tool => tool.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase())))
    )
    setFilteredPrompts(filtered)
  }, [debouncedSearch, prompts])

  return {
    search,
    setSearch,
    filteredPrompts
  }
} 