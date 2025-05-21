import React, { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { cn } from "../../utils/cn"

interface SearchableDropdownProps {
  label: string
  options: string[]
  selectedOptions: string[]
  onSelect: (option: string) => void
  onRemove: (option: string) => void
  onClearAll?: () => void
  placeholder?: string
  className?: string
}

export function SearchableDropdown({
  label,
  options,
  selectedOptions,
  onSelect,
  onRemove,
  onClearAll,
  placeholder = "Search...",
  className
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Selected Options Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedOptions.map(option => (
          <div
            key={option}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-teal-100 text-teal-700 rounded-md"
          >
            <span>{option}</span>
            <button
              onClick={() => onRemove(option)}
              className="hover:text-teal-900"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Dropdown Button as Input */}
      <div
        className="w-full flex items-center border border-slate-200 rounded-md hover:border-slate-300 focus-within:ring-2 focus-within:ring-teal-500 bg-white"
        onClick={() => setIsOpen(true)}
      >
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : selectedOptions[0] || ""}
          onChange={e => {
            setSearchQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={isOpen || !selectedOptions.length ? label : selectedOptions[0]}
          className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
          readOnly={!isOpen}
        />
        <button
          type="button"
          tabIndex={-1}
          className="px-2"
          onClick={e => {
            e.stopPropagation()
            setIsOpen(open => !open)
            if (!isOpen) inputRef.current?.focus()
          }}
        >
          <Search className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg">
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <button
                  key={option}
                  onClick={() => {
                    onSelect(option)
                    setSearchQuery("")
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-sm text-left hover:bg-slate-50",
                    selectedOptions.includes(option) && "bg-teal-50 text-teal-700"
                  )}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-slate-500">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 