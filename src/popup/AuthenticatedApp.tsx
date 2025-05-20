import React from "react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/Button"
import { SearchBar } from "../components/prompts/SearchBar"
import { TagFilterGroup } from "../components/prompts/TagFilterGroup"
import { PromptCatalog } from "../components/prompts/PromptCatalog"
import { toolsService } from "../services/tools-service"
import type { Tool } from "../services/tools-service"

const AVAILABLE_TAGS = {
  specialty: [
    "primary_care",
    "emergency",
    "pediatrics",
    "surgery",
    "psychiatry"
  ],
  useCase: [
    "handoff",
    "communication",
    "triage",
    "documentation",
    "workflow"
  ],
  userType: [
    "physician",
    "nurse",
    "resident",
    "student",
    "admin"
  ],
  appModel: [
    "gpt4",
    "claude",
    "gemini",
    "llama"
  ]
}

export default function AuthenticatedApp() {
  const { currentUser, logout, switchAccount } = useAuth()
  const [tools, setTools] = React.useState<Tool[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadTools = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const tools = await toolsService.getPublishedTools()
        setTools(tools || [])
      } catch (error) {
        console.error("Error loading tools:", error)
        setError("Failed to load tools. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    loadTools()
  }, [])

  const handleSave = async (tool: Tool) => {
    if (!currentUser || !tool.id) return
    try {
      await toolsService.saveTool(currentUser.uid, tool.id)
    } catch (error) {
      console.error("Error saving tool:", error)
    }
  }

  const handleRate = async (tool: Tool, rating: number) => {
    if (!currentUser || !tool.id) return
    try {
      // TODO: Implement rating functionality
      console.log("Rating tool:", tool.id, rating)
    } catch (error) {
      console.error("Error rating tool:", error)
    }
  }

  const handleShare = (tool: Tool) => {
    // TODO: Implement sharing functionality
    console.log("Sharing tool:", tool)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <img
            src={currentUser?.photoURL || ""}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <span className="font-medium">{currentUser?.displayName}</span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={switchAccount}
          >
            Switch Account
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Prompt Catalog</h1>
        <Button variant="primary" size="sm">
          Create Prompt
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <PromptCatalog
          prompts={tools}
          availableTags={AVAILABLE_TAGS}
          onSave={handleSave}
          onRate={handleRate}
          onShare={handleShare}
        />
      )}
    </div>
  )
} 