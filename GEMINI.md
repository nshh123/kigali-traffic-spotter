# Kigali Traffic Spotter Workspace Guidelines

## Git & CI/CD Deployment Workflow
- **Always Push to GitHub for CI**:
  - Whenever a task, bug fix, or feature enhancement is implemented and verified (e.g., `npm run build` succeeds), immediately stage all relevant changes.
  - Commit using conventional commit messages (e.g., `feat:`, `fix:`, `perf:`, `chore:`).
  - Push directly to `origin main` (`git push origin main`) so that Vercel CI/CD and deployment pipelines trigger automatically without manual user action.
  - **Safety Invariants**:
    - Never commit `.env` or sensitive credentials (maintain `.gitignore`).
    - Never push code that breaks `npm run build` or fails TypeScript compilation.
