import React from "react"
import { Button } from "../ui/Button"
import { useAuth } from "../../contexts/AuthContext"
import { Menu, ChevronDown, Filter } from "lucide-react"
import { SearchBar } from "../prompts/SearchBar"

interface HeaderProps {
  onCreatePrompt?: () => void
  onSearch?: (query: string) => void
  onOpenFilters?: () => void
}

export function Header({ onCreatePrompt, onSearch, onOpenFilters }: HeaderProps) {
  const { currentUser, signInWithGoogle, logout, switchAccount } = useAuth()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false)
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isProfileMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-2 p-1 border-b border-slate-200 bg-white">
      {/* Left: Logo (placeholder for SVG) */}
      <div className="flex items-center gap-2 min-w-[40px]">
        <span className="h-7 w-7 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-stethoscope h-7 w-7 text-teal-600"
          >
            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path>
            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path>
            <circle cx="20" cy="10" r="2"></circle>
          </svg>
        </span>
      </div>

      {/* Center: Search bar */}
      <div className="flex-1 min-w-0 mx-0">
        <SearchBar
          onSearch={onSearch}
          placeholder="Search prompts..."
          className="w-full max-w-none px-0 pl-8"
          style={{ minWidth: 0, width: '100%' }}
        />
      </div>

      {/* Right: Filters button and profile/sign-in */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="flex items-center gap-1"
          onClick={onOpenFilters}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
        {currentUser ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100"
            >
              <img
                src={currentUser.photoURL || ""}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <ChevronDown className="w-4 h-4 text-slate-600" />
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-slate-200">
                    <p className="text-sm font-medium text-slate-900">{currentUser.displayName}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={switchAccount}
                    className="block w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 text-left"
                  >
                    Switch Account
                  </button>
                  <button
                    onClick={logout}
                    className="block w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 text-left"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={signInWithGoogle}
          >
            Sign in
          </Button>
        )}
      </div>
    </div>
  )
} 