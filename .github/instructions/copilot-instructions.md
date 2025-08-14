Your task is to "onboard" this repository to Copilot coding agent by adding a .github/copilot-instructions.md file in the repository that contains information describing how a coding agent seeing it for the first time can work most efficiently.

You will do this task only one time per repository and doing a good job can SIGNIFICANTLY improve the quality of the agent's work, so take your time, think carefully, and search thoroughly before writing the instructions.

<Goals>
- Reduce the likelihood of a coding agent pull request getting rejected by the user due to
generating code that fails the continuous integration build, fails a validation pipeline, or
having misbehavior.
- Minimize bash command and build failures.
- Allow the agent to complete its task more quickly by minimizing the need for exploration using grep, find, str_replace_editor, and code search tools.
</Goals>

<Limitations>
- Instructions must be no longer than 2 pages.
- Instructions must not be task specific.
</Limitations>

<WhatToAdd>

Add the following high level details about the codebase to reduce the amount of searching the agent has to do to understand the codebase each time:
<HighLevelDetails>

- A summary of what the repository does.
- High level repository information, such as the size of the repo, the type of the project, the languages, frameworks, or target runtimes in use.
  </HighLevelDetails>

Add information about how to build and validate changes so the agent does not need to search and find it each time.
<BuildInstructions>

- For each of bootstrap, build, test, run, lint, and any other scripted step, document the sequence of steps to take to run it successfully as well as the versions of any runtime or build tools used.
- Each command should be validated by running it to ensure that it works correctly as well as any preconditions and postconditions.
- Try cleaning the repo and environment and running commands in different orders and document errors and and misbehavior observed as well as any steps used to mitigate the problem.
- Run the tests and document the order of steps required to run the tests.
- Make a change to the codebase. Document any unexpected build issues as well as the workarounds.
- Document environment setup steps that seem optional but that you have validated are actually required.
- Document the time required for commands that failed due to timing out.
- When you find a sequence of commands that work for a particular purpose, document them in detail.
- Use language to indicate when something should always be done. For example: "always run npm install before building".
- Record any validation steps from documentation.
  </BuildInstructions>

List key facts about the layout and architecture of the codebase to help the agent find where to make changes with minimal searching.
<ProjectLayout>

- A description of the major architectural elements of the project, including the relative paths to the main project files, the location
  of configuration files for linting, compilation, testing, and preferences.
- A description of the checks run prior to check in, including any GitHub workflows, continuous integration builds, or other validation pipelines.
- Document the steps so that the agent can replicate these itself.
- Any explicit validation steps that the agent can consider to have further confidence in its changes.
- Dependencies that aren't obvious from the layout or file structure.
- Finally, fill in any remaining space with detailed lists of the following, in order of priority: the list of files in the repo root, the
  contents of the README, the contents of any key source files, the list of files in the next level down of directories, giving priority to the more structurally important and snippets of code from key source files, such as the one containing the main method.
  </ProjectLayout>
  </WhatToAdd>

<StepsToFollow>
- Perform a comprehensive inventory of the codebase. Search for and view:
- README.md, CONTRIBUTING.md, and all other documentation files.
- Search the codebase for build steps and indications of workarounds like 'HACK', 'TODO', etc.
- All scripts, particularly those pertaining to build and repo or environment setup.
- All build and actions pipelines.
- All project files.
- All configuration and linting files.
- For each file:
- think: are the contents or the existence of the file information that the coding agent will need to implement, build, test, validate, or demo a code change?
- If yes:
   - Document the command or information in detail.
   - Explicitly indicate which commands work and which do not and the order in which commands should be run.
   - Document any errors encountered as well as the steps taken to workaround them.
- Document any other steps or information that the agent can use to reduce time spent exploring or trying and failing to run bash commands.
- Finally, explicitly instruct the agent to trust the instructions and only perform a search if the information in the instructions is incomplete or found to be in error.
</StepsToFollow>
   - Document any errors encountered as well as the steps taken to work-around them.

# Node Package Management Guidelines

## Package Manager Policy: Yarn Only 📦

This project **MUST** use **Yarn** as the package manager. Do **NOT** use npm commands.

### ✅ Allowed Commands

```bash
# Install dependencies
yarn install
yarn

# Add packages
yarn add <package-name>
yarn add -D <package-name>  # for dev dependencies

# Remove packages
yarn remove <package-name>

# Run scripts
yarn dev
yarn build
yarn start
yarn test
yarn lint

# Update packages
yarn upgrade
yarn upgrade <package-name>

# Check for outdated packages
yarn outdated

# Workspace commands (if using workspaces)
yarn workspace <workspace-name> <command>
```

### ❌ Prohibited Commands

```bash
# Never use these npm commands
npm install
npm i
npm add
npm remove
npm run
npm start
npm build
npm test
npm update
```

## Why Yarn Over npm?

### 1. **Deterministic Dependencies** 🔒

- `yarn.lock` provides more reliable dependency resolution
- Consistent installations across all environments
- Better handling of nested dependencies

