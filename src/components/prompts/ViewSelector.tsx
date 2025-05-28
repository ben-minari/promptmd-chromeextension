import React, { useState } from "react"
import { cn } from "../../utils/cn"

export type PromptView = 'all' | 'saved' | 'created' | 'drafts'

interface ViewSelectorProps {
  activeView: PromptView
  onViewChange: (view: PromptView) => void
  className?: string
  savedCount?: number
  createdCount?: number
  draftsCount?: number
}

const VIEW_LABELS: Record<PromptView, string> = {
  all: 'All',
  saved: 'Saved',
  created: 'Published',
  drafts: 'Drafts',
}

const VIEW_ORDER: PromptView[] = ['all', 'saved', 'created', 'drafts']

export function ViewSelector({
  activeView,
  onViewChange,
  className,
  savedCount = 0,
  createdCount = 0,
  draftsCount = 0
}: ViewSelectorProps) {
  const [expanded, setExpanded] = useState(false)

  // For accessibility: expand on focus within, collapse on blur out
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setExpanded(false)
    }
  }

  // Only show the count badge if > 0
  const getCount = (view: PromptView) => {
    if (view === 'saved') return savedCount
    if (view === 'created') return createdCount
    if (view === 'drafts') return draftsCount
    return 0
  }

  // Arrange so activeView is leftmost, followed by the rest in order
  const getOrderedViews = () => [activeView, ...VIEW_ORDER.filter(v => v !== activeView)]

  // Calculate the max width needed for any tab (label + badge)
  const tabLabels = [VIEW_LABELS.all, VIEW_LABELS.saved, VIEW_LABELS.created, VIEW_LABELS.drafts]
  const maxLabelLength = Math.max(...tabLabels.map(l => l.length))
  const tabMinWidth = Math.max(90, maxLabelLength * 13 + 32) // 13px per char + badge room

  return (
    <div className={cn("inline-flex", className)}>
      <div
        className="inline-flex border border-slate-200 bg-white relative transition-all"
        tabIndex={0}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={handleBlur}
        style={{ minWidth: tabMinWidth }}
      >
        {expanded ? (
          <div className="flex min-w-[20rem] w-full">
            {getOrderedViews().map((view, idx, arr) => (
              <button
                key={view}
                onClick={() => {
                  onViewChange(view)
                  setExpanded(false)
                }}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center min-w-0 transition-all duration-150",
                  idx === 0 ? "rounded-l-lg" : "",
                  idx === arr.length - 1 ? "rounded-r-lg" : "",
                  view === activeView
                    ? 'bg-teal-500 text-white shadow-sm py-3 font-semibold relative' // expanded vertically
                    : 'text-slate-600 hover:bg-slate-50 py-1.5',
                  'px-4 text-sm'
                )}
                style={{ minWidth: tabMinWidth, maxWidth: tabMinWidth }}
              >
                <div className="flex items-center justify-center w-full">
                  <span className="mx-auto flex items-center justify-center">
                    {VIEW_LABELS[view]}
                    {getCount(view) > 0 && (
                      <span className="ml-1 bg-teal-100 text-teal-700 text-xs px-1.5 py-0.5 rounded-full">
                        {getCount(view)}
                      </span>
                    )}
                  </span>
                  {view === activeView && (
                    <svg className="ml-2 w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <button
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 w-full justify-center",
              'bg-teal-500 text-white shadow-sm'
            )}
            onClick={() => setExpanded(true)}
            aria-label={`Current view: ${VIEW_LABELS[activeView]}. Click or hover to expand.`}
            style={{ minWidth: tabMinWidth, maxWidth: tabMinWidth }}
          >
            <span className="mx-auto flex items-center justify-center">
              {VIEW_LABELS[activeView]}
              {getCount(activeView) > 0 && (
                <span className="ml-1 bg-teal-100 text-teal-700 text-xs px-1.5 py-0.5 rounded-full">
                  {getCount(activeView)}
                </span>
              )}
            </span>
            {/* Right arrow chevron */}
            <svg className="ml-1 w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
} 