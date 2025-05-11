import { useState } from "react"
import { Bookmark, User, Copy } from "lucide-react"
import type { Prompt } from "../types"
import { usePrompt } from "../context/PromptContext"

interface PromptCardProps {
  prompt: Prompt
}

export function PromptCard({ prompt }: PromptCardProps) {
  const { savePrompt } = usePrompt()
  const [isSaved, setIsSaved] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSaving(true)
    try {
      await savePrompt(prompt.id)
      setIsSaved(!isSaved)
    } catch (err) {
      console.error("Error saving prompt:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "Clinician":
        return <User className="h-4 w-4 text-teal-500" />
      case "Administrator":
        return <User className="h-4 w-4 text-purple-500" />
      default:
        return <User className="h-4 w-4 text-slate-400" />
    }
  }

  const handleCopyPrompt = async () => {
    setIsCopying(true)
    try {
      await navigator.clipboard.writeText(prompt.content)
      // TODO: Add toast notification for success
    } catch (err) {
      console.error("Failed to copy prompt:", err)
      // TODO: Add toast notification for error
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-slate-800">{prompt.title}</h3>
          <button
            onClick={handleCopyPrompt}
            disabled={isCopying}
            className={`text-slate-400 hover:text-teal-500 transition-colors ${
              isCopying ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Copy prompt"
          >
            <Copy className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-slate-600 mb-3">{truncateText(prompt.description, 120)}</p>
        
        {prompt.sources && prompt.sources.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {prompt.sources.map((source, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
            {prompt.category}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            {prompt.specialty}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {prompt.tools.map((tool, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center">
          <div className="flex items-center mr-2">
            {getUserTypeIcon(prompt.author.type)}
          </div>
          {prompt.author.avatar ? (
            <img 
              src={prompt.author.avatar} 
              alt={prompt.author.name}
              className="w-6 h-6 rounded-full mr-2"
              onError={(e) => {
                e.currentTarget.src = "https://www.gravatar.com/avatar/?d=mp"
              }}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-200 mr-2" />
          )}
          <span className="text-xs text-slate-600">{prompt.author.name}</span>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`p-1.5 rounded-full ${
            isSaved ? "text-amber-500" : "text-slate-400 hover:text-amber-500 hover:bg-slate-100"
          } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label="Save prompt"
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
} 