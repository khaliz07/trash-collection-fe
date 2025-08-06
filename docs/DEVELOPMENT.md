# Development Setup & Workflow Documentation

## 1. Environment Setup

### 1.1. Prerequisites

#### System Requirements
```bash
# Node.js version (check với .nvmrc nếu có)
node --version  # >= 18.17.0
npm --version   # >= 9.0.0

# Alternative: Use pnpm for faster installs
npm install -g pnpm
pnpm --version  # >= 8.0.0

# Git version
git --version   # >= 2.30.0
```

#### Development Tools
```bash
# VS Code với các extensions cần thiết
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension ms-vscode.vscode-typescript-next

# Chrome DevTools Extensions
# - React Developer Tools
# - Tailwind CSS IntelliSense
```

### 1.2. Project Setup

#### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd fe_5

# Install dependencies
npm install
# or
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
# or
pnpm dev
```

#### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
DATABASE_URL=postgresql://user:password@localhost:5432/ecocollect
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Development specific
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
```

### 1.3. IDE Configuration

#### VS Code Settings
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### VS Code Extensions Config
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode", 
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

## 2. Development Workflow

### 2.1. Branch Strategy

#### Git Flow
```bash
# Main branches
main        # Production ready code
develop     # Integration branch for features

# Supporting branches
feature/*   # New features
hotfix/*    # Critical production fixes
release/*   # Release preparation
```

#### Branch Naming Convention
```bash
# Feature branches
feature/user-dashboard-redesign
feature/payment-integration-stripe
feature/collector-mobile-app

# Bug fixes
bugfix/login-form-validation
bugfix/map-display-issue

# Hotfixes
hotfix/security-patch-auth
hotfix/payment-gateway-timeout
```

### 2.2. Commit Convention

#### Conventional Commits
```bash
# Format: <type>(<scope>): <description>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation only changes
style:    # Code style changes (formatting, missing semi colons, etc)
refactor: # Code refactoring 
test:     # Adding missing tests
chore:    # Changes to build process or auxiliary tools

# Examples:
feat(auth): add login form validation
fix(dashboard): resolve data loading spinner issue
docs(readme): update installation instructions
style(components): format button component code
refactor(utils): extract common utility functions
test(api): add unit tests for user service
chore(deps): update dependencies to latest versions
```

#### Commit Message Examples
```bash
feat(user): implement subscription extension feature
- Add extend subscription dialog component
- Integrate payment processing for extensions
- Update user dashboard to show extension options
- Add validation for subscription dates

fix(collector): resolve GPS tracking accuracy issues
- Implement more precise location tracking
- Add fallback for GPS failures
- Update location update frequency
- Fix memory leaks in location service

docs(api): document collection endpoints
- Add JSDoc comments for all collection routes
- Include request/response examples
- Document error codes and handling
- Update API version information
```

### 2.3. Code Quality Standards

#### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

#### Prettier Configuration
```json
// .prettierrc
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

#### TypeScript Configuration
```json
// tsconfig.json highlights
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", ".next", "out"]
}
```

## 3. Component Development

### 3.1. Component Architecture

#### File Structure Pattern
```
components/
├── ui/                     # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── common/                 # Shared business components
│   ├── status-badge.tsx
│   ├── data-table.tsx
│   └── loading-spinner.tsx
├── dashboard/             # Dashboard specific components
│   ├── sidebar-nav.tsx
│   ├── user-nav.tsx
│   └── dashboard-header.tsx
└── forms/                 # Form components
    ├── login-form.tsx
    ├── user-form.tsx
    └── collection-form.tsx
```

#### Component Template
```typescript
// components/example-component.tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface ExampleComponentProps {
  /**
   * The main content to display
   */
  children: React.ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Component variant
   */
  variant?: 'default' | 'secondary'
  /**
   * Disabled state
   */
  disabled?: boolean
}

/**
 * ExampleComponent provides a reusable UI element with consistent styling
 * 
 * @param props - Component props
 * @returns JSX element
 */
export function ExampleComponent({
  children,
  className,
  variant = 'default',
  disabled = false,
  ...props
}: ExampleComponentProps) {
  return (
    <div
      className={cn(
        // Base styles
        'flex items-center gap-2 p-4 rounded-lg border',
        // Variant styles
        {
          'bg-primary text-primary-foreground': variant === 'default',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
        },
        // State styles
        {
          'opacity-50 cursor-not-allowed': disabled,
        },
        // Custom className
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

ExampleComponent.displayName = 'ExampleComponent'
```

### 3.2. Form Development

#### Form Validation Pattern
```typescript
// schemas/user-form.ts
import { z } from 'zod'

export const userFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{9,11}$/, 'Please enter a valid phone number'),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    postalCode: z.string().regex(/^\d{5}$/, 'Please enter a valid postal code'),
  }),
})

export type UserFormData = z.infer<typeof userFormSchema>
```

#### Form Component Pattern
```typescript
// components/forms/user-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userFormSchema, type UserFormData } from '@/schemas/user-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface UserFormProps {
  defaultValues?: Partial<UserFormData>
  onSubmit: (data: UserFormData) => void | Promise<void>
  isLoading?: boolean
}

export function UserForm({ defaultValues, onSubmit, isLoading }: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
      },
      ...defaultValues,
    },
  })

  const handleSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
      // Handle error state
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Additional form fields... */}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

