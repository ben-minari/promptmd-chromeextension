import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/Card"
import { Button } from "../ui/Button"
import { Star, Bookmark, Share2 } from "lucide-react"
import type { Tool } from "../../services/tools-service"
import { useAuth } from "../../contexts/AuthContext"
import { toolsService } from "../../services/tools-service"
import { cn } from "../../utils/cn"
import { getTagColor } from '../../utils/tag-utils'
import { TagChip } from "../ui/TagChip"

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
    if (!currentUser || !prompt.id) return;
    console.log('[PromptCard] handleSave called for', prompt.id, 'isSaved:', prompt.isSaved);
    await onSave?.();
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