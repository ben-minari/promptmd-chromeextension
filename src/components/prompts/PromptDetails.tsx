import React, { useState } from "react"
import { Button } from "../ui/Button"
import { ArrowLeft, Star, Bookmark, Share2, Copy, Users, Edit, Link as LinkIcon, User as UserIcon, FileText } from "lucide-react"
import type { Tool } from "../../services/tools-service"
import { cn } from "../../utils/cn"
import "../../styles/animations.css"
import { getTagColor } from '../../utils/tag-utils'

interface PromptDetailsProps {
  prompt: Tool
  onClose: () => void
  onSave: () => void
  onShare: () => void
  onEdit?: () => void
  className?: string
}

export function PromptDetails({
  prompt,
  onClose,
  onSave,
  onShare,
  onEdit,
  className
}: PromptDetailsProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 200) // Match animation duration
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

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
      {/* Slide-out panel */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-lg z-50",
        isClosing ? "slide-out" : "slide-in",
        className
      )}>
        <div className="h-full flex flex-col">
          {/* Sticky Header with Title */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-200 bg-white">
            <button 
              onClick={handleClose} 
              className="text-slate-600 hover:text-slate-800 p-1 rounded-md hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2
              className="text-lg font-semibold text-slate-800 truncate max-w-xs md:max-w-sm lg:max-w-md"
              title={prompt.title}
              style={{ minWidth: 0 }}
            >
              {prompt.title}
            </h2>
            <div className="w-5" /> {/* Spacer for alignment */}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
              <p className="text-sm text-slate-600">{prompt.description}</p>
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {Object.entries(prompt.tags).map(([category, tags]) =>
                tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTagColor(category)}`}
                  >
                    {tag}
                  </span>
                ))
              )}
            </div>
            {/* Prompt Template */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-700">Prompt Template</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
              <pre
                className="bg-slate-50 p-3 rounded-md text-sm font-mono max-h-64 overflow-y-auto"
                style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
              >
                {prompt.content}
              </pre>
            </div>
            {/* Sources */}
            {prompt.sources && prompt.sources.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Sources</h3>
                <ul className="space-y-1">
                  {prompt.sources.map((source, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                      {source.type === "url" ? (
                        <>
                          <LinkIcon className="h-4 w-4 text-blue-600" />
                          <a
                            href={source.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-700 hover:text-blue-900 truncate max-w-xs"
                            title={source.value}
                          >
                            {source.label || source.value}
                          </a>
                        </>
                      ) : source.type === "user" ? (
                        <>
                          <UserIcon className="h-4 w-4 text-teal-600" />
                          <span>{source.label || source.value}</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span>{source.label || source.value}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Example Usage */}
            {prompt.example && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Example Usage</h3>
                <div className="bg-slate-50 p-3 rounded-md text-sm">
                  <div className="mb-2">
                    <span className="font-medium text-slate-700">Input:</span>
                    <pre className="mt-1 font-mono">{prompt.example.input}</pre>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Output:</span>
                    <pre className="mt-1 font-mono">{prompt.example.output}</pre>
                  </div>
                </div>
              </div>
            )}
            {/* Usage Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-amber-500 mr-1" />
                {prompt.ratingAvg.toFixed(1)}
              </div>
              <div className="flex items-center">
                <Bookmark className="h-4 w-4 text-slate-400 mr-1" />
                {prompt.saveCount} saves
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-slate-400 mr-1" />
                {prompt.useCount || 0} uses
              </div>
            </div>
          </div>
          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button 
              variant="ghost" 
              onClick={onShare}
              className="h-8 px-3"
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span className="text-sm">Share</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={onSave}
              className="h-8 px-3"
            >
              <Bookmark className="h-4 w-4 mr-1" />
              <span className="text-sm">Save</span>
            </Button>
            {onEdit && (
              <Button 
                variant="ghost" 
                onClick={onEdit}
                className="h-8 px-3"
              >
                <Edit className="h-4 w-4 mr-1" />
                <span className="text-sm">Edit</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 