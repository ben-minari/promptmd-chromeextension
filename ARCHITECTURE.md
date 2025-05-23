# PromptMD Architecture Guide

## Core Architectural Decisions

### 1. Authentication Flow
- **Single Source of Truth**: Authentication state is managed through `AuthContext` and `AuthProvider`
- **Component Structure**:
  - `PublicApp`: Main component for unauthenticated users, provides full browsing functionality
  - `AuthenticatedApp`: Handles authenticated user experience
  - No separate `UnauthenticatedApp` to avoid redundancy

### 2. Component Organization
- **Directory Structure**:
  ```
  src/
  ├── components/
  │   ├── prompts/     # Prompt-related components
  │   ├── ui/          # Reusable UI components
  │   └── layout/      # Layout components
  ├── contexts/        # React contexts
  ├── services/        # API and service layer
  └── utils/          # Utility functions
  ```

### 3. Component Design Principles
- **Single Responsibility**: Each component should have one primary purpose
- **Composition Over Inheritance**: Prefer component composition for reusability
- **Props Interface**: All components must have TypeScript interfaces for props
- **Styling**: Use Tailwind CSS with consistent color schemes and spacing

## Development Guidelines

### 1. Component Creation
- **Before creating a new component**:
  1. Check existing components for similar functionality
  2. Consider if the functionality can be added to an existing component
  3. If creating new, ensure it follows the established patterns

### 2. State Management
- Use React's built-in state management (`useState`, `useReducer`) for component-level state
- Use Context API for global state (auth, theme, etc.)
- Avoid prop drilling by using context or component composition

### 3. Type Safety
- All components must have TypeScript interfaces
- Use strict type checking
- Avoid `any` type unless absolutely necessary
- Document complex types with comments

### 4. Styling Guidelines
- Use Tailwind CSS utility classes
- Follow the established color scheme:
  - Primary: teal-* (for interactive elements)
  - Secondary: slate-* (for text and backgrounds)
  - Accent: Use sparingly for highlights
- Maintain consistent spacing using Tailwind's spacing scale
- Use responsive design patterns

### 5. Performance Considerations
- Implement proper memoization using `useMemo` and `useCallback`
- Lazy load components when appropriate
- Keep bundle size in mind when adding dependencies
- Use proper key props in lists

### 6. Testing Guidelines
- Write unit tests for utility functions
- Write component tests for complex UI logic
- Test error states and edge cases
- Maintain good test coverage

## Common Pitfalls to Avoid

1. **Component Redundancy**
   - Don't create new components for similar functionality
   - Enhance existing components to handle multiple use cases
   - Example: `TagFilterGroup` handles both categorized and uncategorized tags

2. **State Management**
   - Don't duplicate state across components
   - Use context for shared state
   - Keep state as close as possible to where it's used

3. **Type Safety**
   - Don't use `any` type
   - Don't skip TypeScript interfaces
   - Don't ignore type errors

4. **Styling**
   - Don't use inline styles
   - Don't create custom CSS unless absolutely necessary
   - Don't deviate from the established color scheme

## Future Development Considerations

1. **Scalability**
   - Keep components modular and reusable
   - Consider performance implications of new features
   - Plan for internationalization from the start

2. **Maintainability**
   - Document complex logic
   - Keep components focused and small
   - Follow consistent naming conventions

3. **Accessibility**
   - Maintain proper ARIA attributes
   - Ensure keyboard navigation works
   - Test with screen readers

4. **Security**
   - Never expose sensitive data in components
   - Validate all user inputs
   - Follow security best practices for authentication

## Getting Started

1. Review the existing codebase structure
2. Familiarize yourself with the component patterns
3. Follow the established guidelines for new development
4. When in doubt, refer to this document or discuss with the team

## Contributing

When contributing to the codebase:
1. Follow the established patterns
2. Document any architectural decisions
3. Update this document if making significant changes
4. Ensure all changes are properly typed and tested

## Current UX State (as of June 2024)

### Prompt Creation Flow
- **Create Prompt** button is always visible (header, floating action button, and under welcome message).
- Clicking "Create Prompt" opens the Create Prompt modal for all users (authenticated or not).
- Unauthenticated users can fill out the prompt form, but see a single "Sign In to Save" button instead of save/publish options.
- On clicking "Sign In to Save":
  - The draft is saved in memory.
  - The Google sign-in flow is triggered.
  - After successful authentication, the modal reopens with the draft pre-filled for review and publishing.
- Authenticated users can save as draft or publish directly from the modal.

### Search & Filtering
- The top header search bar uses fuzzy search (Fuse.js) across prompt title, description, and tags.
- Search results are highlighted minimally (single contiguous match per field/tag).
- Tag filters can be combined with search for powerful filtering.
- Both authenticated and unauthenticated experiences have the same search/filter UX.

### Modal & Tag UX
- Tag selection uses a multi-select dropdown with category-based color chips.
- Dropdowns have explicit close buttons and clear focus rings for accessibility.
- Modal state is managed so that drafts are preserved across sign-in and modal close/reopen.

### Authentication
- Auth state is managed globally via context.
- All prompt creation and saving actions are gated by authentication, but the UX allows unauthenticated users to start the process and finish after sign-in.

### General
- All major actions (create, search, filter, save) are accessible and consistent between public and authenticated views.
- UI is built with Tailwind CSS and follows a clean, minimal, and accessible design.

--- 