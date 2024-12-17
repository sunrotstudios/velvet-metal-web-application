# Velvet Metal Web Application Architecture

## Project Overview
Velvet Metal is a web application for managing and syncing music libraries across different streaming services (Spotify and Apple Music). The application is built using React, TypeScript, and various modern web technologies.

## Directory Structure

### `/src` - Main Application Source
- `App.tsx` - Main application component and routing setup
- `main.tsx` - Application entry point
- `index.css` - Global styles

### Core Components

#### Authentication (`/src/contexts`)
- `auth-context.tsx` - Manages user authentication state and methods

#### Pages (`/src/pages`)
- `Login.tsx` - User login page
- `Register.tsx` - User registration page
- `Library/` - Music library management
  - `components/`
    - `Controls.tsx` - Library control interface
    - `AlbumsTab.tsx` - Album view component
    - `PlaylistsTab.tsx` - Playlist view component
    - `LibraryTabs.tsx` - Navigation tabs
- `Settings.tsx` - Application settings
- `CustomPlaylists.tsx` - Custom playlist management
- `AlbumDetails.tsx` - Detailed album view
- `PlaylistDetails.tsx` - Detailed playlist view
- `SpotifyCallback.tsx` - Spotify OAuth callback handler

#### Library Components (`/src/components/Library`)
- `AlbumCard.tsx` - Album display card
- `PlaylistCard.tsx` - Playlist display card
- `ServiceToggle.tsx` - Service selection toggle
- `VirtualizedAlbumGrid.tsx` - Optimized album grid view
- `VirtualizedPlaylistGrid.tsx` - Optimized playlist grid view
- `CustomPlaylistCard.tsx` - Custom playlist display
- `CustomPlaylistDialog.tsx` - Custom playlist creation/editing
- `CustomPlaylistView.tsx` - Custom playlist detailed view
- `AddToCustomPlaylistMenu.tsx` - Playlist management menu
- `RecentTransfers.tsx` - Recent music transfers display

#### UI Components (`/src/components/ui`)
Reusable UI components built with Radix UI:
- Button, Card, Input, Select
- Dialog, Dropdown, Tooltip
- Progress, Loading indicators
- Forms and validation
- Tables and data display
- Charts and data visualization

### Services (`/src/lib/services`)
- `apple-music-library.ts` - Apple Music integration
- `spotify-library.ts` - Spotify integration
- `normalizers.ts` - Data normalization utilities
- `storage.ts` - Local storage management
- `sync.ts` - Cross-service synchronization
- `streaming-auth.ts` - Streaming service authentication

### API Integration (`/src/lib/api`)
- `apple-music.ts` - Apple Music API client
- `spotify.ts` - Spotify API client
- `plex.ts` - Plex API integration

### Types and Utilities (`/src/lib`)
- `types.ts` - TypeScript type definitions
- `utils.ts` - Common utility functions
- `supabase.ts` - Supabase client configuration

## Key Features
1. Multi-service Music Library Management
2. Cross-platform Synchronization
3. Custom Playlist Creation
4. Album and Playlist Details
5. Recent Transfer History
6. Service Authentication Management

## Technology Stack
- React + TypeScript
- Tailwind CSS for styling
- Radix UI for component primitives
- React Query for data fetching
- Supabase for backend services
- Vite for build tooling

## Authentication Flow
1. User registration/login through Supabase
2. OAuth integration with music streaming services
3. Secure token storage and management

## Data Flow
1. User authenticates with streaming services
2. Library data is fetched and normalized
3. Synchronized data is stored in local storage
4. UI components render normalized data
5. Changes are synced back to respective services
