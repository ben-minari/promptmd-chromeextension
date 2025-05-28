import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/Card"
import { Button } from "../ui/Button"
import { Star, Bookmark, Share2, User as UserIcon } from "lucide-react"
import type { Tool } from "../../services/tools-service"
import { useAuth } from "../../contexts/AuthContext"
import { toolsService } from "../../services/tools-service"
import { cn } from "../../utils/cn"
import { getTagColor } from '../../utils/tag-utils'
import { TagChip } from "../ui/TagChip"
import { usersService, type User } from "../../services/users-service"

interface PromptCardProps {
  prompt: Tool
  onSave?: () => void
  onRate?: (rating: number) => void
  onShare?: () => void
  onViewDetails?: () => void
  className?: string
  match?: any
}

function highlightText(text: string, indices: [number, number][]) {
  if (!indices || indices.length === 0) return text;
  // Find the longest contiguous match
  let longest = indices[0];
  for (const pair of indices) {
    if ((pair[1] - pair[0]) > (longest[1] - longest[0])) {
      longest = pair;
    }
  }
  const [start, end] = longest;
  return (
    <>
      {start > 0 && text.slice(0, start)}
      <span className="bg-yellow-100 text-yellow-900 rounded px-0.5">
        {text.slice(start, end + 1)}
      </span>
      {end + 1 < text.length && text.slice(end + 1)}
    </>
  );
}

export function PromptCard({
  prompt,
  onSave,
  onRate,
  onShare,
  onViewDetails,
  className,
  match
}: PromptCardProps) {
  const { currentUser } = useAuth()
  const [isSaving, setIsSaving] = React.useState(false)
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null)
  const [creator, setCreator] = React.useState<User | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false);

  const isOwner = currentUser?.uid === prompt.authorId
  const showRating = prompt.status === "published"

  useEffect(() => {
    const fetchCreator = async () => {
      if (prompt.authorId) {
        const user = await usersService.getUserById(prompt.authorId)
        setCreator(user)
      }
    }
    fetchCreator()
  }, [prompt.authorId])

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser || !prompt.id) return;
    console.log('[PromptCard] handleSave called for', prompt.id, 'isSaved:', prompt.isSaved);
    await onSave?.();
  };

  const handleRatingClick = (e: React.MouseEvent, rating: number) => {
    e.stopPropagation();
    if (!currentUser || !prompt.id) return;
    onRate?.(rating);
  };

  const handleRatingHover = (e: React.MouseEvent, rating: number) => {
    e.stopPropagation();
    setHoveredRating(rating);
  };

  const handleRatingLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHoveredRating(null);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareableUrl = `https://promptmd.vercel.app/prompts/${prompt.id}`;
    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 1500);
      })
      .catch((error) => {
        console.error('Failed to copy URL:', error);
      });
  };

  // Find matches for title, description, and tags
  let titleMatch: [number, number][] = [];
  let descMatch: [number, number][] = [];
  let tagMatches: Record<string, Record<string, [number, number][]>> = {};
  if (match) {
    for (const m of match) {
      if (m.key === "title") titleMatch = m.indices;
      if (m.key === "description") descMatch = m.indices;
      if (m.key && m.key.startsWith("tags.")) {
        const tagKey = m.key.split(".")[1];
        if (!tagMatches[tagKey]) tagMatches[tagKey] = {};
        // For array fields, m.value is the tag string, m.indices is an array of [start, end] pairs
        if (typeof m.value === "string" && Array.isArray(m.indices) && m.indices.length > 0 && Array.isArray(m.indices[0])) {
          tagMatches[tagKey][m.value] = m.indices.filter((x: any) => Array.isArray(x) && x.length === 2);
        }
      }
    }
  }

  return (
    <Card
      variant="hover"
      className={cn("flex flex-col cursor-pointer hover:shadow-md transition-shadow", className)}
      onClick={onViewDetails}
      role="button"
      tabIndex={0}
    >
      <CardHeader>
        <CardTitle>{highlightText(prompt.title, titleMatch)}</CardTitle>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <UserIcon className="h-3 w-3" />
          <span>{creator?.displayName || 'Unknown'}</span>
        </div>
        <CardDescription>{highlightText(prompt.description, descMatch)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-1">
          {Object.entries(prompt.tags).map(([category, tags]) =>
            tags.map((tag) => (
              <TagChip key={tag} tag={tag} category={category} />
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {showRating && (
            <div className="flex items-center">
              <Star className="h-3 w-3 text-amber-500 fill-current" />
              <span className="ml-1 text-xs text-slate-600">
                {prompt.ratingCount === 0 ? "No rating" : prompt.ratingAvg.toFixed(1)}
              </span>
            </div>
          )}
          {!isOwner && showRating && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !currentUser}
              className={cn(
                "h-6 px-2 group relative",
                prompt.isSaved ? "text-blue-600 hover:text-blue-700" : "text-slate-600 hover:text-slate-800"
              )}
            >
              <Bookmark className="h-3 w-3" />
              <span className="ml-1 text-xs">
                {isSaving ? "Saving..." : prompt.saveCount}
              </span>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {isSaving ? "Saving..." : prompt.isSaved ? "Saved" : currentUser ? "Click to Save" : "Sign in to Save"}
              </span>
            </Button>
          )}
          {isOwner && showRating && (
            <div className="flex items-center text-slate-600">
              <Bookmark className="h-3 w-3" />
              <span className="ml-1 text-xs">
                {prompt.saveCount} saves
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-slate-600 hover:text-slate-800 h-6 px-2 group relative"
          >
            <Share2 className="h-3 w-3" />
            <span className="absolute -top-8 left-0 -translate-x-3/4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {copiedUrl ? "URL Copied!" : "Click to Copy URL"}
            </span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 