### 2. **Performance** ⚡

- Parallel downloads and installations
- Better caching mechanisms
- Faster dependency resolution

### 3. **Security** 🛡️

- Built-in license checking
- Integrity verification for packages
- Better audit reporting

### 4. **Workspace Support** 🏗️

- Superior monorepo capabilities
- Better cross-package dependency management
- Efficient hoisting strategies

### 5. **Developer Experience** 👨‍💻

- Better error messages
- Interactive upgrade prompts
- Improved CLI output formatting

## Project Setup Requirements

### Prerequisites

```bash
# Install Yarn globally (if not already installed)
npm install -g yarn

# Verify installation
yarn --version
```

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd <project-directory>

# Install dependencies with Yarn
yarn install

# Start development
yarn dev
```

## Lock File Management

### Important Rules:

1. **Always commit `yarn.lock`** - Never add it to `.gitignore`
2. **Never commit `package-lock.json`** - Add it to `.gitignore` if present
3. **Update lock file when adding/removing packages**
4. **Resolve lock file conflicts carefully during merges**

### Handling Lock File Conflicts:

```bash
# When merge conflicts occur in yarn.lock
git checkout --theirs yarn.lock  # or --ours
yarn install                     # regenerate lock file
git add yarn.lock
git commit
```

## CI/CD Configuration

### GitHub Actions Example:

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "yarn" # Use yarn cache

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run tests
        run: yarn test

      - name: Build
        run: yarn build
```

## Common Workflows

### Adding New Dependencies

```bash
# Production dependency
yarn add lodash

# Development dependency
yarn add -D @types/node

# Specific version
yarn add react@^18.0.0

# Multiple packages
yarn add axios react-query zustand
```

### Updating Dependencies

```bash
# Update all packages (respecting semver)
yarn upgrade

# Update specific package
yarn upgrade lodash

# Interactive update (choose versions)
yarn upgrade-interactive

# Check for outdated packages
yarn outdated
```

### Script Management

```bash
# List available scripts
yarn run

# Run custom scripts
yarn dev
yarn build
yarn test:watch
yarn lint:fix
```

## Troubleshooting

### Cache Issues

```bash
# Clear yarn cache
yarn cache clean

# Remove node_modules and reinstall
rm -rf node_modules
yarn install
```

### Permission Issues

```bash
# Fix global package permissions
yarn config set prefix ~/.yarn-global
export PATH="$PATH:$(yarn global bin)"
```

### Network Issues

```bash
# Change registry if needed
yarn config set registry https://registry.npmjs.org/

# Use different network timeout
yarn install --network-timeout 100000
```

---

# 🏗️ Trash Collection Management System

## Repository Overview

This is a **Next.js 14** full-stack application for managing waste collection services in Vietnam. The system serves three main user roles:

- **👤 Users (Households)** - Register, subscribe to packages, schedule pickups, track collection status
- **🚛 Collectors** - View assigned routes, check-in at locations, handle urgent requests  
- **🛠️ Admins** - Manage users, collectors, routes, payments, and system analytics

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with PostGIS extension
- **Maps**: Google Maps JavaScript API
- **Authentication**: Custom JWT-based auth
- **UI Components**: Radix UI, shadcn/ui
- **Package Manager**: Yarn (mandatory)

### Repository Size
- ~50 API endpoints
- ~100+ React components  
- ~20 database models
- ~500+ TypeScript files

---

## 🚀 Build & Development Commands

### Prerequisites
```bash
# Ensure yarn is installed globally
npm install -g yarn
yarn --version  # Should be >= 1.22.0

# Node.js version
node --version  # Should be >= 18.17.0
```

### Essential Commands

#### **Development Workflow**
```bash
# ALWAYS start with fresh dependencies
yarn install

# Generate Prisma client (REQUIRED after schema changes)
yarn db:generate

# Start development server with network access
yarn dev
# This runs: node scripts/network-info.ts && next dev --hostname 0.0.0.0 --port 3000

# Alternative: Local-only development
yarn dev:local
```

#### **Database Operations**
```bash
# Generate Prisma client (run after any schema.prisma changes)
yarn db:generate

# Apply migrations to database
yarn db:migrate

# Push schema changes directly (development only)
yarn db:push

# Open Prisma Studio database browser
yarn db:studio

# Seed database with sample data
yarn db:seed
```

#### **Build & Validation**
```bash
# Production build (currently fails with module errors - see Known Issues)
yarn build

# Type checking
yarn lint

# Database connection test
yarn db:generate
```

### ⚠️ Known Issues & Workarounds

#### Build Failures
The build currently fails with TypeScript module errors:
```
Type error: File '/src/app/api/debug/fix-subscriptions/route.ts' is not a module.
```

**Workaround**: Before building, ensure all API route files have proper export structure:
```typescript
export async function GET() { /* ... */ }
export async function POST() { /* ... */ }
```

