# UI/UX Design System Documentation

## 1. Design System Overview

### 1.1. Design Philosophy
EcoCollect sử dụng **Modern Clean Design** với các nguyên tắc:
- **Minimalism**: Giao diện sạch sẽ, tập trung vào chức năng
- **Accessibility**: Tuân thủ WCAG 2.1 guidelines
- **Consistency**: Unified design language across all platforms
- **Responsiveness**: Mobile-first design approach
- **Performance**: Optimized for fast loading và smooth interactions

### 1.2. Design Tokens

#### Color Palette
```css
:root {
  /* Primary Colors - Green theme for eco-friendly */
  --primary: 142 76% 36%;        /* #16A34A - Main brand green */
  --primary-foreground: 0 0% 98%; /* #FAFAFA - White on primary */
  
  /* Secondary Colors */
  --secondary: 210 40% 96%;      /* #F1F5F9 - Light gray */
  --secondary-foreground: 222.2 84% 4.9%; /* #0F172A - Dark gray */
  
  /* Accent Colors */
  --accent: 210 40% 96%;         /* #F1F5F9 - Subtle accent */
  --accent-foreground: 222.2 47.4% 11.2%; /* #1E293B - Dark accent text */
  
  /* Status Colors */
  --success: 142 76% 36%;        /* #16A34A - Success green */
  --warning: 38 92% 50%;         /* #F59E0B - Warning amber */
  --error: 0 84% 60%;            /* #EF4444 - Error red */
  --info: 217 91% 60%;           /* #3B82F6 - Info blue */
  
  /* Neutral Colors */
  --background: 0 0% 100%;       /* #FFFFFF - Main background */
  --foreground: 222.2 84% 4.9%;  /* #0F172A - Main text */
  
  --muted: 210 40% 96%;          /* #F1F5F9 - Muted background */
  --muted-foreground: 215.4 16.3% 46.9%; /* #64748B - Muted text */
  
  --card: 0 0% 100%;             /* #FFFFFF - Card background */
  --card-foreground: 222.2 84% 4.9%; /* #0F172A - Card text */
  
  --border: 214.3 31.8% 91.4%;  /* #E2E8F0 - Border color */
  --input: 214.3 31.8% 91.4%;   /* #E2E8F0 - Input border */
  --ring: 142 76% 36%;           /* #16A34A - Focus ring */
}

/* Dark mode variants */
[data-theme="dark"] {
  --background: 222.2 84% 4.9%;  /* #0F172A - Dark background */
  --foreground: 210 40% 98%;     /* #F8FAFC - Light text */
  
  --card: 222.2 84% 4.9%;        /* #0F172A - Dark card */
  --card-foreground: 210 40% 98%; /* #F8FAFC - Light card text */
  
  --muted: 217.2 32.6% 17.5%;    /* #1E293B - Dark muted */
  --muted-foreground: 215 20.2% 65.1%; /* #94A3B8 - Light muted text */
  
  --border: 217.2 32.6% 17.5%;   /* #1E293B - Dark border */
  --input: 217.2 32.6% 17.5%;    /* #1E293B - Dark input border */
}
```

#### Typography Scale
```css
/* Font Family */
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes - Using fluid typography */
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);   /* 12-14px */
--text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);     /* 14-16px */
--text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);     /* 16-18px */
--text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);    /* 18-20px */
--text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);     /* 20-24px */
--text-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);          /* 24-32px */
--text-3xl: clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem);  /* 30-40px */
--text-4xl: clamp(2.25rem, 2rem + 1.25vw, 3rem);        /* 36-48px */

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line Heights */
--line-height-tight: 1.25;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;
```

#### Spacing Scale
```css
/* Spacing using 8px base unit */
--spacing-0: 0;
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
--spacing-16: 4rem;    /* 64px */
--spacing-20: 5rem;    /* 80px */
--spacing-24: 6rem;    /* 96px */

/* Container max widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

#### Border Radius Scale
```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-base: 0.25rem;   /* 4px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-full: 9999px;    /* Full round */
```

## 2. Component Library

### 2.1. Base UI Components (shadcn/ui)

#### Button Component
```typescript
// Base button variants
interface ButtonProps {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  children: React.ReactNode
}

// Usage examples
<Button variant="default">Primary Action</Button>
<Button variant="outline" size="sm">Secondary Action</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

