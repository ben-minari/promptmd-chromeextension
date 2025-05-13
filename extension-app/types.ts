export interface Author {
  name: string
  avatar: string
  type: 'Clinician' | 'Administrator' | string
}

export interface Prompt {
  id: string
  title: string
  description: string
  content: string
  category: string
  specialty: string
  tools: string[]
  sources?: string[]
  tags?: string[]
  author: Author
  created_at: string
  updated_at: string
  is_saved?: boolean
}

export interface PromptContextType {
  prompts: Prompt[]
  loading: boolean
  error: string | null
  savePrompt: (id: string) => Promise<void>
  unsavePrompt: (id: string) => Promise<void>
  fetchPrompts: () => Promise<void>
} 