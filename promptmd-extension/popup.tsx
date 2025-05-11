import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

function IndexPopup() {
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [prompts, setPrompts] = useState([])

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("prompts")
          .select("*")
          .order("created_at", { ascending: false })
        if (error) throw error
        setPrompts(data || [])
      } catch (err) {
        console.error("Error fetching prompts:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPrompts()
  }, [])

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
            <span className="text-slate-400">Loading prompts...</span>
          </div>
        ) : prompts.length > 0 ? (
          <ul className="space-y-2">
            {prompts.map(prompt => (
              <li key={prompt.id} className="p-2 border border-slate-200 rounded-md">
                <h3 className="font-medium">{prompt.title}</h3>
                <p className="text-sm text-slate-500">{prompt.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-slate-400 text-center mt-16">
            <span>No prompts to display yet.</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default IndexPopup