**Button Styles**:
```css
/* Default (Primary) */
.btn-default {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.btn-default:hover {
  background-color: hsl(var(--primary) / 0.9);
}

/* Outline */
.btn-outline {
  border: 1px solid hsl(var(--input));
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

.btn-outline:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

/* Ghost */
.btn-ghost {
  background-color: transparent;
  color: hsl(var(--foreground));
}

.btn-ghost:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}
```

#### Card Component
```typescript
interface CardProps {
  className?: string
  children: React.ReactNode
}

// Compound components
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card body content */}
  </CardContent>
  <CardFooter>
    {/* Card footer actions */}
  </CardFooter>
</Card>
```

**Card Styles**:
```css
.card {
  border-radius: var(--radius-lg);
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-6);
}

.card-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.card-description {
  font-size: var(--text-sm);
  color: hsl(var(--muted-foreground));
}
```

#### Input Component
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'
  placeholder?: string
  disabled?: boolean
  className?: string
}

// Usage
<div className="form-field">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    className="mt-1"
  />
</div>
```

**Input Styles**:
```css
.input {
  height: 2.5rem;
  width: 100%;
  border-radius: var(--radius-md);
  border: 1px solid hsl(var(--input));
  background-color: hsl(var(--background));
  padding: 0 var(--spacing-3);
  font-size: var(--text-sm);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
}

.input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.input::placeholder {
  color: hsl(var(--muted-foreground));
}
```

### 2.2. Form Components

#### Form Field Pattern
```typescript
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Field Label</FormLabel>
      <FormControl>
        <Input placeholder="Enter value" {...field} />
      </FormControl>
      <FormDescription>
        Helper text describing the field
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Form Validation States**:
```css
/* Success state */
.form-item.success .input {
  border-color: hsl(var(--success));
}

.form-item.success .form-message {
  color: hsl(var(--success));
}

/* Error state */
.form-item.error .input {
  border-color: hsl(var(--error));
}

.form-item.error .form-message {
  color: hsl(var(--error));
}

/* Form message styles */
.form-message {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-2);
}
```

#### Select Component
```typescript
<Select onValueChange={field.onChange} defaultValue={field.value}>
  <FormControl>
    <SelectTrigger>
      <SelectValue placeholder="Select an option" />
    </SelectTrigger>
  </FormControl>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

### 2.3. Status & Feedback Components

#### Badge Component
```typescript
interface BadgeProps {
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  children: React.ReactNode
}

// Status-specific badge variants
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Draft</Badge>
```

**Badge Styles**:
```css
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  padding: 0.125rem 0.625rem;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-default {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.badge-secondary {
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}

.badge-destructive {
  background-color: hsl(var(--error));
  color: white;
}

.badge-outline {
  border: 1px solid hsl(var(--border));
  color: hsl(var(--foreground));
}
```

#### Status Badge System
```typescript
// Custom status badge component
interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Activity
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle
  }
}
```

### 2.4. Data Display Components

#### Table Component
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Amount</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>
          <StatusBadge status={item.status} />
        </TableCell>
        <TableCell>{item.amount}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Table Styles**:
```css
.table {
  width: 100%;
  caption-side: bottom;
  border-collapse: collapse;
}

.table-header {
  border-bottom: 1px solid hsl(var(--border));
}

.table-header th {
  height: 3rem;
  padding: 0 var(--spacing-4);
  text-align: left;
  font-weight: var(--font-weight-medium);
  color: hsl(var(--muted-foreground));
}

.table-body tr {
  border-bottom: 1px solid hsl(var(--border));
  transition: background-color 0.2s;
}

.table-body tr:hover {
  background-color: hsl(var(--muted) / 0.5);
}

.table-cell {
  padding: var(--spacing-4);
  vertical-align: middle;
}
```

#### Progress Component
```typescript
interface ProgressProps {
  value: number // 0-100
  className?: string
  indicatorClassName?: string
}

<Progress value={75} className="h-2" />

// With label
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Progress</span>
    <span>75%</span>
  </div>
  <Progress value={75} />
</div>
```

**Progress Styles**:
```css
.progress {
  position: relative;
  height: 0.5rem;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-full);
  background-color: hsl(var(--secondary));
}

