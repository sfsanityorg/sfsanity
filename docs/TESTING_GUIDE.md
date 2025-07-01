# Testing Guide

## Quick Start

### Run All Tests
\`\`\`bash
npm run test:all  # Lint + Type Check + Unit Tests + Build
\`\`\`

### Development Testing
\`\`\`bash
npm run test:watch    # Watch mode for unit tests
npm run test:coverage # Coverage report
npm run test:e2e:open # Interactive E2E testing
\`\`\`

## Test Structure

### Unit Tests (\`__tests__/\`)
- **lib/**: Utility function tests
- **components/**: Component behavior tests
- **Coverage Target**: 70% minimum

### E2E Tests (\`cypress/e2e/\`)
- **dashboard.cy.ts**: Main dashboard functionality
- **test-page.cy.ts**: Simple page verification

### Fixtures (\`cypress/fixtures/\`)
- **items.json**: Mock data for testing

## Writing Tests

### Component Test Example
\`\`\`typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
\`\`\`

### E2E Test Example
\`\`\`typescript
describe('Feature', () => {
  it('should work end-to-end', () => {
    cy.visit('/page')
    cy.contains('Button').click()
    cy.contains('Expected Result').should('be.visible')
  })
})
\`\`\`

## CI/CD Integration

Tests run automatically on:
- **Pull Requests**: Quick validation
- **Main Branch**: Full test suite + deployment
- **Pre-commit**: Lint + type check + component organization

## Coverage Reports

View coverage at: \`coverage/lcov-report/index.html\`

Target thresholds:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%
