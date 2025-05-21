# PromptMD Chrome Extension Wireframes

## Design Principles
- Minimalistic, simple experience
- Clean, professional medical aesthetic
- Efficient use of limited extension popup space
- Clear information hierarchy
- Progressive disclosure of information

## Main View

### Simplified Header
```
+------------------------------------------+
|  [Logo] PromptMD    [Search] [Filter]    |
|  [Sign In]                               |
+------------------------------------------+

# When signed in:
+------------------------------------------+
|  [Logo] PromptMD    [Search] [Filter]    |
|  [Profile Icon]                          |
+------------------------------------------+
```

### Profile Icon States
```
# Signed In
[👤] -> Opens profile menu
[👤+1] -> Shows notification count
```

### Profile Menu (Dropdown)
```
+------------------------------------------+
|  [Profile Picture]                       |
|  Dr. Jane Smith                          |
|  Cardiology                              |
|  --------------------------------------  |
|  [My Profile]                            |
|  [Saved Prompts]                         |
|  [My Prompts]                            |
|  [Settings]                              |
|  --------------------------------------  |
|  [Sign Out]                              |
+------------------------------------------+
```

### Active Filters Display
```
[Cardiology ×] [Documentation ×] [Physician ×] [GPT-4 ×]
```

### Searchable Dropdown Example
```
+------------------------------------------+
|  [Filter]                                |
|  +----------------------------------+    |
|  | [Search...]                      |    |
|  |                                  |    |
|  | ○ Cardiology                     |    |
|  | ○ Oncology                       |    |
|  | ○ Primary Care                   |    |
|  | ○ Neurology                      |    |
|  |                                  |    |
|  | [Create New...]                  |    |
|  +----------------------------------+    |
+------------------------------------------+
```

### Core Prompt Library/Feed
```
+------------------------------------------+
|  [Logo] PromptMD    [Search] [Filter]    |
|  [Sign In]                               |
+------------------------------------------+
|  [Cardiology ×] [Documentation ×]        |
+------------------------------------------+
|                                          |
|  +----------------------------------+    |
|  | [Cardiology] [Documentation]     |    |
|  |                                  |    |
|  | Generate Prior Authorization     |    |
|  | Letter for Cardiology            |    |
|  |                                  |    |
|  | A comprehensive template for...  |    |
|  |                                  |    |
|  | [Show Prompt]                    |    |
|  | [Copy] [Save]                    |    |
|  +----------------------------------+    |
|                                          |
|  +----------------------------------+    |
|  | [Oncology] [Patient Ed]          |    |
|  |                                  |    |
|  | Create Patient Education         |    |
|  | Materials for Cancer Care        |    |
|  |                                  |    |
|  | Easy-to-understand materials...  |    |
|  |                                  |    |
|  | [Show Prompt]                    |    |
|  | [Copy] [Save]                    |    |
|  +----------------------------------+    |
|                                          |
|  +----------------------------------+    |
|  | [Primary Care] [Documentation]   |    |
|  |                                  |    |
|  | SOAP Note Generator              |    |
|  |                                  |    |
|  | Structured template for...       |    |
|  |                                  |    |
|  | [Show Prompt]                    |    |
|  | [Copy] [Save]                    |    |
|  +----------------------------------+    |
|                                          |
|  [Load More]                            |
+------------------------------------------+
```

### Sign In with Google Modal
```
+------------------------------------------+
|  Sign In to PromptMD                     |
|  --------------------------------------  |
|                                          |
|  [Sign in with Google]                   |
|                                          |
|  By signing in, you'll be able to:       |
|  • Save prompts                          |
|  • Create your own prompts              |
|  • Share prompts with others            |
|  • Track your usage                     |
|                                          |
+------------------------------------------+
```

## Prompt Card Design

### Compact Card View
```
+------------------------------------------+
|  [Cardiology] [Documentation]            |
|                                          |
|  Generate Prior Authorization Letter     |
|  for Cardiology Procedures               |
|                                          |
|  A comprehensive template for creating   |
|  prior authorization letters for common  |
|  cardiology procedures, including...     |
|                                          |
|  [Show Prompt]                           |
|                                          |
|  [Copy] [Save] [Share]                   |
+------------------------------------------+
```

### Expanded Prompt View (Modal/Slide-out)
```
+------------------------------------------+
|  Generate Prior Authorization Letter     |
|  for Cardiology Procedures               |
|                                          |
|  [Cardiology] [Documentation] [GPT-4]    |
|                                          |
|  Prompt:                                 |
|  You are a cardiology specialist...      |
|  [Full prompt text here]                 |
|                                          |
|  Example Output:                         |
|  [Sample output preview]                 |
|                                          |
|  [Copy] [Save] [Share] [Edit]           |
+------------------------------------------+
```

## Design Specifications

### Color Scheme (from design-guide.md)
- Primary: text-teal-600 (#0D9488)
- Secondary: text-slate-800 (#1E293B)
- Background: bg-slate-50 (#F8FAFC)
- Tags: bg-teal-100 (#CCFBF1)

### Typography
- Title: text-lg (1.125rem)
- Description: text-sm (0.875rem)
- Tags: text-xs (0.75rem)

### Spacing
- Card padding: p-3 (0.75rem)
- Element gaps: m-2 (0.5rem)
- Section margins: m-4 (1rem)

### Interactive Elements
- Hover states for all clickable elements
- Subtle transitions for expanding/collapsing content
- Clear visual feedback for actions

## Responsive Considerations
- Single-column layout for smaller screens
- Full-width modal/slide-out on mobile
- Touch-friendly targets (minimum 44px)
- Collapsible filters on mobile

## User Flow
1. User opens extension
2. Views prompt cards with essential information
3. Can filter/search using searchable dropdowns
4. Clicks "Show Prompt" to view full content
5. Can copy, save, or share the prompt
6. Can create new prompts or edit existing ones

## Future Considerations
- Support for different prompt types
- Integration with other AI tools
- Collaboration features
- Usage analytics
- Personal collections