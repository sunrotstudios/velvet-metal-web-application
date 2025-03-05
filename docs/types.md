# Velvet Metal Type System Documentation

This document provides a comprehensive overview of all types and data structures used in the Velvet Metal web application.

## Table of Contents

- [Core Service Types](#core-service-types)
- [User Data Models](#user-data-models)
  - [User Collections](#user-collections)
  - [User Item Models](#user-item-models)
- [Normalized Models](#normalized-models)
  - [Album Models](#album-models)
  - [Playlist Model](#playlist-model)
- [Music Content Models](#music-content-models)
  - [Track Models](#track-models)
  - [Service-Specific Models](#service-specific-models)
- [Utility Types](#utility-types)
- [Best Practices & Recommendations](#best-practices--recommendations)

## Core Service Types

```typescript
type ServiceType = "spotify" | "apple-music";
type ViewMode = "grid" | "list";
```

## User Data Models

### User Collections

```typescript
interface UserAlbums {
  user: string; // Relation to users collection
  service: ServiceType;
  albums: Album[]; // Store the full album data
  lastSynced: Date;
}

interface UserPlaylists {
  user: string; // Relation to users collection
  service: ServiceType;
  playlists: NormalizedPlaylist[]; // Store the full playlist data
  lastSynced: Date;
}
```

### User Item Models

```typescript
interface UserPlaylist {
  id: string;
  user_id: string;
  service: ServiceType;
  playlist_id: string; // Platform-specific ID
  name: string;
  description?: string;
  image_url?: string;
  tracks?: number;
  owner_id?: string;
  owner_name?: string;
  is_public: boolean;
  external_url?: string;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

interface UserAlbum {
  id: string;
  user_id: string;
  service: ServiceType;
  album_id: string;
  name: string;
  artist_name: string;
  release_date?: string;
  image_url?: string;
  tracks?: number;
  external_url?: string;
  synced_at: string;
  created_at: string;
  updated_at: string;
}
```

## Normalized Models

### Album Models

```typescript
interface NormalizedAlbum {
  id: string;
  name: string;
  artistName: string;
  artwork: {
    url: string;
    width?: number;
    height?: number;
  };
  releaseDate: string;
  trackCount: number;
  dateAdded?: string;
  sourceService: "spotify" | "apple-music";
  sourceId: string;
  albumType: "album" | "single" | "ep";
}

interface DetailedAlbum extends NormalizedAlbum {
  tracks: AlbumTrack[];
  totalTracks: number;
  genres: string[];
  popularity?: number;
  copyrights?: string[];
  label?: string;
}
```

### Playlist Model

```typescript
interface NormalizedPlaylist {
  id: string;
  user_id: string;
  playlist_id: string; // Platform-specific ID
  name: string;
  description?: string;
  artwork?: {
    url: string;
    height?: number | null;
    width?: number | null;
  };
  tracks: number;
  owner?: {
    id: string;
    display_name?: string;
  };
  service: "spotify" | "apple-music";
  is_public: boolean;
  external_url?: string;
  synced_at: string;
  created_at: string;
  updated_at: string;
}
```

## Music Content Models

### Track Models

```typescript
interface AlbumTrack {
  id: string;
  name: string;
  trackNumber: number;
  durationMs: number;
  artistName: string;
  previewUrl?: string;
}

interface Track {
  name: string;
  artist: string;
  album: string;
  isrc?: string;
}
```

### Service-Specific Models

```typescript
interface Album {
  id: string;
  album?: {
    name: string;
    images?: { url: string }[];
    artists?: { name: string }[];
    release_date?: string;
    total_tracks?: number;
  };
  attributes?: {
    name: string;
    artwork?: { url: string };
    artistName?: string;
    releaseDate?: string;
    trackCount?: number;
  };
}

interface Playlist {
  id: string;
  name?: string;
  images?: { url: string }[];
  attributes?: {
    name: string;
    artwork?: { url: string };
    trackCount?: number;
  };
  tracks?: {
    total?: number;
  };
}
```

## Utility Types

```typescript
interface SearchResult {
  id: string;
  uri?: string;
  name: string;
  artist: string;
  isrc?: string;
}

interface SyncProgress {
  phase: "albums" | "playlists" | "complete";
  current: number;
  total: number;
  service: ServiceType;
}

interface PlaylistMetadata {
  name: string;
  description: string;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
}
```

## Best Practices & Recommendations

### Timestamp Handling

- All database models use consistent timestamp fields:
  - `created_at`
  - `updated_at`
  - `synced_at`
- All timestamps are stored as strings (ISO format recommended)

### Service Integration

- Models support both Spotify and Apple Music through unified interfaces
- Service-specific IDs are clearly marked
- Common fields are normalized across services

### Data Consistency

1. **Artwork/Images**

   - Consistent structure across models
   - Optional dimensions for flexibility
   - URLs always required when artwork is present

2. **Optional Fields**

   - Marked with `?` for cross-service compatibility
   - Default values should be handled in business logic

3. **IDs and References**
   - Clear distinction between internal IDs and service-specific IDs
   - Consistent naming conventions (`id` for internal, `*_id` for external)

### Future Improvements

1. **Type Safety**

   - Consider using enums for `ServiceType` and `ViewMode`
   - Add explicit typing for API status codes
   - Create shared interfaces for common structures (e.g., artwork)

2. **Data Evolution**

   - Add version fields for schema migrations
   - Consider adding metadata fields for tracking changes
   - Implement strict validation for timestamp formats

3. **Documentation**

   - Add JSDoc comments for complex types
   - Document validation requirements
   - Include examples of valid data structures

4. **Error Handling**
   - Expand `ApiError` type with specific error codes
   - Add validation error types
   - Include service-specific error mappings

---

Last Updated: 2024-12-19
