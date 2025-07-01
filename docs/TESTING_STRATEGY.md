# Testing Strategy and Implementation

## Testing Framework Setup

### 1. Install Testing Dependencies
\`\`\`json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0",
    "@types/jest": "^29.5.0",
    "cypress": "^12.17.0",
    "@cypress/react": "^7.0.3"
  }
}
\`\`\`

### 2. Jest Configuration
\`\`\`javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
\`\`\`

## Unit Tests

### 1. Utility Function Tests
\`\`\`typescript
// __tests__/lib/error-handler.test.ts
import { handleError, ErrorType } from '@/lib/error-handler'

describe('Error Handler', () => {
  it('should handle Supabase errors correctly', () => {
    const supabaseError = {
      code: '42P01',
      message: 'relation "items" does not exist',
    }

    const result = handleError(supabaseError, { operation: 'test' })

    expect(result.type).toBe(ErrorType.DATABASE)
    expect(result.code).toBe('42P01')
    expect(result.userMessage).toContain('table doesn\'t exist')
  })

  it('should sanitize sensitive context data', () => {
    const error = new Error('Test error')
    const sensitiveContext = {
      password: 'secret123',
      apiKey: 'key_123',
      normalData: 'safe',
    }

    const result = handleError(error, sensitiveContext)

    expect(result.context?.password).toBe('[REDACTED]')
    expect(result.context?.apiKey).toBe('[REDACTED]')
    expect(result.context?.normalData).toBe('safe')
  })
})
\`\`\`

### 2. Schema Validation Tests
\`\`\`typescript
// __tests__/lib/schemas.test.ts
import { ItemSchema, safeValidateItems } from '@/lib/schemas'

describe('Schema Validation', () => {
  it('should validate correct item data', () => {
    const validItem = {
      id: 1,
      name: 'Test Item',
      description: 'Test description',
      created_at: '2023-01-01T00:00:00Z',
      status: 'active',
    }

    const result = ItemSchema.safeParse(validItem)
    expect(result.success).toBe(true)
  })

  it('should handle invalid data gracefully', () => {
    const invalidData = {
      id: 'not-a-number',
      name: '',
      created_at: 'invalid-date',
    }

    const result = safeValidateItems([invalidData])
    expect(result.success).toBe(false)
    expect(result.debug.suggestions).toContain('Convert id from string to number')
  })

  it('should transform empty strings to null', () => {
    const itemWithEmptyDescription = {
      id: 1,
      name: 'Test',
      description: '   ',
      created_at: '2023-01-01T00:00:00Z',
      status: 'active',
    }

    const result = ItemSchema.safeParse(itemWithEmptyDescription)
    expect(result.success).toBe(true)
    expect(result.data?.description).toBe(null)
  })
})
\`\`\`

## Component Tests

### 1. Error Boundary Tests
\`\`\`typescript
// __tests__/components/error-boundary.test.tsx
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '@/components/error-boundary'

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('should render error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })
})
\`\`\`

### 2. Database Status Component Tests
\`\`\`typescript
// __tests__/components/database-status.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { DatabaseStatus } from '@/components/database-status'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        count: 'exact',
        head: true,
      })),
    })),
  },
}))

describe('DatabaseStatus', () => {
  it('should show checking status initially', () => {
    render(<DatabaseStatus />)
    expect(screen.getByText('Checking...')).toBeInTheDocument()
  })

  it('should show connected status on successful connection', async () => {
    const mockSupabase = require('@/lib/supabase').supabase
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: null, error: null }),
    })

    render(<DatabaseStatus />)

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })
  })

  it('should show error status on connection failure', async () => {
    const mockSupabase = require('@/lib/supabase').supabase
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Connection failed' },
      }),
    })

    render(<DatabaseStatus />)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })
})
\`\`\`

## Integration Tests

### 1. API Route Tests
\`\`\`typescript
// __tests__/api/items.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/items/route'

describe('/api/items', () => {
  it('should return items successfully', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('should handle validation errors', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: '', // Invalid: empty name
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.error).toContain('validation')
  })
})
\`\`\`

## End-to-End Tests

### 1. Cypress Configuration
\`\`\`typescript
// cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
})
\`\`\`

### 2. E2E Test Examples
\`\`\`typescript
// cypress/e2e/dashboard.cy.ts
describe('Dashboard', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the dashboard successfully', () => {
    cy.contains('Data Dashboard').should('be.visible')
    cy.contains('Total Items').should('be.visible')
    cy.contains('Status').should('be.visible')
  })

  it('should display items when data is available', () => {
    cy.get('[data-testid="item-card"]').should('have.length.greaterThan', 0)
  })

  it('should handle infinite scroll toggle', () => {
    cy.get('#infinite-scroll').click()
    cy.get('#infinite-scroll').should('be.checked')
  })

  it('should retry on error', () => {
    // Simulate error condition
    cy.intercept('GET', '**/items**', { statusCode: 500 }).as('getItemsError')
    cy.reload()
    
    cy.contains('Try Again').click()
    cy.wait('@getItemsError')
  })
})
\`\`\`

## Performance Tests

### 1. Load Testing
\`\`\`typescript
// __tests__/performance/load.test.ts
import { performance } from 'perf_hooks'

describe('Performance Tests', () => {
  it('should load items within acceptable time', async () => {
    const start = performance.now()
    
    // Simulate loading items
    const response = await fetch('/api/items')
    const data = await response.json()
    
    const end = performance.now()
    const loadTime = end - start

    expect(loadTime).toBeLessThan(2000) // 2 seconds max
    expect(data.success).toBe(true)
  })

  it('should handle large datasets efficiently', async () => {
    const start = performance.now()
    
    // Test with large dataset
    const response = await fetch('/api/items?limit=1000')
    const data = await response.json()
    
    const end = performance.now()
    const loadTime = end - start

    expect(loadTime).toBeLessThan(5000) // 5 seconds max for large dataset
    expect(data.data.length).toBeLessThanOrEqual(1000)
  })
})
\`\`\`

## Test Scripts

### 1. Package.json Scripts
\`\`\`json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:all": "npm run test && npm run test:e2e"
  }
}
\`\`\`

### 2. CI/CD Integration
\`\`\`yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
      
      - name: Build application
        run: npm run build
      
      - name: Start application
        run: npm start &
        
      - name: Wait for application
        run: npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: npm run test:e2e
\`\`\`

This comprehensive testing strategy ensures code quality, reliability, and maintainability while providing confidence in deployments.
