import React, { useState } from "react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Textarea } from "../ui/Textarea"
import { SearchableDropdown } from "./SearchableDropdown"
import { X } from "lucide-react"
import type { Tool } from "../../services/tools-service"
import { cn } from "../../utils/cn"

interface CreatePromptModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (prompt: Omit<Tool, "id" | "createdAt" | "updatedAt" | "saveCount" | "ratingAvg" | "ratingCount">) => void
  availableTags: {
    specialty: string[]
    useCase: string[]
    userType: string[]
    appModel: string[]
  }
  isAuthenticated?: boolean
  onSignIn?: (draft: Omit<Tool, "id" | "createdAt" | "updatedAt" | "saveCount" | "ratingAvg" | "ratingCount">) => void
  initialDraft?: Omit<Tool, "id" | "createdAt" | "updatedAt" | "saveCount" | "ratingAvg" | "ratingCount">
}

export function CreatePromptModal({
  isOpen,
  onClose,
  onSubmit,
  availableTags,
  isAuthenticated = true,
  onSignIn,
  initialDraft
}: CreatePromptModalProps) {
  const [isClosing, setIsClosing] = useState(false)
  const defaultForm = {
    title: "",
    description: "",
    content: "",
    type: "prompt" as const,
    status: "draft" as const,
    tags: {
      specialty: [] as string[],
      useCase: [] as string[],
      userType: [] as string[],
      appModel: [] as string[]
    },
    authorId: "", // Will be set on submit
    version: 1
  }
  const [formData, setFormData] = useState(initialDraft || defaultForm)

  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialDraft || defaultForm)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialDraft])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }

  const handleSubmitWithStatus = (status: "draft" | "published") => {
    onSubmit({
      ...formData,
      status
    })
    handleClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmitWithStatus("published")
  }

  const handleTagSelect = (category: keyof typeof formData.tags, tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: {
        ...prev.tags,
        [category]: [...prev.tags[category], tag]
      }
    }))
  }

  const handleTagRemove = (category: keyof typeof formData.tags, tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: {
        ...prev.tags,
        [category]: prev.tags[category].filter(t => t !== tag)
      }
    }))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 transition-opacity duration-200",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "fixed inset-0 z-50 overflow-y-auto",
        isClosing ? "opacity-0" : "opacity-100"
      )}>
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h2 className="text-lg font-semibold text-slate-800">Create New Prompt</h2>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={isAuthenticated ? handleSubmit : (e) => e.preventDefault()} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter prompt title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description <span className="text-slate-400 text-xs">(optional)</span>
                </label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this prompt does"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Prompt Template <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your prompt template"
                  className="h-32"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Tags <span className="text-slate-400 text-xs">(optional)</span>
                </label>
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
                  label="AI Model"
                  options={availableTags.appModel}
                  selectedOptions={formData.tags.appModel}
                  onSelect={(tag) => handleTagSelect('appModel', tag)}
                  onRemove={(tag) => handleTagRemove('appModel', tag)}
                  placeholder="Select AI models..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                {isAuthenticated ? (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleSubmitWithStatus("draft")}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                    >
                      Publish Prompt
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => onSignIn?.(formData)}
                  >
                    Sign In to Save
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
} 