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
