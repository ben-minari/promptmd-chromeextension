import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { createClient } from "@supabase/supabase-js"
import type { Prompt, PromptContextType } from "../types"
import toast from "react-hot-toast"
import { useAuth } from "./AuthContext"

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
  const { user } = useAuth()
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
      // Fetch all prompts
      const { data: allPrompts, error: promptsError } = await supabase
        .from("prompts")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<Prompt[]>()
      
      if (promptsError) throw promptsError

      // If user is authenticated, fetch their saved prompts
      if (user) {
        const { data: savedPrompts, error: savedError } = await supabase
          .from("saved_prompts")
          .select("prompt_id")
          .eq("user_id", user.id)
          .returns<{ prompt_id: string }[]>()

        if (savedError) throw savedError

        // Mark prompts as saved if they're in the user's saved prompts
        const savedPromptIds = new Set(savedPrompts?.map(sp => sp.prompt_id) || [])
        const promptsWithSavedStatus = allPrompts?.map(prompt => ({
          ...prompt,
          is_saved: savedPromptIds.has(prompt.id)
        })) || []

        setPrompts(promptsWithSavedStatus)
      } else {
        // If not authenticated, just show all prompts without saved status
        setPrompts(allPrompts?.map(prompt => ({
          ...prompt,
          is_saved: false
        })) || [])
      }
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

    if (!user) {
      toast.error("Please sign in to save prompts")
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from("saved_prompts")
        .insert([{ 
          prompt_id: id,
          user_id: user.id
        }])
      
      if (error) throw error
      
      // Update the local state to reflect the saved status
      setPrompts(prevPrompts => 
        prevPrompts.map(prompt => 
          prompt.id === id ? { ...prompt, is_saved: true } : prompt
        )
      )
      
      toast.success("Prompt saved successfully")
    } catch (err) {
      console.error("Error saving prompt:", err)
      setError("Failed to save prompt")
      toast.error("Failed to save prompt")
    } finally {
      setLoading(false)
    }
  }

  const unsavePrompt = async (id: string) => {
    if (!supabase || !user) {
      toast.error("Please sign in to manage saved prompts")
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from("saved_prompts")
        .delete()
        .eq("prompt_id", id)
        .eq("user_id", user.id)
      
      if (error) throw error
      
      // Update the local state to reflect the unsaved status
      setPrompts(prevPrompts => 
        prevPrompts.map(prompt => 
          prompt.id === id ? { ...prompt, is_saved: false } : prompt
        )
      )
      
      toast.success("Prompt removed from saved")
    } catch (err) {
      console.error("Error unsaving prompt:", err)
      setError("Failed to remove saved prompt")
      toast.error("Failed to remove saved prompt")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (supabase) {
      fetchPrompts()
    }
  }, [supabase, user]) // Refetch when user auth state changes

  const value = {
    prompts,
    loading,
    error,
    savePrompt,
    unsavePrompt,
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