### 3.3. Custom Hooks

#### Hook Development Pattern
```typescript
// hooks/use-collection-status.ts
import { useState, useEffect } from 'react'
import { CollectionStatus } from '@/types/collection'

interface UseCollectionStatusProps {
  collectionId: string
  refreshInterval?: number
}

interface UseCollectionStatusReturn {
  status: CollectionStatus | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useCollectionStatus({
  collectionId,
  refreshInterval = 30000, // 30 seconds
}: UseCollectionStatusProps): UseCollectionStatusReturn {
  const [status, setStatus] = useState<CollectionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/collections/${collectionId}/status`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch collection status')
      }
      
      const data = await response.json()
      setStatus(data.status)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = () => {
    fetchStatus()
  }

  useEffect(() => {
    fetchStatus()

    const interval = setInterval(fetchStatus, refreshInterval)
    return () => clearInterval(interval)
  }, [collectionId, refreshInterval])

  return {
    status,
    isLoading,
    error,
    refresh,
  }
}
```

## 4. Testing Strategy

### 4.1. Testing Setup

#### Jest Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

#### Testing Utilities
```typescript
// test-utils/render.tsx
import { render } from '@testing-library/react'
import { ThemeProvider } from '@/components/ui/theme-provider'

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {ui}
    </ThemeProvider>
  )
}

export * from '@testing-library/react'
export { renderWithProviders as render }
```

### 4.2. Component Testing

#### Unit Test Example
```typescript
// components/__tests__/status-badge.test.tsx
import { render, screen } from '@/test-utils'
import { StatusBadge } from '../status-badge'

describe('StatusBadge', () => {
  it('renders pending status correctly', () => {
    render(<StatusBadge status="pending" />)
    
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByTestId('status-badge')).toHaveClass('bg-amber-100')
  })

  it('renders completed status correctly', () => {
    render(<StatusBadge status="completed" />)
    
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByTestId('status-badge')).toHaveClass('bg-emerald-100')
  })

  it('handles unknown status gracefully', () => {
    render(<StatusBadge status="unknown" as any />)
    
    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(screen.getByTestId('status-badge')).toHaveClass('bg-gray-100')
  })
})
```

#### Integration Test Example
```typescript
// components/__tests__/user-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { UserForm } from '../forms/user-form'

describe('UserForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('submits form with valid data', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />)

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'john@example.com' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        // ... other expected values
      })
    })
  })

  it('shows validation errors for invalid data', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
})
```

### 4.3. E2E Testing with Playwright

#### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### E2E Test Example
```typescript
// e2e/user-registration.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Registration', () => {
  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    await page.fill('[name="name"]', 'John Doe')
    await page.fill('[name="email"]', 'john.doe@example.com')
    await page.fill('[name="password"]', 'SecurePassword123')
    await page.fill('[name="confirmPassword"]', 'SecurePassword123')

    // Submit form
    await page.click('button[type="submit"]')

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard/user')
    await expect(page.locator('h1')).toContainText('Welcome, John Doe')
  })

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/register')

    // Submit form without filling
    await page.click('button[type="submit"]')

    // Check for validation errors
    await expect(page.locator('text=Name is required')).toBeVisible()
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })
})
```

## 5. Performance Optimization

### 5.1. Code Splitting

#### Dynamic Imports
```typescript
// Lazy load heavy components
const MapComponent = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
})

const ChartComponent = dynamic(() => import('./chart-component'), {
  loading: () => <ChartSkeleton />
})

// Route-level code splitting is automatic in Next.js App Router
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npm run analyze

# Or use @next/bundle-analyzer
npm install --save-dev @next/bundle-analyzer
```

### 5.2. Image Optimization

```typescript
// components/optimized-image.tsx
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

### 5.3. Performance Monitoring

```typescript
// lib/performance.ts
export function measurePerformance(name: string, fn: () => void) {
  if (typeof performance !== 'undefined') {
    const start = performance.now()
    fn()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
  } else {
    fn()
  }
}

// Web Vitals tracking
export function reportWebVitals(metric: any) {
  console.log(metric)
  
  // Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // gtag('event', metric.name, {
    //   value: Math.round(metric.value),
    //   event_label: metric.id,
    // })
  }
}
```

## 6. Deployment

### 6.1. Build Process

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui"
  }
}
```

### 6.2. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run e2e

  deploy:
    needs: [test, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 7. Debugging & Troubleshooting

### 7.1. Development Debugging

```typescript
// lib/debug.ts
export const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 ${message}`, data)
    }
  },
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${message}`, error)
    }
  },
  performance: (label: string, fn: () => void) => {
    if (process.env.NODE_ENV === 'development') {
      console.time(label)
      fn()
      console.timeEnd(label)
    } else {
      fn()
    }
  }
}

// Usage in components
debug.log('User form submitted', formData)
debug.performance('Database query', () => {
  // expensive operation
})
```

### 7.2. Error Boundary

```typescript
// components/error-boundary.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo)
    
    // Log to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
          <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false })}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

*Tài liệu này cung cấp quy trình phát triển hoàn chỉnh để đảm bảo chất lượng code và hiệu suất làm việc nhóm cho dự án EcoCollect.*
