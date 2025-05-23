import React from "react"
import { Button } from "./Button"
import { Plus } from "lucide-react"

interface FloatingActionButtonProps {
  onClick: () => void
  className?: string
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Button
        variant="primary"
        onClick={onClick}
        className="rounded-full shadow-lg h-12 w-12 p-0"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
} 