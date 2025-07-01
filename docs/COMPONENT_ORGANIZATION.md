# Component Organization Guide

This document outlines the proper organization of React components in the Supabase Data Dashboard project.

## Directory Structure

\`\`\`
components/
├── ui/                     # shadcn/ui components ONLY
│   ├── button.tsx         # ✅ shadcn/ui Button
│   ├── card.tsx           # ✅ shadcn/ui Card
│   ├── input.tsx          # ✅ shadcn/ui Input
│   └── ...                # Other shadcn/ui components
├── error-boundary.tsx     # ✅ Custom error handling
├── error-display.tsx      # ✅ Custom error UI
├── database-status.tsx    # ✅ Custom database component
├── environment-check.tsx  # ✅ Custom environment component
└── ...                    # Other custom components
\`\`\`

## Component Categories

### 1. `/components/ui/` - shadcn/ui Components
**Purpose**: Auto-generated UI primitives from shadcn/ui library

**Rules**:
- ✅ Only shadcn/ui components
- ✅ Installed via `npx shadcn@latest add [component]`
- ❌ Never manually create files here
- ❌ No custom business logic
- ❌ No application-specific components

**Examples**:
\`\`\`typescript
// ✅ Correct - shadcn/ui components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
\`\`\`

### 2. `/components/` - Custom Application Components
**Purpose**: Application-specific React components

**Rules**:
- ✅ Custom components with business logic
- ✅ Feature-specific components
- ✅ Modified shadcn components (renamed)
- ✅ Composite components using multiple UI components

**Examples**:
\`\`\`typescript
// ✅ Correct - custom components
import { DatabaseStatus } from "@/components/database-status"
import { ErrorBoundary } from "@/components/error-boundary"
import { EnvironmentCheck } from "@/components/environment-check"
\`\`\`

## Naming Conventions

### File Names
- **UI Components**: kebab-case (matches shadcn convention)
  - `button.tsx`, `card.tsx`, `dropdown-menu.tsx`
- **Custom Components**: kebab-case
  - `database-status.tsx`, `error-boundary.tsx`

### Component Names
- **PascalCase** for all React components
  - `Button`, `DatabaseStatus`, `ErrorBoundary`

### Import/Export Patterns
\`\`\`typescript
// ✅ Named exports for custom components
export function DatabaseStatus() { ... }
export { DatabaseStatus }

// ✅ Default exports for shadcn/ui components (auto-generated)
export default function Button() { ... }
\`\`\`

## Common Mistakes to Avoid

### ❌ Wrong: Custom components in ui/
\`\`\`typescript
// DON'T DO THIS
components/ui/database-status.tsx  // ❌ Custom component in ui/
components/ui/user-profile.tsx     // ❌ Business logic in ui/
components/ui/custom-button.tsx    // ❌ Modified shadcn in ui/
\`\`\`

### ✅ Correct: Proper organization
\`\`\`typescript
// DO THIS INSTEAD
components/database-status.tsx     // ✅ Custom component in root
components/user-profile.tsx        // ✅ Business logic in root
components/custom-button.tsx       // ✅ Modified component in root
\`\`\`

## Migration Guide

### Moving Misplaced Components

1. **Identify misplaced components**:
   \`\`\`bash
   # Check for non-shadcn components in ui/
   ls components/ui/ | grep -v "button\|card\|input" # etc.
   \`\`\`

2. **Move to correct location**:
   \`\`\`bash
   mv components/ui/database-status.tsx components/
   \`\`\`

3. **Update all imports**:
   \`\`\`typescript
   // Change from:
   import { DatabaseStatus } from "@/components/ui/database-status"
   
   // To:
   import { DatabaseStatus } from "@/components/database-status"
   \`\`\`

4. **Update exports if needed**:
   \`\`\`typescript
   // Ensure consistent export pattern
   export function DatabaseStatus() { ... }
   \`\`\`

### Adding New Components

#### For shadcn/ui components:
\`\`\`bash
# Use the official CLI
npx shadcn@latest add dialog
npx shadcn@latest add form
\`\`\`

#### For custom components:
\`\`\`typescript
// Create in components/ root
// components/feature-card.tsx
export function FeatureCard() {
  return <Card>...</Card>
}
\`\`\`

## Import Guidelines

### Absolute Imports
Always use `@/` prefix for internal imports:

\`\`\`typescript
// ✅ Correct
import { Button } from "@/components/ui/button"
import { DatabaseStatus } from "@/components/database-status"
import { supabase } from "@/lib/supabase"

// ❌ Incorrect
import { Button } from "../ui/button"
import { DatabaseStatus } from "./database-status"
\`\`\`

### Import Order
1. React and Next.js imports
2. Third-party libraries  
3. shadcn/ui components (`@/components/ui/`)
4. Custom components (`@/components/`)
5. Utilities and hooks (`@/lib/`, `@/hooks/`)
6. Types (if separate)

\`\`\`typescript
// ✅ Correct import order
import React from "react"
import { NextPage } from "next"
import { Database } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { DatabaseStatus } from "@/components/database-status"
import { ErrorBoundary } from "@/components/error-boundary"

import { supabase } from "@/lib/supabase"
import { useIsMobile } from "@/hooks/use-mobile"
\`\`\`

## Maintenance Checklist

### Regular Cleanup
- [ ] Verify no custom components in `/components/ui/`
- [ ] Check all imports use correct paths
- [ ] Ensure consistent naming conventions
- [ ] Update documentation when adding components

### Before Adding Components
- [ ] Determine if it's a shadcn/ui component or custom component
- [ ] Choose appropriate directory
- [ ] Follow naming conventions
- [ ] Use proper import/export patterns

### Code Review Checklist
- [ ] Components in correct directories
- [ ] Imports use absolute paths with `@/`
- [ ] No business logic in `/components/ui/`
- [ ] Consistent file and component naming

## Tools and Scripts

### Verification Script
\`\`\`bash
#!/bin/bash
# check-component-organization.sh

echo "Checking component organization..."

# Check for non-shadcn components in ui/
echo "Checking /components/ui/ for misplaced components..."
find components/ui/ -name "*.tsx" | while read file; do
  if ! grep -q "shadcn" "$file" 2>/dev/null; then
    echo "⚠️  Potential misplaced component: $file"
  fi
done

# Check for correct imports
echo "Checking for incorrect import paths..."
grep -r "from.*\.\./ui/" app/ components/ 2>/dev/null && echo "❌ Found relative imports to ui/" || echo "✅ No relative ui/ imports found"

echo "Component organization check complete!"
\`\`\`

## Best Practices

1. **Keep ui/ directory clean** - Only shadcn/ui components
2. **Use descriptive names** - Component purpose should be clear
3. **Group related components** - Consider subdirectories for large features
4. **Document complex components** - Add JSDoc comments
5. **Test component organization** - Include in CI/CD checks

Remember: **A well-organized component structure makes the codebase easier to maintain and understand!**
\`\`\`

Now let me update the main layout to ensure all imports are correct:

```typescriptreact file="app/layout.tsx"
[v0-no-op-code-block-prefix]import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { EnvironmentCheck } from "@/components/environment-check"
import { logger } from "@/lib/secure-logger"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Supabase Data Dashboard",
  description: "A simple frontend for displaying Supabase database items",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ErrorBoundary
            onError={(error, errorInfo) => {
              // Use secure logger instead of console.error
              logger.error("Application Error Boundary triggered", error, {
                component: "RootLayout",
                errorInfo: errorInfo.componentStack,
              })
            }}
          >
            <EnvironmentCheck>{children}</EnvironmentCheck>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
