import React, { useState } from "react"
import { Button } from "../ui/Button"
import { X, Plus, Trash2 } from "lucide-react"
import { cn } from "../../utils/cn"
import type { Tool } from "../../services/tools-service"
import { useAuth } from "../../contexts/AuthContext"
import { SearchableDropdown } from "./SearchableDropdown"

interface CreatePromptModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (prompt: Omit<Tool, "id" | "createdAt" | "updatedAt" | "saveCount" | "ratingAvg" | "ratingCount">) => Promise<void>
  availableTags: {
    specialty: string[]
    useCase: string[]
    userType: string[]
    appModel: string[]
  }
  isEditing?: boolean
  initialDraft?: Omit<Tool, "id" | "createdAt" | "updatedAt" | "saveCount" | "ratingAvg" | "ratingCount">
  isAuthenticated: boolean
  onSignIn: (draft: Omit<Tool, "id" | "createdAt" | "updatedAt" | "saveCount" | "ratingAvg" | "ratingCount">) => void
}

export function CreatePromptModal({ isOpen, onClose, onSubmit, availableTags, isEditing, initialDraft, isAuthenticated, onSignIn }: CreatePromptModalProps) {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<Tool, "id" | "createdAt" | "updatedAt" | "saveCount" | "ratingAvg" | "ratingCount">>({
    title: "",
    description: "",
    content: "",
    tags: {
      specialty: [],
      useCase: [],
      userType: [],
      appModel: []
    },
    status: "draft",
    type: "prompt",
    authorId: "", // Will be set on submit
    version: 1,
    sources: []
  });

  // Update form data when modal opens with initial draft
  React.useEffect(() => {
    if (isOpen) {
      if (isEditing && initialDraft) {
        // If editing, populate with the draft data
        setFormData({
          title: initialDraft.title,
          description: initialDraft.description,
          content: initialDraft.content,
          tags: initialDraft.tags,
          status: initialDraft.status,
          type: "prompt",
          authorId: "", // Will be set on submit
          version: 1,
          sources: initialDraft.sources || []
        });
      } else if (!isEditing) {
        // If creating new, reset to empty form
        setFormData({
          title: "",
          description: "",
          content: "",
          tags: {
            specialty: [],
            useCase: [],
            userType: [],
            appModel: []
          },
          status: "draft",
          type: "prompt",
          authorId: "", // Will be set on submit
          version: 1,
          sources: []
        });
      }
    }
  }, [isOpen, isEditing, initialDraft]);

  const handleClose = () => {
    // If we're editing and no changes were made, don't change the status
    if (isEditing && initialDraft) {
      const hasChanges = 
        formData.title !== initialDraft.title ||
        formData.description !== initialDraft.description ||
        formData.content !== initialDraft.content ||
        JSON.stringify(formData.tags) !== JSON.stringify(initialDraft.tags) ||
        JSON.stringify(formData.sources) !== JSON.stringify(initialDraft.sources);
      
      if (!hasChanges) {
        onClose();
        return;
      }
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent | null, statusOverride?: "draft" | "published") => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData = statusOverride ? { ...formData, status: statusOverride } : formData;
      await onSubmit(submitData);
      // Reset form data after successful submission
      if (!isEditing) {
        setFormData({
          title: "",
          description: "",
          content: "",
          tags: {
            specialty: [],
            useCase: [],
            userType: [],
            appModel: []
          },
          status: "draft",
          type: "prompt",
          authorId: "",
          version: 1,
          sources: []
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagSelect = (category: keyof typeof formData.tags, tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: {
        ...prev.tags,
        [category]: [...prev.tags[category], tag]
      }
    }));
  };

  const handleTagRemove = (category: keyof typeof formData.tags, tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: {
        ...prev.tags,
        [category]: prev.tags[category].filter(t => t !== tag)
      }
    }));
  };

  const handleAddSource = () => {
    setFormData(prev => ({
      ...prev,
      sources: [...(prev.sources || []), { type: "url", value: "", label: "" }]
    }));
  };

  const handleRemoveSource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources?.filter((_, i) => i !== index)
    }));
  };

  const handleSourceChange = (index: number, field: "type" | "value" | "label", value: string) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources?.map((source, i) => 
        i === index ? { ...source, [field]: value } : source
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 transition-opacity duration-200",
          "opacity-100"
        )}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "fixed inset-0 z-50 overflow-y-auto",
        "opacity-100"
      )}>
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h2 className="text-lg font-semibold text-slate-800">
                {isEditing ? 'Edit Prompt' : 'Create New Prompt'}
              </h2>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={currentUser ? handleSubmit : (e) => e.preventDefault()} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  placeholder="Enter a title for your prompt"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  placeholder="Describe what your prompt does"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Prompt Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono"
                  placeholder="Enter your prompt"
                  rows={10}
                  required
                />
              </div>

              {/* Sources section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Sources
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddSource}
                    className="h-8 px-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="text-xs">Add Source</span>
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.sources?.map((source, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        value={source.type}
                        onChange={(e) => handleSourceChange(index, "type", e.target.value)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                      >
                        <option value="url">URL</option>
                        <option value="user">User</option>
                        <option value="text">Text</option>
                      </select>
                      <input
                        type="text"
                        value={source.value}
                        onChange={(e) => handleSourceChange(index, "value", e.target.value)}
                        placeholder={source.type === "url" ? "Enter URL" : "Enter value"}
                        className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                      <div className="flex-shrink-0 flex items-center justify-center" style={{ height: '32px' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveSource(index)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                          aria-label="Remove Source"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags section */}
              <div className="space-y-4">
                <div className="block text-sm font-medium text-slate-700 mb-2">Tags</div>
                <SearchableDropdown
                  label="Specialty"
                  options={availableTags.specialty}
                  selectedOptions={formData.tags.specialty}
                  onSelect={(tag) => handleTagSelect('specialty', tag)}
                  onRemove={(tag) => handleTagRemove('specialty', tag)}
                  placeholder="Select specialties..."
                />
                <SearchableDropdown
                  label="Use Case"
                  options={availableTags.useCase}
                  selectedOptions={formData.tags.useCase}
                  onSelect={(tag) => handleTagSelect('useCase', tag)}
                  onRemove={(tag) => handleTagRemove('useCase', tag)}
                  placeholder="Select use cases..."
                />
                <SearchableDropdown
                  label="User Type"
                  options={availableTags.userType}
                  selectedOptions={formData.tags.userType}
                  onSelect={(tag) => handleTagSelect('userType', tag)}
                  onRemove={(tag) => handleTagRemove('userType', tag)}
                  placeholder="Select user types..."
                />
                <SearchableDropdown
                  label="AI App / Model"
                  options={availableTags.appModel}
                  selectedOptions={formData.tags.appModel}
                  onSelect={(tag) => handleTagSelect('appModel', tag)}
                  onRemove={(tag) => handleTagRemove('appModel', tag)}
                  placeholder="Select AI apps or models..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                {currentUser ? (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleSubmit(null, "draft")}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      disabled={isSubmitting}
                      onClick={() => handleSubmit(null, "published")}
                    >
                      {isSubmitting ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : isEditing ? (
                        "Publish Prompt"
                      ) : (
                        "Create Prompt"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {/* Handle sign in */}}
                  >
                    Sign in to Create
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 