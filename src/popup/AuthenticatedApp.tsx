import React from "react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/Button"
import { PromptCatalog } from "../components/prompts/PromptCatalog"
import { toolsService } from "../services/tools-service"
import type { Tool } from "../services/tools-service"
import { Header } from "../components/layout/Header"
import { SearchableDropdown } from "../components/prompts/SearchableDropdown"

const AVAILABLE_TAGS = {
  specialty: [
    'Allergy & Immunology',
    'Cardiology',
    'Dermatology',
    'Emergency Medicine',
    'Endocrinology',
    'Gastroenterology',
    'Geriatrics',
    'Hematology/Oncology',
    'Hospitalist Medicine',
    'Infectious Diseases',
    'Internal Medicine',
    'Nephrology',
    'Neurology',
    'OB/GYN',
    'Ophthalmology',
    'Orthopedics',
    'Otolaryngology (ENT)',
    'Pediatrics',
    'Physical Medicine & Rehab',
    'Psychiatry',
    'Pulmonology/Critical Care',
    'Primary Care',
    'Radiology',
    'Rheumatology',
    'Surgery'
  ],
  useCase: [
    'Patient Education',
    'Clinical Documentation',
    'Decision Support',
    'Workflow Automation',
    'Triage',
    'Medication Management',
    'Discharge Planning',
    'Quality & Safety Monitoring',
    'Population Health Analytics',
    'Care Coordination',
    'Billing & Coding Assistance',
    'Consultation',
    'Referral',
    'Assessment'
  ],
  userType: [
    'physician',
    'nurse',
    'resident',
    'student',
    'admin'
  ],
  appModel: [
    'ChatGPT',
    'Claude',
    'Gemini',
    'LLaMA',
    'Med-PaLM',
    'Perplexity',
    'Doximity GPT',
    'OpenEvidence',
    'Mistral'
  ]
}

type TagCategory = 'specialty' | 'useCase' | 'userType' | 'appModel';

export default function AuthenticatedApp() {
  const { currentUser, logout, switchAccount } = useAuth()
  const [tools, setTools] = React.useState<Tool[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedTags, setSelectedTags] = React.useState<{
    specialty: string[];
    useCase: string[];
    userType: string[];
    appModel: string[];
  }>({
    specialty: [],
    useCase: [],
    userType: [],
    appModel: []
  });
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const loadTools = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const tools = await toolsService.getPublishedTools()
        setTools(tools || [])
      } catch (error) {
        console.error("Error loading tools:", error)
        setError("Failed to load tools. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    loadTools()
  }, [])

  const handleTagSelect = (category: TagCategory, tag: string) => {
    setSelectedTags(prev => ({
      ...prev,
      [category]: prev[category].includes(tag)
        ? prev[category].filter(t => t !== tag)
        : [...prev[category], tag]
    }));
  };

  const handleTagRemove = (category: TagCategory, tag: string) => {
    setSelectedTags(prev => ({
      ...prev,
      [category]: prev[category].filter(t => t !== tag)
    }));
  };

  const handleSave = async (tool: Tool) => {
    if (!currentUser || !tool.id) return
    try {
      await toolsService.saveTool(currentUser.uid, tool.id)
    } catch (error) {
      console.error("Error saving tool:", error)
    }
  }

  const handleRate = async (tool: Tool, rating: number) => {
    if (!currentUser || !tool.id) return
    try {
      // TODO: Implement rating functionality
      console.log("Rating tool:", tool.id, rating)
    } catch (error) {
      console.error("Error rating tool:", error)
    }
  }

  const handleShare = (tool: Tool) => {
    // TODO: Implement sharing functionality
    console.log("Sharing tool:", tool)
  }

  // Filter tools based on search and selected tags
  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTags = Object.entries(selectedTags).every(([category, tags]) => {
      if (tags.length === 0) return true
      return tags.every(tag => tool.tags[category as keyof typeof tool.tags]?.includes(tag))
    })
    return matchesSearch && matchesTags
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header 
        onSearch={setSearchQuery}
        onOpenFilters={() => setIsFiltersOpen((open) => !open)}
      />
      {/* Filters Sidebar */}
      {isFiltersOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsFiltersOpen(false)} />
          {/* Sidebar */}
          <div className="relative ml-auto w-50 max-w-full h-full bg-white shadow-xl p-6 border-l border-slate-200">
            <button
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
              onClick={() => setIsFiltersOpen(false)}
            >
              Close
            </button>
            <div className="mt-8 space-y-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setSelectedTags({ specialty: [], useCase: [], userType: [], appModel: [] })}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-teal-700 border border-slate-200 rounded"
                >
                  Clear All Filters
                </button>
              </div>
              <SearchableDropdown
                label="Specialty"
                options={[...AVAILABLE_TAGS.specialty]}
                selectedOptions={selectedTags.specialty}
                onSelect={(tag) => handleTagSelect('specialty', tag)}
                onRemove={(tag) => handleTagRemove('specialty', tag)}
                onClearAll={() => setSelectedTags(prev => ({ ...prev, specialty: [] }))}
                placeholder="Search specialties..."
              />
              <SearchableDropdown
                label="Use Case"
                options={[...AVAILABLE_TAGS.useCase]}
                selectedOptions={selectedTags.useCase}
                onSelect={(tag) => handleTagSelect('useCase', tag)}
                onRemove={(tag) => handleTagRemove('useCase', tag)}
                onClearAll={() => setSelectedTags(prev => ({ ...prev, useCase: [] }))}
                placeholder="Search use cases..."
              />
              <SearchableDropdown
                label="User Type"
                options={[...AVAILABLE_TAGS.userType]}
                selectedOptions={selectedTags.userType}
                onSelect={(tag) => handleTagSelect('userType', tag)}
                onRemove={(tag) => handleTagRemove('userType', tag)}
                onClearAll={() => setSelectedTags(prev => ({ ...prev, userType: [] }))}
                placeholder="Search user types..."
              />
              <SearchableDropdown
                label="AI Model"
                options={[...AVAILABLE_TAGS.appModel]}
                selectedOptions={selectedTags.appModel}
                onSelect={(tag) => handleTagSelect('appModel', tag)}
                onRemove={(tag) => handleTagRemove('appModel', tag)}
                onClearAll={() => setSelectedTags(prev => ({ ...prev, appModel: [] }))}
                placeholder="Search AI models..."
              />
            </div>
          </div>
        </div>
      )}
      <div className="p-4 space-y-4">
        {/* Selected Filters as Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(selectedTags).flatMap(([category, tags]) =>
            tags.map(tag => (
              <span key={category + tag} className="flex items-center gap-1 px-2 py-1 text-xs bg-teal-100 text-teal-700 rounded-full">
                <span>{tag}</span>
                <button
                  className="hover:text-teal-900"
                  onClick={() => handleTagRemove(category as TagCategory, tag)}
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <PromptCatalog
            prompts={filteredTools}
            availableTags={AVAILABLE_TAGS}
            onSave={handleSave}
            onRate={handleRate}
            onShare={handleShare}
          />
        )}
      </div>
    </div>
  )
} 