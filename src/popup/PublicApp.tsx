import React, { useState, useEffect } from 'react';
import { SearchBar } from '../components/prompts/SearchBar';
import { TagFilterGroup } from '../components/prompts/TagFilterGroup';
import { PromptCatalog } from '../components/prompts/PromptCatalog';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { toolsService, type Tool } from '../services/tools-service';

type TagCategory = 'specialty' | 'useCase' | 'userType' | 'appModel';

const AVAILABLE_TAGS = {
  specialty: [
    "primary_care",
    "emergency",
    "pediatrics",
    "surgery",
    "psychiatry"
  ],
  useCase: [
    "handoff",
    "communication",
    "triage",
    "documentation",
    "workflow"
  ],
  userType: [
    "physician",
    "nurse",
    "resident",
    "student",
    "admin"
  ],
  appModel: [
    "gpt4",
    "claude",
    "gemini",
    "llama"
  ]
} as const;

const PublicApp = () => {
  const { signInWithGoogle } = useAuth();
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

  const handleTagSelect = (category: string, tag: string) => {
    if (!Object.keys(AVAILABLE_TAGS).includes(category)) return;
    const typedCategory = category as TagCategory;
    setSelectedTags(prev => ({
      ...prev,
      [typedCategory]: prev[typedCategory].includes(tag)
        ? prev[typedCategory].filter((t: string) => t !== tag)
        : [...prev[typedCategory], tag]
    }));
  };

  const handleSave = (tool: Tool) => {
    // Redirect to sign in if trying to save while not authenticated
    signInWithGoogle();
  };

  const handleRate = (tool: Tool, rating: number) => {
    // Redirect to sign in if trying to rate while not authenticated
    signInWithGoogle();
  };

  const handleShare = (tool: Tool) => {
    // TODO: Implement sharing functionality
    console.log('Sharing tool:', tool);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Prompt Catalog</h1>
        <Button
          variant="primary"
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </Button>
      </div>

      <div className="space-y-4">
        <SearchBar
          onSearch={(query) => console.log('Search:', query)}
          placeholder="Search prompts..."
        />
        <div className="space-y-4">
          <TagFilterGroup
            category="specialty"
            tags={[...AVAILABLE_TAGS.specialty]}
            selectedTags={selectedTags.specialty}
            onTagSelect={handleTagSelect}
          />
          <TagFilterGroup
            category="useCase"
            tags={[...AVAILABLE_TAGS.useCase]}
            selectedTags={selectedTags.useCase}
            onTagSelect={handleTagSelect}
          />
          <TagFilterGroup
            category="userType"
            tags={[...AVAILABLE_TAGS.userType]}
            selectedTags={selectedTags.userType}
            onTagSelect={handleTagSelect}
          />
          <TagFilterGroup
            category="appModel"
            tags={[...AVAILABLE_TAGS.appModel]}
            selectedTags={selectedTags.appModel}
            onTagSelect={handleTagSelect}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <PromptCatalog
          prompts={tools}
          availableTags={{
            specialty: [...AVAILABLE_TAGS.specialty],
            useCase: [...AVAILABLE_TAGS.useCase],
            userType: [...AVAILABLE_TAGS.userType],
            appModel: [...AVAILABLE_TAGS.appModel]
          }}
          onSave={handleSave}
          onRate={handleRate}
          onShare={handleShare}
        />
      )}
    </div>
  );
};

export default PublicApp; 