.progress-indicator {
  height: 100%;
  width: 100%;
  background-color: hsl(var(--primary));
  transition: transform 0.2s ease-in-out;
  transform: translateX(-${100 - value}%);
}
```

## 3. Layout Patterns

### 3.1. Page Layouts

#### Dashboard Layout
```css
.dashboard-layout {
  display: grid;
  min-height: 100vh;
  grid-template-rows: auto 1fr;
}

@media (min-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 240px 1fr;
    grid-template-rows: 1fr;
  }
}

.dashboard-sidebar {
  background-color: hsl(var(--card));
  border-right: 1px solid hsl(var(--border));
  padding: var(--spacing-6);
}

.dashboard-main {
  padding: var(--spacing-6);
  overflow: auto;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--spacing-6);
  border-bottom: 1px solid hsl(var(--border));
  margin-bottom: var(--spacing-6);
}
```

#### Card Grid Layout
```css
.card-grid {
  display: grid;
  gap: var(--spacing-6);
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.card-grid-large {
  display: grid;
  gap: var(--spacing-6);
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .card-grid-large {
    grid-template-columns: 2fr 1fr;
  }
}
```

### 3.2. Component Spacing

#### Section Spacing
```css
.section {
  padding-top: var(--spacing-16);
  padding-bottom: var(--spacing-16);
}

@media (min-width: 1024px) {
  .section {
    padding-top: var(--spacing-24);
    padding-bottom: var(--spacing-24);
  }
}

.section-header {
  margin-bottom: var(--spacing-12);
  text-align: center;
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-4);
}

.section-description {
  font-size: var(--text-lg);
  color: hsl(var(--muted-foreground));
  max-width: 42rem;
  margin: 0 auto;
}
```

## 4. Animation & Transitions

### 4.1. CSS Animations

#### Fade In Animation
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-fade-in-delay-1 {
  animation: fadeIn 0.3s ease-out 0.1s both;
}

.animate-fade-in-delay-2 {
  animation: fadeIn 0.3s ease-out 0.2s both;
}
```

#### Loading Animations
```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### Skeleton Loading
```css
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  display: inline-block;
  height: 1em;
  position: relative;
  overflow: hidden;
  background-color: hsl(var(--muted));
  border-radius: var(--radius-base);
}

.skeleton::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    hsl(var(--background) / 0.6),
    transparent
  );
  animation: shimmer 1.5s infinite;
  content: '';
}
```

### 4.2. Hover & Focus States

#### Interactive Elements
```css
.interactive {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.interactive:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px 0 rgb(0 0 0 / 0.15);
}

.interactive:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}

/* Focus states for accessibility */
.focus-visible {
  outline: none;
}

.focus-visible:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

#### Button Hover States
```css
.btn-primary:hover {
  background-color: hsl(var(--primary) / 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px 0 hsl(var(--primary) / 0.3);
}

.btn-secondary:hover {
  background-color: hsl(var(--accent));
  border-color: hsl(var(--border));
}

.btn-ghost:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}
```

## 5. Responsive Design

### 5.1. Breakpoint System

```css
/* Mobile First Approach */
/* xs: 0px */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */

.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding: 0 var(--spacing-6);
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

### 5.2. Responsive Typography

```css
.heading-1 {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-6);
}

.heading-2 {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-4);
}

.body-large {
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: var(--line-height-relaxed);
}

.body {
  font-size: var(--text-base);
  line-height: var(--line-height-normal);
}

.body-small {
  font-size: var(--text-sm);
  line-height: var(--line-height-normal);
  color: hsl(var(--muted-foreground));
}
```

### 5.3. Mobile Navigation

```css
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: hsl(var(--background));
  border-bottom: 1px solid hsl(var(--border));
  padding: var(--spacing-4);
  z-index: 50;
}

@media (min-width: 768px) {
  .mobile-nav {
    display: none;
  }
}

.mobile-nav-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--background));
}
```

## 6. Dark Mode Implementation

### 6.1. Theme Toggle

```typescript
// Theme provider context
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

// Theme toggle component
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark  
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 6.2. Dark Mode Color Adjustments

