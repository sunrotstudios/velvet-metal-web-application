# Velvet Metal Development Guidelines

## Commands
- Build: `npm run build` (tsc + vite build)
- Dev: `npm run dev` (vite dev server)
- Lint: `npm run lint` (eslint)
- Preview: `npm run preview` (vite preview)

## Tech Stack
- React 18 (function components, hooks)
- TypeScript
- Vite
- Tailwind CSS
- ShadCN UI + Radix primitives
- Supabase (auth/DB)
- TanStack Query
- Zustand (state)
- React Router

## Code Style
- Use named exports over default exports
- Import aliasing: `@/` for src directory
- State: useSWR/TanStack for remote, Zustand for global, useState for local
- Components: feature-based organization with consistent component structure
- Types: strong typing with interfaces/types in dedicated files (no `any`)
- Hooks: prefix with `use`, follow React rules
- Error handling: try/catch with explicit error states, ApiError for custom errors
- Formatting: 2-space indentation, 80-column width preferred
- API requests: service-based abstraction with retry mechanisms