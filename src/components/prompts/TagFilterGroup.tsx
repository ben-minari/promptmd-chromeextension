import { cn } from "../../utils/cn"

interface TagFilterGroupProps {
  category?: string
  tags: string[]
  selectedTags: string[]
  onTagSelect: (tag: string, category?: string) => void
  className?: string
}

export function TagFilterGroup({
  category,
  tags,
  selectedTags,
  onTagSelect,
  className
}: TagFilterGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {category && <h3 className="text-sm font-medium text-slate-700 capitalize">{category}</h3>}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag, category)}
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
    </div>
  )
} 