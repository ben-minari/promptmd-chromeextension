import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/Card"
import { Button } from "../ui/Button"
import { Star, Bookmark, Share2 } from "lucide-react"
import type { Tool } from "../../services/tools-service"
import { useAuth } from "../../contexts/AuthContext"
import { toolsService } from "../../services/tools-service"
import { cn } from "../../utils/cn"

interface PromptCardProps {
  prompt: Tool
  onSave?: () => void
  onRate?: (rating: number) => void
  onShare?: () => void
  className?: string
}

export function PromptCard({
  prompt,
  onSave,
  onRate,
  onShare,
  className
}: PromptCardProps) {
  const { currentUser } = useAuth()
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = async () => {
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

  return (
    <Card variant="hover" className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>{prompt.title}</CardTitle>
        <CardDescription>{prompt.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-2">
          {Object.entries(prompt.tags).map(([category, tags]) => (
            <div key={category} className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRate?.(5)}
            className="text-amber-500 hover:text-amber-600"
          >
            <Star className="h-4 w-4" />
            <span className="ml-1">{prompt.ratingAvg.toFixed(1)}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="text-slate-600 hover:text-slate-800"
          >
            <Bookmark className="h-4 w-4" />
            <span className="ml-1">{prompt.saveCount}</span>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="text-slate-600 hover:text-slate-800"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
} 