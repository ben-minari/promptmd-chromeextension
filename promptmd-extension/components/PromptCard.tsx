import { useState } from "react"
import { Star, Copy, ExternalLink, User } from "lucide-react"
import type { Prompt } from "../types"
import { usePrompt } from "../context/PromptContext"
import toast from 'react-hot-toast'

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
      toast.success(isSaved ? 'Prompt unsaved' : 'Prompt saved')
    } catch (err) {
      console.error("Error saving prompt:", err)
      toast.error('Failed to save prompt')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = async () => {
    setIsCopying(true)
    try {
      await navigator.clipboard.writeText(prompt.content)
      toast.success('Prompt copied to clipboard')
    } catch (err) {
      console.error("Failed to copy prompt:", err)
      toast.error('Failed to copy prompt')
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-500 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 truncate">{prompt.title}</h3>
          <div className="flex items-center mt-1 space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
              {prompt.category}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              {prompt.specialty}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            disabled={isCopying}
            className={`p-1.5 rounded-md text-slate-400 hover:text-teal-600 hover:bg-slate-50 transition-colors ${
              isCopying ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Copy prompt"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`p-1.5 rounded-md transition-colors ${
              isSaved 
                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' 
                : 'text-slate-400 hover:text-teal-600 hover:bg-slate-50'
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isSaved ? 'Unsave prompt' : 'Save prompt'}
          >
            <Star size={16} />
          </button>
          <a
            href={`https://promptmd.vercel.app/prompts/${prompt.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-slate-400 hover:text-teal-600 hover:bg-slate-50 transition-colors"
            title="Open in web app"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{prompt.description}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {prompt.tools?.map((tool) => (
          <span
            key={tool}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
          >
            {tool}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center">
          <div className="flex items-center mr-2">
            <User className="h-4 w-4 text-teal-500" />
          </div>
          {prompt.author.avatar ? (
            <img 
              src={prompt.author.avatar} 
              alt={prompt.author.name}
              className="w-5 h-5 rounded-full mr-2"
              onError={(e) => {
                e.currentTarget.src = "https://www.gravatar.com/avatar/?d=mp"
              }}
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-200 mr-2" />
          )}
          <span className="text-xs text-slate-600">{prompt.author.name}</span>
        </div>
        <span className="text-xs text-slate-400">
          {new Date(prompt.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
} 