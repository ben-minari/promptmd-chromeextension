import { useState } from "react"
import { Star, Copy, Check, ExternalLink } from "lucide-react"
import type { Prompt } from "../types"
import { usePrompt } from "../context/PromptContext"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

interface PromptCardProps {
  prompt: Prompt
}

export function PromptCard({ prompt }: PromptCardProps) {
  const { savePrompt, unsavePrompt } = usePrompt()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopied(true)
      toast.success("Prompt copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
      toast.error("Failed to copy prompt")
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save prompts")
      return
    }

    try {
      if (prompt.is_saved) {
        await unsavePrompt(prompt.id)
      } else {
        await savePrompt(prompt.id)
      }
    } catch (err) {
      console.error("Error toggling save:", err)
      toast.error("Failed to update saved status")
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{prompt.title}</h3>
            <p className="text-sm text-slate-600 mb-3">{prompt.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className={`p-2 rounded-md transition-colors ${
                prompt.is_saved
                  ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
              title={prompt.is_saved ? "Remove from saved" : "Save prompt"}
            >
              <Star size={18} className={prompt.is_saved ? "fill-current" : ""} />
            </button>
            <button
              onClick={handleCopy}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <a
              href={`https://promptmd.vercel.app/prompts/${prompt.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
              title="Open in web app"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded">
            {prompt.category}
          </span>
          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
            {prompt.specialty}
          </span>
          {prompt.tools.map((tool) => (
            <span
              key={tool}
              className="px-2 py-1 bg-slate-50 text-slate-700 text-xs font-medium rounded"
            >
              {tool}
            </span>
          ))}
        </div>

        <div className="relative">
          <pre className="p-3 bg-slate-50 rounded-md text-sm text-slate-700 whitespace-pre-wrap font-mono">
            {prompt.content}
          </pre>
        </div>
      </div>
    </div>
  )
} 