import React, { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/Button"
import { PromptCatalog } from "../components/prompts/PromptCatalog"
import { toolsService } from "../services/tools-service"
import { ratingsService } from "../services/ratings-service"
import type { Tool } from "../services/tools-service"
import { Header } from "../components/layout/Header"
import { SearchableDropdown } from "../components/prompts/SearchableDropdown"
import { CreatePromptModal } from "../components/prompts/CreatePromptModal"
import { FloatingActionButton } from "../components/ui/FloatingActionButton"
import Fuse, { FuseResult } from "fuse.js"
import { cn } from "../utils/cn"
import { SearchBar } from "../components/prompts/SearchBar"
import { ViewSelector, type PromptView } from "../components/prompts/ViewSelector"
import { TagChip } from '../components/ui/TagChip';
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore"
import { db } from "../utils/firebase"
import { PromptDetails } from "../components/prompts/PromptDetails"
import { Timestamp } from "firebase/firestore"

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
  const { currentUser } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [tools, setTools] = useState<Tool[]>([])
  const [savedToolIds, setSavedToolIds] = useState<Set<string>>(new Set())
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
  const [userRatings, setUserRatings] = useState<Record<string, number>>({})
  const [selectedPrompt, setSelectedPrompt] = useState<Tool | null>(null)
  const [matchMap, setMatchMap] = useState<Record<string, FuseResult<Tool>["matches"]>>({})
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null)

  // Memoize the filtered tools to prevent unnecessary recalculations
  const filteredTools = React.useMemo(() => {
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
    if (searchQuery.trim()) {
      try {
        const results = fuse.search(searchQuery.trim());
        fuseResults = results.map(r => r.item);
        setMatchMap(Object.fromEntries(results.map(r => [r.item.id!, r.matches])));
      } catch (error) {
        console.error('Search error:', error);
        fuseResults = tools;
        setMatchMap({});
      }
    } else {
      setMatchMap({});
    }

    // Combine with tag filters and view filters
    return fuseResults.filter((tool) => {
      // First check tag filters
      const matchesTags = Object.entries(selectedTags).every(([category, tags]) => {
        if (tags.length === 0) return true;
        return tags.every(tag => tool.tags[category as keyof typeof tool.tags]?.includes(tag));
      });

      if (!matchesTags) return false;

      // Then check view filters
      if (activeView === 'saved') {
        return tool.isSaved;
      } else if (activeView === 'created') {
        return tool.authorId === currentUser?.uid && tool.status === 'published';
      } else if (activeView === 'drafts') {
        return tool.authorId === currentUser?.uid && tool.status === 'draft';
      } else if (activeView === 'all') {
        // In 'all' view, only show published prompts
        return tool.status === 'published';
      }
      return false;
    });
  }, [tools, searchQuery, selectedTags, activeView, currentUser?.uid]);

  // Memoize the counts to prevent unnecessary recalculations
  const counts = React.useMemo(() => ({
    saved: tools.filter(t => t.isSaved).length,
    created: tools.filter(t => t.authorId === currentUser?.uid && t.status === 'published').length,
    drafts: tools.filter(t => t.authorId === currentUser?.uid && t.status === 'draft').length
  }), [tools, currentUser?.uid]);

  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);
    let savedToolIds: Set<string> = new Set();
    let latestDrafts: Tool[] = [];
    let latestPublished: Tool[] = [];

    // Helper to merge and dedupe
    const mergeAndSetTools = () => {
      // Create a map of all tools by ID
      const toolMap = new Map<string, Tool>();
      
      // First add all published tools
      latestPublished.forEach(tool => {
        if (tool.id) {
          toolMap.set(tool.id, tool);
        }
      });
      
      // Then add/override with drafts (drafts take precedence)
      latestDrafts.forEach(tool => {
        if (tool.id) {
          toolMap.set(tool.id, tool);
        }
      });
      
      // Convert map back to array
      setTools(Array.from(toolMap.values()));
    };

    // Listen to published tools
    const unsubPublishedTools = toolsService.listenToPublishedTools((publishedTools) => {
      latestPublished = publishedTools.map(tool => ({
        ...tool,
        isSaved: savedToolIds.has(tool.id!),
        userRating: userRatings[tool.id!]
      }));
      mergeAndSetTools();
      setIsLoading(false);
    });

    // Listen to user's drafts
    const unsubDrafts = toolsService.listenToUserDrafts(currentUser.uid, (draftTools) => {
      latestDrafts = draftTools.map(tool => ({
        ...tool,
        isSaved: savedToolIds.has(tool.id!),
        userRating: userRatings[tool.id!]
      }));
      mergeAndSetTools();
    });

    // Listen to user's saved tools
    const unsubSaved = toolsService.listenToUserSavedTools(currentUser.uid, (ids) => {
      savedToolIds = ids;
      // Update isSaved on all tools
      setTools(prevTools => prevTools.map(tool => ({
        ...tool,
        isSaved: savedToolIds.has(tool.id!)
      })));
    });

    // Listen to user's ratings
    const unsubRatings = toolsService.listenToUserRatings(currentUser.uid, (ratings) => {
      setUserRatings(ratings);
    });

    return () => {
      unsubPublishedTools();
      unsubDrafts();
      unsubSaved();
      unsubRatings();
    };
  }, [currentUser]);

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
    if (!currentUser || !tool.id) return;
    try {
      if (tool.isSaved) {
        await toolsService.unsaveTool(currentUser.uid, tool.id);
      } else {
        await toolsService.saveTool(currentUser.uid, tool.id);
      }
    } catch (error) {
      console.error("Error saving tool:", error);
    }
  }

  const handleRate = async (tool: Tool, rating: number) => {
    if (!currentUser || !tool.id) return
    try {
      const existingRating = await ratingsService.getUserRating(currentUser.uid, tool.id)
      
      if (existingRating) {
        await ratingsService.updateRating(existingRating.id!, { value: rating })
      } else {
        await ratingsService.createRating({
          toolId: tool.id,
          userId: currentUser.uid,
          value: rating
        })
      }
    } catch (error) {
      console.error("Error rating tool:", error)
    }
  }

  const handleShare = (tool: Tool) => {
    const shareableUrl = `${window.location.origin}/prompt/${tool.id}`;
    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        console.log('URL copied to clipboard:', shareableUrl);
      })
      .catch((error) => {
        console.error('Failed to copy URL:', error);
      });
  };

  const handleCreatePrompt = () => {
    setSelectedPrompt(null);
    setIsCreateModalOpen(true);
  }

  const handlePromptSubmit = async (prompt: Omit<Tool, "id" | "createdAt" | "updatedAt" | "saveCount" | "ratingAvg" | "ratingCount">) => {
    if (!currentUser) return;
    try {
      if (editingPromptId) {
        // Update existing prompt
        const updatedPrompt = {
          ...prompt,
          authorId: currentUser.uid,
          updatedAt: Timestamp.now(),
          status: prompt.status // Ensure we use the new status
        };
        
        await toolsService.updateTool(editingPromptId, updatedPrompt);
        setEditingPromptId(null);
      } else {
        // Create new prompt
        await toolsService.createTool({
          ...prompt,
          authorId: currentUser.uid
        });
      }
      // Close the modal
      setIsCreateModalOpen(false);
      // Clear the selected prompt
      setSelectedPrompt(null);
    } catch (error) {
      console.error("Failed to create/update prompt:", error);
    }
  };

  const handleDelete = async (prompt: Tool) => {
    if (!currentUser || !prompt.id) return;
    try {
      // First verify the user owns the prompt
      const toolRef = doc(db, "tools", prompt.id);
      const toolSnap = await getDoc(toolRef);
      
      if (!toolSnap.exists() || toolSnap.data().authorId !== currentUser.uid) {
        throw new Error("You don't have permission to delete this prompt");
      }
      
      await toolsService.deleteTool(prompt.id);
      
      // Update local state by removing the deleted prompt
      setTools(prevTools => prevTools.filter(tool => tool.id !== prompt.id));
      
      // Close the details view
      setSelectedPrompt(null);
      // Reset any editing state
      setEditingPromptId(null);
      // Close the create/edit modal
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  const handlePublish = async (prompt: Tool) => {
    if (!currentUser || !prompt.id) return;
    try {
      // First update the tool status to published
      await toolsService.updateTool(prompt.id, {
        status: "published" as const,
        updatedAt: Timestamp.now()
      });

      // Then update the local state
      setTools(prevTools => {
        // Remove the draft version
        const filteredTools = prevTools.filter(tool => tool.id !== prompt.id);
        // Add the published version
        return [
          ...filteredTools,
          { ...prompt, status: "published" as const }
        ];
      });

      // Close the details view and reset editing state
      setSelectedPrompt(null);
      setEditingPromptId(null);
    } catch (error) {
      console.error('Failed to publish prompt:', error);
    }
  };

  const handleEdit = async (prompt: Tool) => {
    if (!currentUser || !prompt.id) return;
    try {
      // Store the original prompt ID
      setEditingPromptId(prompt.id);
      
      // Set the prompt to edit and open the modal
      setSelectedPrompt(prompt);
      setIsCreateModalOpen(true);
    } catch (error) {
      console.error('Failed to edit prompt:', error);
      setEditingPromptId(null);
    }
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
        onSearch={q => setSearchQuery(q)}
        onOpenFilters={() => setIsFiltersOpen(true)}
      />
      
      <div className="flex-1 overflow-y-auto">
        {!selectedPrompt && (
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
        )}
        <div className="p-2 space-y-3">
          {!selectedPrompt && (
            <div className="flex flex-wrap gap-2 mb-2">
              {Object.entries(selectedTags).flatMap(([category, tags]) =>
                tags.map(tag => (
                  <TagChip key={category + tag} tag={tag} category={category}>
                    <button
                      className="hover:text-teal-900"
                      onClick={() => handleTagRemove(category as TagCategory, tag)}
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </TagChip>
                ))
              )}
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : selectedPrompt ? (
            <PromptDetails
              prompt={selectedPrompt}
              onClose={() => setSelectedPrompt(null)}
              onSave={() => handleSave(selectedPrompt)}
              onShare={() => handleShare(selectedPrompt)}
              onRate={(rating) => handleRate(selectedPrompt, rating)}
              onDelete={() => handleDelete(selectedPrompt)}
              onPublish={() => handlePublish(selectedPrompt)}
              onEdit={() => handleEdit(selectedPrompt)}
            />
          ) : (
            <PromptCatalog
              prompts={filteredTools}
              onSave={handleSave}
              onRate={handleRate}
              onShare={handleShare}
              onCreatePrompt={handleCreatePrompt}
              matchMap={matchMap}
              selectedPrompt={selectedPrompt}
              onSelectPrompt={setSelectedPrompt}
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

      <CreatePromptModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPromptId(null);
        }}
        onSubmit={handlePromptSubmit}
        availableTags={AVAILABLE_TAGS}
        isEditing={!!editingPromptId}
        initialDraft={editingPromptId ? selectedPrompt ?? undefined : undefined}
      />

      {!selectedPrompt && <FloatingActionButton onClick={handleCreatePrompt} />}

      {isFiltersOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsFiltersOpen(false)} />
          <div
            className="relative ml-auto max-w-full h-full bg-white shadow-xl p-6 border-l-4 border-blue-500"
            style={{ width: 320, backgroundColor: '#f8fafc' }}
          >
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
    </div>
  )
} 