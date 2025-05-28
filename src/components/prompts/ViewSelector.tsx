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
  // Use canvas to measure text width for more accuracy
  const getTextWidth = (text: string, font = '500 14px Inter, sans-serif') => {
    if (typeof window === 'undefined') return text.length * 10;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return text.length * 10;
    ctx.font = font;
    return ctx.measureText(text).width;
  };
  const maxLabelWidth = Math.max(...tabLabels.map(l => getTextWidth(l))) + 36 + 20; // 36px for badge/chevron, 20px buffer
  const tabMinWidth = Math.max(100, Math.ceil(maxLabelWidth));
  const buttonHeight = 40; // px, matches py-1.5 + font size + border

  return (
    <div className={cn("inline-flex flex-col items-start relative", className)} style={{ minWidth: tabMinWidth }}>
      {/* Fixed height wrapper to prevent vertical shift */}
      <div style={{ height: buttonHeight, minWidth: tabMinWidth, position: 'relative', width: '100%' }}>
        <div
          className="relative w-full h-full"
          tabIndex={0}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          onFocus={() => setExpanded(true)}
          onBlur={handleBlur}
          style={{ minWidth: tabMinWidth, height: buttonHeight }}
        >
          {/* Collapsed: Only active tab visible */}
          {!expanded && (
            <button
              className={cn(
                "w-max min-w-[100px] px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center justify-center bg-teal-500 text-white shadow-sm border border-slate-200 font-semibold",
              )}
              onClick={() => setExpanded(true)}
              aria-label={`Current view: ${VIEW_LABELS[activeView]}. Click or hover to expand.`}
              style={{ minWidth: tabMinWidth, maxWidth: tabMinWidth, height: buttonHeight - 2 }}
            >
              <span className="flex items-center justify-center mx-auto">
                {VIEW_LABELS[activeView]}
                {getCount(activeView) > 0 && (
                  <span className="ml-1 bg-teal-100 text-teal-700 text-xs px-1.5 py-0.5 rounded-full">
                    {getCount(activeView)}
                  </span>
                )}
              </span>
              {/* Chevron down */}
              <svg className="ml-2 w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {/* Expanded: Dropdown menu */}
          {expanded && (
            <div className="absolute left-0 top-full w-max min-w-[100px] z-50 bg-white border border-slate-200 rounded-lg shadow-lg flex flex-col transition-all" style={{ minWidth: tabMinWidth, maxWidth: tabMinWidth }}>
              {getOrderedViews().map((view, idx, arr) => (
                <button
                  key={view}
                  onClick={() => {
                    onViewChange(view)
                    setExpanded(false)
                  }}
                  className={cn(
                    "w-full px-3 py-1.5 text-sm flex items-center justify-center transition-colors",
                    view === activeView
                      ? 'bg-teal-500 text-white font-semibold' // highlight active
                      : 'text-slate-700 hover:bg-slate-100',
                    idx === 0 ? "rounded-t-lg" : "",
                    idx === arr.length - 1 ? "rounded-b-lg" : ""
                  )}
                  style={{ minWidth: tabMinWidth, maxWidth: tabMinWidth }}
                >
                  <span className="flex items-center justify-center mx-auto">
                    {VIEW_LABELS[view]}
                    {getCount(view) > 0 && (
                      <span className="ml-1 bg-teal-100 text-teal-700 text-xs px-1.5 py-0.5 rounded-full">
                        {getCount(view)}
                      </span>
                    )}
                  </span>
                  {/* Chevron up for active tab */}
                  {view === activeView && (
                    <svg className="ml-2 w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Persistent border under the control for visual stability */}
      <div className="w-full border-b border-slate-200" style={{ minWidth: tabMinWidth }} />
    </div>
  )
} 