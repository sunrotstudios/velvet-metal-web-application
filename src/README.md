# Project Structure

This document outlines the organization of the codebase.

## Directory Structure

```
src/
├── pages/              # Page components and their related features
│   ├── Landing/       # Landing page and related components
│   │   ├── Landing.tsx
│   │   └── components/
│   ├── Library/       # Library page and related components
│   │   ├── Library.tsx
│   │   └── components/
│   ├── Stats/         # Stats page and related components
│   │   ├── LastFmDashboard.tsx
│   │   └── components/
│   └── Settings/      # Settings page and related components
│       ├── Settings.tsx
│       └── components/
├── shared/            # Shared components and utilities
│   ├── ui/           # Reusable UI components
│   └── layouts/      # Shared layout components
├── contexts/         # React contexts for state management
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and services
└── types/           # TypeScript type definitions
```

## Organization Philosophy

1. **Page-Centric Organization**: Each major feature/page has its own directory under `pages/` containing:
   - Main page component (e.g., `Landing.tsx`)
   - `components/` directory for components specific to that page
   - Other related files (styles, utils, types)

2. **Shared Resources**: Common components and utilities that are used across multiple pages are placed in the `shared/` directory

3. **Clear Boundaries**: Each page directory is self-contained with its own components, making it easy to:
   - Understand feature scope
   - Modify features independently
   - Find related code quickly

## Best Practices

1. Keep page-specific components within their respective page directories
2. Use shared components for truly reusable functionality
3. Keep pages focused on their core functionality
4. Maintain consistent naming conventions within each directory