#### Linting Errors
Common ESLint issues to fix before deployment:
- React unescaped entities (use `&quot;` instead of `"`)
- Missing dependencies in useEffect hooks
- Use Next.js `<Image>` instead of `<img>` tags

#### Development Server
The dev command includes a network info script that may cause issues on some systems. Use `yarn dev:local` if experiencing problems.

---

## 📁 Project Architecture

### Directory Structure
```
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Auth route groups
│   │   ├── api/               # API endpoints
│   │   │   ├── admin/         # Admin-only endpoints
│   │   │   ├── auth/          # Authentication
│   │   │   ├── user/          # User management
│   │   │   └── payments/      # Payment processing
│   │   ├── dashboard/         # Role-based dashboards
│   │   │   ├── admin/         # Admin interface
│   │   │   ├── collector/     # Collector mobile interface
│   │   │   └── user/          # User dashboard
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── auth/             # Authentication components
│   │   ├── admin/            # Admin-specific components
│   │   ├── dashboard/        # Dashboard components
│   │   └── providers/        # Context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # Authentication logic
│   │   ├── db.ts             # Database connection
│   │   ├── google-maps.ts    # Google Maps integration
│   │   └── utils.ts          # General utilities
│   └── types/                # TypeScript type definitions
│       ├── database.ts       # Database types
│       ├── collection.ts     # Collection-related types
│       └── route.ts          # Routing system types
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts              # Database seeding
├── public/
│   ├── images/              # Static images
│   └── locales/             # i18n translations
├── docs/                    # Project documentation
└── scripts/                 # Utility scripts
```

### Configuration Files
- **next.config.js** - Next.js configuration
- **tailwind.config.ts** - Tailwind CSS config
- **tsconfig.json** - TypeScript configuration
- **components.json** - shadcn/ui configuration
- **.eslintrc.json** - ESLint rules
- **prisma/schema.prisma** - Database schema

### Key Components

#### Authentication System
- Location: `src/components/auth/`
- Files: `auth-guard.tsx`, `auth-initializer.tsx`, `redirect-if-authenticated.tsx`
- JWT-based authentication with role-based access control

#### Google Maps Integration  
- Location: `src/lib/google-maps.ts`
- Features: Route optimization, geocoding, polyline encoding
- Required ENV: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

#### Database Layer
- ORM: Prisma with PostgreSQL + PostGIS
- Models: User, Package, Payment, CollectionRoute, UrgentRequest
- Location: `prisma/schema.prisma`

#### Routing System (Recently Added)
- Location: `src/components/admin/schedules/`
- Features: Interactive route creation, urgent request handling
- Components: `RouteCreator.tsx`, `EnhancedScheduleMapView.tsx`, `EnhancedScheduleSidebar.tsx`

### Environment Variables
Required variables in `.env.local`:
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."
VNPAY_TMN_CODE="..."
VNPAY_HASH_SECRET="..."
```

### API Routes Structure
- `/api/auth/*` - Authentication endpoints
- `/api/admin/*` - Admin-only operations
- `/api/user/*` - User operations
- `/api/payments/*` - Payment processing
- `/api/debug/*` - Development utilities

---

## 🔍 Development Guidelines

### Before Making Changes
1. **Always run** `yarn install` after pulling changes
2. **Generate Prisma client** after any schema changes: `yarn db:generate`
3. **Check linting** before committing: `yarn lint`
4. **Test database connection** if modifying database code

### Code Quality
- Use TypeScript strictly - no `any` types
- Follow Next.js 14 App Router patterns
- Use shadcn/ui components for consistency
- Implement proper error handling in API routes
- Use Prisma for all database operations

### Testing Changes
1. Test on multiple screen sizes (mobile-first design)
2. Verify database operations with `yarn db:studio`
3. Check network accessibility with development server
4. Validate API endpoints with proper HTTP methods

### Common Patterns
- API routes use `NextRequest`/`NextResponse`
- Components use TypeScript interfaces for props
- Database queries use Prisma client
- Maps integration uses Google Maps React components
- Authentication uses custom JWT middleware

---

## 🎯 Quick Reference

### File Locations
- **Main layout**: `src/app/layout.tsx`
- **Auth logic**: `src/lib/auth.ts`
- **Database**: `src/lib/db.ts` 
- **API utilities**: `src/lib/api.ts`
- **Type definitions**: `src/types/`

### Common Tasks
- **Add new API endpoint**: Create in `src/app/api/[path]/route.ts`
- **Add database model**: Update `prisma/schema.prisma` + run `yarn db:generate` + `yarn db:migrate`
- **Add new component**: Place in appropriate `src/components/` subdirectory
- **Add new page**: Create in `src/app/` following App Router conventions

### Emergency Fixes
- **Build failing**: Check for missing exports in API routes
- **Database issues**: Run `yarn db:generate` then `yarn db:push`
- **Type errors**: Update type definitions in `src/types/`
- **Dependency issues**: Clear cache with `yarn cache clean` then `yarn install`

---

**⚡ Trust these instructions and only search for additional information if something is unclear or doesn't work as documented.**
