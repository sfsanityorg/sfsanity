# Project Structure Guidelines

This document outlines the organization and structure of the Supabase Data Dashboard project.

## Directory Structure

\`\`\`
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout with providers
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui components (auto-generated)
│   ├── error-boundary.tsx # Error handling components
│   ├── error-display.tsx  
│   └── database-status.tsx
├── hooks/                 # Custom React hooks
│   └── use-mobile.tsx     # Mobile detection hook
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Database client
│   ├── error-handler.ts   # Error handling utilities
│   ├── secure-logger.ts   # Safe logging utilities
│   └── env.ts            # Environment validation
├── scripts/               # Database scripts
│   ├── create-sample-table.sql
│   └── add-more-sample-data.sql
└── docs/                  # Documentation
    ├── SECURITY.md
    └── PROJECT_STRUCTURE.md
\`\`\`

## Component Organization

### `/components/ui/`
- **Purpose**: Auto-generated shadcn/ui components
- **Rule**: Don't manually edit these files
- **Exception**: Only modify if customization is needed
- **Note**: These are managed by the shadcn CLI

### `/components/`
- **Purpose**: Custom application components
- **Examples**: Error boundaries, status displays, custom forms
- **Rule**: Application-specific components go here

### `/hooks/`
- **Purpose**: Custom React hooks
- **Examples**: `use-mobile.tsx`, `use-auth.tsx`
- **Rule**: Reusable stateful logic goes here
- **Important**: This is the canonical location for custom hooks

### `/lib/`
- **Purpose**: Utility functions and configurations
- **Examples**: Database clients, error handlers, validators
- **Rule**: Pure functions and configurations

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `ErrorBoundary.tsx`)
- **Hooks**: kebab-case with `use-` prefix (e.g., `use-mobile.tsx`)
- **Utilities**: kebab-case (e.g., `error-handler.ts`)
- **Pages**: kebab-case (e.g., `page.tsx`, `layout.tsx`)

### Exports
- **Components**: Named exports preferred
- **Hooks**: Default export for single hook, named for multiple
- **Utilities**: Named exports

## Import Guidelines

### Absolute Imports
Use `@/` prefix for all internal imports:
\`\`\`typescript
import { useIsMobile } from "@/hooks/use-mobile"
import { supabase } from "@/lib/supabase"
import { ErrorBoundary } from "@/components/error-boundary"
\`\`\`

### Import Order
1. React and Next.js imports
2. Third-party libraries
3. Internal utilities (`@/lib/`)
4. Internal hooks (`@/hooks/`)
5. Internal components (`@/components/`)
6. Relative imports (avoid when possible)

## Preventing Duplicates

### Before Adding New Files
1. **Check existing structure**: Look for similar functionality
2. **Search codebase**: Use `grep` or IDE search for similar names
3. **Follow conventions**: Use established patterns
4. **Update documentation**: Add to this guide if creating new patterns

### Common Duplicate Scenarios
- **Hooks**: Always check `/hooks/` directory first
- **Utilities**: Check `/lib/` for existing functions
- **Components**: Look in both `/components/` and `/components/ui/`
- **Types**: Check existing files for type definitions

### Cleanup Process
When duplicates are found:
1. **Identify canonical location** (follow this guide)
2. **Move/consolidate** to correct location
3. **Update all imports** throughout codebase
4. **Delete duplicate files**
5. **Update documentation**

## Best Practices

### File Organization
- **Single responsibility**: One main export per file
- **Logical grouping**: Related utilities in same file
- **Clear naming**: File name should match main export

### Dependencies
- **Minimize coupling**: Avoid circular dependencies
- **Clear interfaces**: Well-defined props and return types
- **Error handling**: All utilities should handle errors gracefully

### Documentation
- **JSDoc comments**: For complex functions
- **README updates**: When adding new patterns
- **Type definitions**: Export types for reuse

## Migration Guide

### Moving shadcn/ui Components
If you need to customize a shadcn/ui component:
1. Copy from `/components/ui/` to `/components/`
2. Rename to avoid conflicts
3. Update imports throughout codebase
4. Document the customization

### Adding New Hooks
1. Create in `/hooks/` directory
2. Use `use-` prefix in filename
3. Export as default if single hook
4. Add TypeScript types
5. Update this documentation

### Adding New Utilities
1. Create in `/lib/` directory
2. Use descriptive filename
3. Export named functions
4. Include error handling
5. Add tests if complex

Remember: **Consistency is key!** Follow these guidelines to maintain a clean, organized codebase.
