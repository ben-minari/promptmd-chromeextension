import React, { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/Button"
import { PromptCatalog } from "../components/prompts/PromptCatalog"
import { toolsService } from "../services/tools-service"
import type { Tool } from "../services/tools-service"
import { Header } from "../components/layout/Header"
import { SearchableDropdown } from "../components/prompts/SearchableDropdown"
import { CreatePromptModal } from "../components/prompts/CreatePromptModal"
import { FloatingActionButton } from "../components/ui/FloatingActionButton"
import Fuse, { FuseResult } from "fuse.js"
import { cn } from "../utils/cn"
import { SearchBar } from "../components/prompts/SearchBar"
import { ViewSelector, type PromptView } from "../components/prompts/ViewSelector"

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
    'Physician',
    'Nurse',
    'Resident',
    'Student',
    'Admin'
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

interface AuthenticatedAppProps {
  isFiltersOpen: boolean;
  setIsFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AuthenticatedApp({ isFiltersOpen, setIsFiltersOpen }: AuthenticatedAppProps) {
  const { currentUser, logout, switchAccount } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<Record<TagCategory, string[]>>({
    specialty: [],
    useCase: [],
    userType: [],
    appModel: []
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [activeView, setActiveView] = useState<PromptView>('all')

  useEffect(() => {
    loadTools()
  }, [activeView])

  const loadTools = async () => {
    if (!currentUser) return

    setIsLoading(true)
    setError(null)
    try {
      let loadedTools: Tool[] = []
      
      switch (activeView) {
        case 'saved':
          loadedTools = await toolsService.getSavedTools(currentUser.uid)
          break
        case 'created':
          loadedTools = await toolsService.getToolsByAuthor(currentUser.uid)
          break
        case 'drafts':
          loadedTools = await toolsService.getDraftTools(currentUser.uid)
          break
        default:
          loadedTools = await toolsService.getPublishedTools()
      }
      
      setTools(loadedTools || [])
    } catch (error) {
      console.error("Error loading tools:", error)
      setError("Failed to load tools. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleCreatePrompt = () => {
    setIsCreateModalOpen(true)
  }

  const handlePromptSubmit = async (prompt: Omit<Tool, "id" | "createdAt" | "updatedAt" | "saveCount" | "ratingAvg" | "ratingCount">) => {
    try {
      const newPrompt = await toolsService.createTool({
        ...prompt,
        authorId: currentUser!.uid
      })
      // Refresh the prompts list
      loadTools()
    } catch (error) {
      console.error("Failed to create prompt:", error)
    }
  }

  // Fuzzy search setup
  const fuse = new Fuse(tools, {
    keys: [
      "title",
      "description",
      { name: "tags.specialty", weight: 0.7 },
      { name: "tags.useCase", weight: 0.7 },
      { name: "tags.userType", weight: 0.7 },
      { name: "tags.appModel", weight: 0.7 }
    ],
    threshold: 0.35,
    includeMatches: true
  });

  let fuseResults: typeof tools = tools;
  let matchMap: Record<string, FuseResult<Tool>["matches"]> = {};
  if (searchQuery.trim()) {
    const results = fuse.search(searchQuery.trim());
    fuseResults = results.map(r => r.item);
    matchMap = Object.fromEntries(results.map(r => [r.item.id!, r.matches]));
  }

  // Combine with tag filters
  const filteredTools = fuseResults.filter((tool) => {
    const matchesTags = Object.entries(selectedTags).every(([category, tags]) => {
      if (tags.length === 0) return true;
      return tags.every(tag => tool.tags[category as keyof typeof tool.tags]?.includes(tag));
    });
    return matchesTags;
  });

  // Calculate counts for badges
  const counts = {
    saved: tools.filter(t => t.isSaved).length,
    created: tools.filter(t => t.authorId === currentUser?.uid).length,
    drafts: tools.filter(t => t.authorId === currentUser?.uid && t.status === 'draft').length
  };

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
        onSearch={q => { console.log('search:', q); setSearchQuery(q); }}
        onOpenFilters={() => { console.log('open filters'); setIsFiltersOpen(true); }}
      />
      
      <div className="flex-1 overflow-y-auto">
        {/* Segmented Control - now sticky and compact */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-2 py-2">
          <ViewSelector
            activeView={activeView}
            onViewChange={setActiveView}
            savedCount={counts.saved}
            createdCount={counts.created}
            draftsCount={counts.drafts}
            className=""
          />
        </div>
        <div className="p-2 space-y-3">
          {/* Selected Filters as Chips */}
          <div className="flex flex-wrap gap-2 mb-2">
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
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : (
            <PromptCatalog
              prompts={filteredTools}
              onSave={handleSave}
              onRate={handleRate}
              onShare={handleShare}
              onCreatePrompt={handleCreatePrompt}
              matchMap={matchMap}
              emptyState={{
                title:
                  activeView === 'all' ? 'No prompts found' :
                  activeView === 'saved' ? 'No saved prompts' :
                  activeView === 'created' ? 'No created prompts' :
                  activeView === 'drafts' ? 'No draft prompts' :
                  'No prompts found',
                description:
                  activeView === 'all' ? 'Try adjusting your search or filters' :
                  activeView === 'saved' ? 'Save prompts to access them here' :
                  activeView === 'created' ? 'Create your first prompt' :
                  activeView === 'drafts' ? 'Start drafting a new prompt' :
                  'Try adjusting your search or filters',
                showCreate: activeView !== 'saved'
              }}
            />
          )}
        </div>
      </div>

      {/* Create Prompt Modal */}
      <CreatePromptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handlePromptSubmit}
        availableTags={AVAILABLE_TAGS}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleCreatePrompt} />

      {isFiltersOpen && (console.log('Sidebar open!'), (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => { console.log('Overlay clicked, closing sidebar'); setIsFiltersOpen(false); }} />
          {/* Sidebar content */}
          <div
            className="relative ml-auto max-w-full h-full bg-white shadow-xl p-6 border-l-4 border-blue-500"
            style={{ width: 320, backgroundColor: '#f8fafc' }}
          >
            <button
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
              onClick={() => { console.log('Close button clicked'); setIsFiltersOpen(false); }}
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
      ))}

      console.log('filteredTools:', filteredTools);
    </div>
  )
} 