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

## Package.json Scripts Configuration

Ensure your `package.json` scripts are optimized for Yarn:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "type-check": "tsc --noEmit",
    "postinstall": "husky install"
  },
  "packageManager": "yarn@3.6.0"
}
```

## Team Guidelines

### For New Team Members:

1. Install Yarn globally before starting
2. Always use `yarn install` after pulling changes
3. Never mix npm and yarn in the same project
4. Report any package-related issues immediately

### For Code Reviews:

1. Verify `yarn.lock` changes are intentional
2. Check that new dependencies are necessary
3. Ensure dev dependencies are properly categorized
4. Review package versions for security

### For Deployment:

1. Use `yarn install --frozen-lockfile` in production
2. Ensure Yarn version consistency across environments
3. Cache `node_modules` efficiently
4. Monitor bundle size after dependency changes

## Security Best Practices

```bash
# Regular security audits
yarn audit

# Fix security issues
yarn audit --fix

# Check for vulnerabilities in specific packages
yarn why <package-name>

# License checking
yarn licenses list
```

## IDE Configuration

### VS Code Settings (`.vscode/settings.json`):

```json
{
  "npm.packageManager": "yarn",
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "eslint.packageManager": "yarn"
}
```

## Enforcement

### Pre-commit Hooks

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check if package-lock.json exists
if [ -f package-lock.json ]; then
  echo "❌ package-lock.json found! This project uses Yarn only."
  echo "Please delete package-lock.json and use 'yarn install' instead."
  exit 1
fi

# Check if using npm in scripts
if grep -r "npm " scripts/ 2>/dev/null; then
  echo "❌ npm commands found in scripts! Use yarn instead."
  exit 1
fi
```

### Package.json Validation

Add to `package.json`:

```json
{
  "engines": {
    "yarn": ">=1.22.0",
    "npm": "Please use Yarn instead of npm"
  }
}
```

---

## Summary

**Remember**: This project is Yarn-only. Always use Yarn commands and never mix package managers. This ensures consistency, reliability, and optimal performance across all development and deployment environments.

For questions or issues, please contact the development team or refer to the [official Yarn documentation](https://yarnpkg.com/).

**Last Updated**: August 11, 2025
**Maintainer**: Development Team
