import { Search } from "lucide-react"
import { Input } from "../ui/Input"
import { cn } from "../../utils/cn"
import { useCallback, useState } from "react"

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (query: string) => void
  className?: string
}

export function SearchBar({
  onSearch,
  className,
  ...props
}: SearchBarProps) {
  const [value, setValue] = useState("")

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onSearch?.(newValue)
  }, [onSearch])

  return (
    <div className={cn("relative", className)}>
      <Input
        type="search"
        value={value}
        placeholder="Search prompts..."
        className="pl-9"
        onChange={handleChange}
        {...props}
      />
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
} 