import React, { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { cn } from "../../utils/cn"
import { categorizeTag, getTagColor } from "../../utils/tag-utils"

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
    option.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedOptions.includes(option)
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
      {/* Input area with chips inside */}
      <div
        className="w-full flex items-center border border-slate-200 rounded-md hover:border-slate-300 focus-within:ring-2 focus-within:ring-teal-500 bg-white px-2 py-1 flex-wrap min-h-[40px]"
        onClick={() => {
          setIsOpen(true)
          inputRef.current?.focus()
        }}
        style={{ cursor: "text" }}
      >
        {selectedOptions.map(option => {
          const { category } = categorizeTag(option)
          const colorClass = getTagColor(category)
          return (
            <span
              key={option}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-xs rounded-full mr-1 mb-1",
                colorClass
              )}
            >
              {option}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  onRemove(option)
                }}
                className="hover:text-inherit ml-1"
                tabIndex={-1}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )
        })}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedOptions.length === 0 ? label : ""}
          className="flex-1 px-2 py-1 text-sm bg-transparent outline-none min-w-[80px]"
          style={{ minWidth: 0 }}
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg ring-2 ring-teal-200">
          <div className="flex justify-end p-1">
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 p-1"
              aria-label="Close dropdown"
              onClick={e => {
                e.stopPropagation()
                setIsOpen(false)
                setSearchQuery("")
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    onSelect(option)
                    setSearchQuery("")
                    // Keep dropdown open for multi-select
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