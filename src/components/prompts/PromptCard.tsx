import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/Card"
import { Button } from "../ui/Button"
import { Star, Bookmark, Share2 } from "lucide-react"
import type { Tool } from "../../services/tools-service"
import { useAuth } from "../../contexts/AuthContext"
import { toolsService } from "../../services/tools-service"
import { cn } from "../../utils/cn"
import { getTagColor } from '../../utils/tag-utils'

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

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) return
    setIsSaving(true)
    try {
      if (prompt.isSaved) {
        await toolsService.unsaveTool(currentUser.uid, prompt.id!)
        onSave?.()
      } else {
        await toolsService.saveTool(currentUser.uid, prompt.id!)
        onSave?.()
      }
    } catch (error) {
      console.error("Error saving tool:", error)
    } finally {
      setIsSaving(false)
    }
  }

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
          tagMatches[tagKey][m.value] = m.indices.filter(x => Array.isArray(x) && x.length === 2);
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
        <CardDescription>{highlightText(prompt.description, descMatch)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-1">
          {Object.entries(prompt.tags).map(([category, tags]) =>
            tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTagColor(category)}`}
              >
                {match && tagMatches[category] && tagMatches[category][tag]
                  ? highlightText(tag, tagMatches[category][tag])
                  : tag}
              </span>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={e => { e.stopPropagation(); onRate?.(5); }}
            className="text-amber-500 hover:text-amber-600 h-6 px-2"
          >
            <Star className="h-3 w-3" />
            <span className="ml-1 text-xs">{prompt.ratingAvg.toFixed(1)}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="text-slate-600 hover:text-slate-800 h-6 px-2"
          >
            <Bookmark className="h-3 w-3" />
            <span className="ml-1 text-xs">{prompt.saveCount}</span>
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={e => { e.stopPropagation(); onShare?.(); }}
            className="text-slate-600 hover:text-slate-800 h-6 px-2"
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 