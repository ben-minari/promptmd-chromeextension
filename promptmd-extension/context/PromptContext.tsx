import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { createClient } from "@supabase/supabase-js"
import type { Prompt, PromptContextType } from "../types"
import toast from "react-hot-toast"

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration. Please check your environment variables.")
      return null
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey)
  }
  return supabaseInstance
}

const PromptContext = createContext<PromptContextType | undefined>(undefined)

export function PromptProvider({ children }: { children: ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the singleton Supabase client
  const supabase = getSupabaseClient()

  const fetchPrompts = async () => {
    if (!supabase) {
      setError("Supabase configuration is missing. Please check your environment variables.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<Prompt[]>()
      
      if (error) throw error
      setPrompts(data || [])
    } catch (err) {
      console.error("Error fetching prompts:", err)
      setError("Failed to load prompts. Please try again.")
      toast.error("Failed to load prompts")
    } finally {
      setLoading(false)
    }
  }

  const savePrompt = async (id: string) => {
    if (!supabase) {
      setError("Supabase configuration is missing. Please check your environment variables.")
      toast.error("Configuration error")
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from("saved_prompts")
        .insert([{ prompt_id: id }])
      
      if (error) throw error
      
      toast.success("Prompt saved successfully")
    } catch (err) {
      console.error("Error saving prompt:", err)
      setError("Failed to save prompt")
      toast.error("Failed to save prompt")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (supabase) {
      fetchPrompts()
    }
  }, [supabase])

  const value = {
    prompts,
    loading,
    error,
    savePrompt,
    fetchPrompts
  }

  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  )
}

export function usePrompt() {
  const context = useContext(PromptContext)
  if (context === undefined) {
    throw new Error("usePrompt must be used within a PromptProvider")
  }
  return context
} 