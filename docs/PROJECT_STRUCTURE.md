# Project Structure Documentation

## Directory Overview

```
src/
├── components/      # Reusable UI components
├── contexts/        # React context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and shared logic
├── pages/          # Main route components
└── types/          # TypeScript type definitions
```

## Key Directories

### Components
Contains reusable UI components. Currently has 78 components which might indicate a need for better organization. Consider grouping these into subdirectories like:
- `common/` - Basic reusable components (buttons, inputs, etc.)
- `layout/` - Layout components (header, footer, etc.)
- `features/` - Feature-specific components
- `modals/` - Modal components

### Contexts
Contains React context providers:
- Currently has 2 context providers
- Used for global state management
- Includes LastFmContext for Last.fm integration

### Hooks
Custom React hooks directory with 5 hooks:
- Includes `useConnectedServices` for service integration
- Consider moving service-specific hooks to a `services/` subdirectory

### Lib
Utility functions and shared logic with 26 items:
- Consider organizing into subdirectories based on functionality
- Example: `api/`, `utils/`, `constants/`

### Pages
Main route components with 15 pages:
- Each page represents a main route in the application
- Includes Home, Library, PlaylistDetails, etc.

## Suggested Improvements

1. **Component Organization**
   - Create subdirectories in `components/` based on feature areas
   - Move modal components to `components/modals/`
   - Group related components together

2. **API Layer Organization**
   - Create an `api/` directory in `lib/` for API-related code
   - Centralize API calls and data fetching logic

3. **Type Organization**
   - Expand `types/` directory
   - Create separate type files for different domains
   - Consider using barrel exports

4. **Testing Structure**
   - Add `__tests__` directories alongside components
   - Create a `test-utils/` directory for test helpers
