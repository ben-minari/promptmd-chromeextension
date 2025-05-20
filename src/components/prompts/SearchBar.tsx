import { Search } from "lucide-react"
import { Input } from "../ui/Input"
import { cn } from "../../utils/cn"

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (query: string) => void
  className?: string
}

export function SearchBar({
  onSearch,
  className,
  ...props
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        placeholder="Search prompts..."
        className="pl-9"
        onChange={(e) => onSearch?.(e.target.value)}
        {...props}
      />
    </div>
  )
} 