```css
/* Dark mode specific adjustments */
[data-theme="dark"] {
  --primary: 142 76% 36%;     /* Keep primary green consistent */
  
  /* Adjust background hierarchy */
  --background: 224 71% 4%;   /* Very dark blue-gray */
  --card: 224 71% 4%;
  --popover: 224 71% 4%;
  
  /* Softer borders in dark mode */
  --border: 216 34% 17%;
  --input: 216 34% 17%;
  
  /* Muted elements */
  --muted: 223 47% 11%;
  --muted-foreground: 215 20% 65%;
  
  /* Accent colors */
  --accent: 216 34% 17%;
  --accent-foreground: 210 40% 98%;
}

/* Dark mode specific component styles */
[data-theme="dark"] .card {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
}

[data-theme="dark"] .input {
  background-color: hsl(var(--background));
  border-color: hsl(var(--border));
}

[data-theme="dark"] .input:focus {
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.3);
}
```

## 7. Accessibility (a11y)

### 7.1. Focus Management

```css
/* Focus ring for keyboard navigation */
.focus-ring {
  outline: none;
}

.focus-ring:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Skip to content link */
.skip-to-content {
  position: absolute;
  left: -9999px;
  z-index: 9999;
  padding: var(--spacing-3) var(--spacing-4);
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  text-decoration: none;
  border-radius: var(--radius-md);
}

.skip-to-content:focus {
  left: var(--spacing-4);
  top: var(--spacing-4);
}
```

### 7.2. Screen Reader Support

```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn-primary {
    border: 2px solid currentColor;
  }
  
  .card {
    border: 2px solid hsl(var(--border));
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 7.3. Color Contrast

```css
/* Ensure WCAG AA contrast ratios */
:root {
  /* Text on background: 4.5:1 minimum */
  --foreground: 222.2 84% 4.9%;  /* #0F172A - contrast ratio 15.8:1 on white */
  
  /* Secondary text: 4.5:1 minimum */
  --muted-foreground: 215.4 16.3% 46.9%; /* #64748B - contrast ratio 4.6:1 on white */
  
  /* Primary button: 3:1 minimum for UI elements */
  --primary: 142 76% 36%;  /* #16A34A - sufficient contrast with white text */
}
```

## 8. Performance Optimization

### 8.1. CSS Performance

```css
/* Use efficient selectors */
.component-class {
  /* Avoid descendant selectors when possible */
}

/* Avoid expensive properties in animations */
@keyframes performant-animation {
  from {
    opacity: 0;
    transform: translateY(10px); /* Use transform instead of changing layout properties */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Use will-change for optimization */
.animated-element {
  will-change: transform, opacity;
}

.animated-element:hover {
  transform: translateY(-2px);
}
```

### 8.2. Image Optimization

```css
/* Responsive images */
.responsive-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* Lazy loading placeholder */
.image-placeholder {
  background-color: hsl(var(--muted));
  background-image: linear-gradient(
    45deg,
    transparent 25%,
    hsl(var(--muted-foreground) / 0.1) 25%,
    hsl(var(--muted-foreground) / 0.1) 50%,
    transparent 50%,
    transparent 75%,
    hsl(var(--muted-foreground) / 0.1) 75%
  );
  background-size: 20px 20px;
  animation: shimmer 1s ease-in-out infinite;
}
```

## 9. Icon System

### 9.1. Lucide Icons Usage

```typescript
// Consistent icon sizing
const iconSizes = {
  xs: 'h-3 w-3',      // 12px
  sm: 'h-4 w-4',      // 16px  
  md: 'h-5 w-5',      // 20px
  lg: 'h-6 w-6',      // 24px
  xl: 'h-8 w-8',      // 32px
}

// Icon component wrapper
interface IconProps {
  icon: LucideIcon
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

function Icon({ icon: LucideIcon, size = 'md', className }: IconProps) {
  return (
    <LucideIcon 
      className={cn(iconSizes[size], className)} 
      aria-hidden="true" 
    />
  )
}
```

### 9.2. Status Icons

```typescript
const statusIcons = {
  pending: Clock,
  in_progress: Activity, 
  completed: CheckCircle,
  cancelled: XCircle,
  overdue: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
}

// Usage in status displays
<div className="flex items-center gap-2">
  <Icon 
    icon={statusIcons[status]} 
    size="sm" 
    className={statusColorMap[status]}
  />
  <span>{statusLabel}</span>
</div>
```

---

*Tài liệu này cung cấp hệ thống design hoàn chỉnh để đảm bảo tính nhất quán và chất lượng UI/UX cho toàn bộ ứng dụng EcoCollect.*
