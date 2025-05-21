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
    <div className={cn(className)}>
      <Input
        type="search"
        placeholder="Search prompts..."
        className="pl-4"
        onChange={(e) => onSearch?.(e.target.value)}
        {...props}
      />
    </div>
  )
} 