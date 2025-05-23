import React, { useState, useEffect } from 'react';
import { SearchBar } from '../components/prompts/SearchBar';
import { PromptCatalog } from '../components/prompts/PromptCatalog';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { toolsService, type Tool } from '../services/tools-service';
import { Header } from '../components/layout/Header';
import { SearchableDropdown } from '../components/prompts/SearchableDropdown';
import { CreatePromptModal } from '../components/prompts/CreatePromptModal';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import Fuse from "fuse.js"

type TagCategory = 'specialty' | 'useCase' | 'userType' | 'appModel';

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
} as const;

const PublicApp = () => {
  const { currentUser, signInWithGoogle } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<{
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState<Omit<Tool, "id" | "createdAt" | "updatedAt" | "saveCount" | "ratingAvg" | "ratingCount"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const publishedTools = await toolsService.getPublishedTools();
      setTools(publishedTools || []);
    } catch (error) {
      console.error('Error loading tools:', error);
      setError('Failed to load tools. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = (tool: Tool) => {
    // Redirect to sign in if trying to save while not authenticated
    const handleSignIn = (e: React.MouseEvent) => {
      e.stopPropagation();
      signInWithGoogle();
    };
    handleSignIn(new MouseEvent('click') as any);
  };

  const handleRate = (tool: Tool, rating: number) => {
    // Redirect to sign in if trying to rate while not authenticated
    signInWithGoogle();
  };

  const handleShare = (tool: Tool) => {
    // TODO: Implement sharing functionality
    console.log('Sharing tool:', tool);
  };

  const handleCreatePrompt = () => {
    setIsCreateModalOpen(true);
  };

  const handlePromptSubmit = async (prompt: Omit<Tool, "id" | "createdAt" | "updatedAt" | "saveCount" | "ratingAvg" | "ratingCount">) => {
    if (!currentUser) {
      setDraftPrompt(prompt);
      setIsSignInModalOpen(true);
      setIsCreateModalOpen(false);
      return;
    }
    try {
      const newPrompt = await toolsService.createTool({
        ...prompt,
        authorId: currentUser.uid
      });
      loadTools();
    } catch (error) {
      console.error("Failed to create prompt:", error);
    }
  };

  const handleSignInSuccess = async () => {
    if (draftPrompt) {
      setIsCreateModalOpen(true);
    }
  };

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
    threshold: 0.35, // Adjust for strictness
    includeMatches: true
  });

  let fuseResults: typeof tools = tools;
  let matchMap: Record<string, Fuse.FuseResult<Tool>["matches"]> = {};
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
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
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-slate-800 mb-2">Welcome to PromptMD</h1>
          <p className="text-sm text-slate-600">
            Discover and use AI prompts for healthcare professionals.
            Sign in to save prompts and create your own.
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={handleCreatePrompt}
          >
            Create Your First Prompt
          </Button>
        </div>
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
            availableTags={{
              specialty: [...AVAILABLE_TAGS.specialty],
              useCase: [...AVAILABLE_TAGS.useCase],
              userType: [...AVAILABLE_TAGS.userType],
              appModel: [...AVAILABLE_TAGS.appModel]
            }}
            onSave={handleSave}
            onRate={handleRate}
            onShare={handleShare}
            onCreatePrompt={handleCreatePrompt}
            matchMap={matchMap}
          />
        )}
      </div>

      {/* Create Prompt Modal */}
      <CreatePromptModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setDraftPrompt(null);
        }}
        onSubmit={prompt => {
          handlePromptSubmit(prompt);
          setDraftPrompt(null);
        }}
        availableTags={{
          specialty: [...AVAILABLE_TAGS.specialty],
          useCase: [...AVAILABLE_TAGS.useCase],
          userType: [...AVAILABLE_TAGS.userType],
          appModel: [...AVAILABLE_TAGS.appModel]
        }}
        isAuthenticated={!!currentUser}
        onSignIn={(draft) => {
          setDraftPrompt(draft);
          setIsCreateModalOpen(false);
          setIsSignInModalOpen(true);
          signInWithGoogle();
        }}
        initialDraft={draftPrompt}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleCreatePrompt} />
    </div>
  );
};

export default PublicApp; 