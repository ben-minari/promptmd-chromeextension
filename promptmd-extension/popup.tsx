import { PromptProvider, usePrompt } from "./context/PromptContext"
import { PromptCard } from "./components/PromptCard"
import { usePromptSearch } from "./hooks/usePromptSearch"

function PopupContent() {
  const { prompts, loading, error, fetchPrompts } = usePrompt()
  const { search, setSearch, filteredPrompts } = usePromptSearch(prompts)

  return (
    <div className="w-[400px] h-[600px] bg-white p-4 flex flex-col">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-teal-700">PromptMD</h1>
        <p className="text-slate-500 text-sm">Healthcare AI Prompt Library</p>
      </header>
      <div className="mb-4">
        <input
          type="text"
          className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Search prompts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-red-500 text-center">
              <p>{error}</p>
              <button 
                onClick={() => fetchPrompts()}
                className="mt-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredPrompts.length > 0 ? (
          <ul className="space-y-3">
            {filteredPrompts.map(prompt => (
              <li key={prompt.id}>
                <PromptCard prompt={prompt} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-slate-400 text-center mt-16">
            <span>No prompts found matching your search.</span>
          </div>
        )}
      </div>
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
