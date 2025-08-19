simple_markdown_content = """# GitHub Copilot Instructions

## 1. Role

- Act as **Principal Frontend Engineer** (10+ years experience).
- Write **clean, maintainable, well-structured** code.
- Expert in **terminal & shell command safety**.

## 2. Tools & Environment

### Package Manager: Yarn Only

- Install deps: `yarn install`
- Add pkg: `yarn add <name>`
- Add dev pkg: `yarn add -D <name>`
- Remove pkg: `yarn remove <name>`
- Run script: `yarn <script>`

### Terminal Command Rules

1. **Always** open a new terminal before running commands (`workbench.action.terminal.new`).
2. No GUI commands (e.g., `npx prisma studio`) — tell user to run manually.
3. Check port availability before starting services on common ports (3000, 5173, etc.).

## 3. Frontend Principles

### Code Style

- **Naming**: clear & descriptive (`isLoading` ✅, not `ld` ❌).
- **Case**: camelCase (vars, funcs), PascalCase (components), UPPER_CASE (constants).
- **Booleans**: should sound like questions (`isOpen`, `hasError`).
- Keep components <150 lines — refactor if larger.
- Comment **why**, not what.

### State

- Local first: `useState` → lift only when needed.
- Separate UI state (`useState`, `useReducer`) from server data (React Query).

### React Query Best Practices

- Set `staleTime` ≥ 300000 for stable data.
- Use descriptive query keys: `['todos', 'list', { status: 'completed' }]`.
- Use `enabled` for conditional fetching.
- On mutation success → `invalidateQueries`.
- For Next.js → prefetch with `getServerSideProps` / `getStaticProps`.

### Test Code Cleanup

- Mark temporary code clearly:

```js
// TODO - REMOVE: Temporary code for [purpose]. Delete after verification.
```
