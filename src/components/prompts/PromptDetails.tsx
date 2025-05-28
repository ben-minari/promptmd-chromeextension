import React, { useState, useEffect, useCallback } from "react"
import { Button } from "../ui/Button"
import { ArrowLeft, Star, Bookmark, Share2, Copy, Users, Edit, Link as LinkIcon, User as UserIcon, FileText, Trash2, Rocket, ChevronDown } from "lucide-react"
import type { Tool } from "../../services/tools-service"
import { cn } from "../../utils/cn"
import "../../styles/animations.css"
import { getTagColor } from '../../utils/tag-utils'
import { TagChip } from "../ui/TagChip"
import { useAuth } from "../../contexts/AuthContext"
import { toolsService } from "../../services/tools-service"
import { usersService, type User } from "../../services/users-service"

interface PromptDetailsProps {
  prompt: Tool
  onClose: () => void
  onSave: () => void
  onShare: () => void
  onEdit?: () => void
  onRate?: (rating: number) => void
  onDelete?: () => void
  onPublish?: () => void
  className?: string
}

type LaunchTarget = 'chatgpt' | 'claude';

interface LaunchConfig {
  target: LaunchTarget;
}

export function PromptDetails({
  prompt,
  onClose,
  onSave,
  onShare,
  onEdit,
  onRate,
  onDelete,
  onPublish,
  className
}: PromptDetailsProps) {
  const { currentUser } = useAuth()
  const [isClosing, setIsClosing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [creator, setCreator] = useState<User | null>(null)
  const [isOpening, setIsOpening] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [showLaunchOptions, setShowLaunchOptions] = useState(false);
  const [launchConfig, setLaunchConfig] = useState<LaunchConfig>({
    target: 'chatgpt'
  });

  const isOwner = currentUser?.uid === prompt.authorId
  const showRating = !isOwner && prompt.status === "published"

  useEffect(() => {
    const fetchCreator = async () => {
      if (prompt.authorId) {
        const user = await usersService.getUserById(prompt.authorId)
        setCreator(user)
      }
    }
    fetchCreator()
  }, [prompt.authorId])

  useEffect(() => {
    const timer = setTimeout(() => setIsOpening(false), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 200)
  }, [onClose])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(prompt.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [prompt.content])

  const handleSave = useCallback(async () => {
    if (!currentUser || !prompt.id || isSaving) return;
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  }, [currentUser, prompt.id, isSaving, onSave]);

  const handleRatingClick = useCallback((e: React.MouseEvent, rating: number) => {
    e.stopPropagation();
    if (!currentUser || !prompt.id) return;
    onRate?.(rating);
  }, [currentUser, prompt.id, onRate]);

  const handleRatingHover = useCallback((e: React.MouseEvent, rating: number) => {
    e.stopPropagation();
    setHoveredRating(rating);
  }, []);

  const handleRatingLeave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setHoveredRating(null);
  }, []);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    onDelete?.()
    setShowDeleteConfirm(false)
  }, [onDelete])

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false)
  }, [])

  const handleShare = useCallback(() => {
    const shareableUrl = `https://promptmd.vercel.app/prompts/${prompt.id}`;
    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 1500);
      })
      .catch((error) => {
        console.error('Failed to copy URL:', error);
      });
  }, [prompt.id]);

  const handleLaunch = useCallback(() => {
    const encodedPrompt = encodeURIComponent(prompt.content);
    let launchUrl: string;

    switch (launchConfig.target) {
      case 'chatgpt':
        launchUrl = `https://chat.openai.com/?prompt=${encodedPrompt}`;
        break;
      case 'claude':
        launchUrl = `https://claude.ai/new?q=${encodedPrompt}`;
        break;
      default:
        return;
    }

    window.open(launchUrl, '_blank');
    setShowLaunchOptions(false);
  }, [prompt, launchConfig]);

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 transition-opacity duration-200",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />
      <div className={cn(
        "fixed inset-0 flex justify-end",
        isClosing ? "pointer-events-none" : "",
        className
      )}>
        <div className={cn(
          "w-full max-w-2xl h-full bg-white shadow-xl transform transition-transform duration-200 ease-in-out flex flex-col",
          (isOpening || isClosing) ? "translate-x-full" : "translate-x-0"
        )}>
          <div className="h-full flex flex-col">
            {/* Fixed Header */}
            <div className="sticky top-0 z-50 flex items-center justify-between p-4 border-b border-slate-200 bg-white">
              <div className="flex items-center min-w-0 flex-1">
                <button 
                  onClick={handleClose} 
                  className="text-slate-600 hover:text-slate-800 p-1 rounded-md hover:bg-slate-100 mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold text-slate-800 truncate text-center w-full" title={prompt.title} style={{ minWidth: 0 }}>
                  {prompt.title}
                </h2>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              {/* Author and Stats Row */}
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-700 truncate">Created by: {creator?.displayName || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  {prompt.status === "published" && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-500 fill-current mr-1" />
                      {prompt.ratingCount === 0 ? "No rating" : prompt.ratingAvg.toFixed(1)}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Bookmark className="h-4 w-4 text-slate-400 mr-1" />
                    {prompt.saveCount}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {prompt.description && (
                <div className="px-4 py-2 text-slate-600 italic border-b border-slate-100 bg-slate-50">
                  {prompt.description}
                </div>
              )}

              {/* Content */}
              <div className="p-4 space-y-6">
                {/* Prompt Template */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-700">Prompt Template</h3>
                    <div className="flex items-center gap-2">
                      {showRating && currentUser && (
                        <div 
                          className="flex items-center"
                          onMouseLeave={handleRatingLeave}
                        >
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={(e) => handleRatingClick(e, rating)}
                              onMouseEnter={(e) => handleRatingHover(e, rating)}
                              className="text-amber-500 hover:text-amber-600 h-6 px-0.5"
                            >
                              <Star 
                                className={cn(
                                  "h-4 w-4",
                                  (hoveredRating ? rating <= hoveredRating : rating <= prompt.ratingAvg) 
                                    ? "fill-current" 
                                    : "fill-none"
                                )} 
                              />
                            </button>
                          ))}
                          <span className="ml-1 text-sm text-slate-600">
                            {prompt.ratingAvg.toFixed(1)}
                          </span>
                        </div>
                      )}
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
                  </div>
                  <pre
                    className="bg-slate-50 p-3 rounded-md text-sm font-mono max-h-64 overflow-y-auto"
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {prompt.content}
                  </pre>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(prompt.tags).map(([category, tags]) =>
                      tags.map((tag) => (
                        <TagChip key={tag} tag={tag} category={category} />
                      ))
                    )}
                  </div>
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
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowLaunchOptions(!showLaunchOptions)}
                    className="h-8 px-3"
                  >
                    <Rocket className="h-4 w-4 mr-1" />
                    <span className="text-sm">Launch</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>

                  {showLaunchOptions && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 p-4">
                      <h3 className="text-sm font-medium text-slate-700 mb-3">Launch Options</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-slate-600 block mb-1">Target Application</label>
                          <select
                            value={launchConfig.target}
                            onChange={(e) => setLaunchConfig(prev => ({
                              ...prev,
                              target: e.target.value as LaunchTarget
                            }))}
                            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                          >
                            <option value="chatgpt">ChatGPT</option>
                            <option value="claude">Claude</option>
                          </select>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowLaunchOptions(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleLaunch}
                          >
                            Launch
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {!isOwner && (
                  <Button 
                    variant="ghost" 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={cn(
                      "h-8 px-3",
                      prompt.isSaved ? "text-blue-600 hover:text-blue-700" : "text-slate-600 hover:text-slate-800"
                    )}
                  >
                    <Bookmark className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {isSaving ? (prompt.isSaved ? "Unsaving..." : "Saving...") : prompt.isSaved ? "Saved" : "Save"}
                    </span>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  onClick={handleShare}
                  className="h-8 px-3 group relative"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  <span className="text-sm">{copiedUrl ? "URL Copied!" : "Share"}</span>
                </Button>
              </div>
              {isOwner && (
                <div className="flex items-center gap-2">
                  {prompt.status === "draft" && (
                    <>
                      <Button 
                        variant="ghost" 
                        onClick={onEdit}
                        className="h-8 px-3"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="text-sm">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={onPublish}
                        className="h-8 px-3 text-green-600 hover:text-green-700"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        <span className="text-sm">Publish</span>
                      </Button>
                    </>
                  )}
                  {prompt.status === "published" && (
                    <Button 
                      variant="ghost" 
                      onClick={onEdit}
                      className="h-8 px-3"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      <span className="text-sm">Edit</span>
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={handleDeleteClick}
                    className="h-8 px-3 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="text-sm">Delete</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/20" onClick={handleDeleteCancel} />
          <div className="relative bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Prompt</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete this prompt? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={handleDeleteCancel}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 