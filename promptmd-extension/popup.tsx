import { useState, useMemo } from 'react'
import { PromptProvider, usePrompt } from "./context/PromptContext"
import { PromptCard } from "./components/PromptCard"
import { usePromptSearch } from "./hooks/usePromptSearch"
import { Tabs } from "./components/Tabs"
import { Toast } from "./components/Toast"
import { Clock, Star, List, ExternalLink } from 'lucide-react'
import "./styles/globals.css"

const tabs = [
  { id: 'recent', label: 'Recent', icon: <Clock size={16} /> },
  { id: 'saved', label: 'Saved', icon: <Star size={16} /> },
  { id: 'all', label: 'All', icon: <List size={16} /> },
]

function PopupContent() {
  const { prompts, loading, error, fetchPrompts } = usePrompt()
  const { search, setSearch, filteredPrompts } = usePromptSearch(prompts)
  const [activeTab, setActiveTab] = useState('all')

  const displayedPrompts = useMemo(() => {
    if (activeTab === 'all') return filteredPrompts
    if (activeTab === 'recent') {
      return [...filteredPrompts].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 10)
    }
    if (activeTab === 'saved') {
      return filteredPrompts.filter(prompt => prompt.is_saved)
    }
    return filteredPrompts
  }, [filteredPrompts, activeTab])

  return (
    <div className="min-w-[400px] w-full max-w-[600px] h-[600px] bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <header className="p-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
              PromptMD
            </h1>
          </div>
          <a
            href="https://promptmd.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
          >
            <ExternalLink size={14} className="mr-1.5" />
            Open Web App
          </a>
        </div>
        <p className="text-slate-500 text-sm">Healthcare AI Prompt Library</p>
      </header>

      <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
            placeholder="Search prompts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <p className="text-red-500 mb-3">{error}</p>
              <button 
                onClick={() => fetchPrompts()}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-sm"
              >
                Retry
              </button>
            </div>
          </div>
        ) : displayedPrompts.length > 0 ? (
          <ul className="space-y-4">
            {displayedPrompts.map(prompt => (
              <li key={prompt.id}>
                <PromptCard prompt={prompt} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 mb-4 text-slate-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-slate-400">No prompts found matching your search.</p>
          </div>
        )}
      </div>
      <Toast />
    </div>
  )
}

function IndexPopup() {
  return (
    <PromptProvider>
      <PopupContent />
    </PromptProvider>
  )
}

export default IndexPopup
