import { cn } from "../../utils/cn"

interface TagFilterProps {
  tags: string[]
  selectedTags: string[]
  onTagSelect: (tag: string) => void
  className?: string
}

export function TagFilter({
  tags,
  selectedTags,
  onTagSelect,
  className
}: TagFilterProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagSelect(tag)}
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
            selectedTags.includes(tag)
              ? "bg-teal-100 text-teal-800 hover:bg-teal-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  )
} 