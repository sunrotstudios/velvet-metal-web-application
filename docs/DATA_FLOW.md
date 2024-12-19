# Data Flow Documentation

## React Query Usage

### Current Implementation

React Query is currently used in the following locations:

1. **Home Page**
   - `useQuery` for fetching connected services

2. **Library Page**
   - Multiple queries for user services and library data
   - Uses `useQueryClient` for cache management

3. **Playlist & Album Details**
   - Individual queries for detailed information
   - Opportunity for prefetching

4. **LastFm Integration**
   - Stats fetching in LastFmContext
   - Top artists data in LastFmStats component

5. **Transfer History**
   - Query for transfer history data

### Recommended Improvements

1. **Implement Prefetching**
   - Add prefetching for playlist/album details on hover
   - Implement infinite loading for large lists

2. **Cache Optimization**
   - Add cache time configurations
   - Implement stale-while-revalidate strategy

3. **Add React Query for**:
   - Bulk transfer operations
   - Search functionality
   - User preferences
   - Service synchronization

## Data Flow Architecture

### Service Layer
```
User Interaction → React Component → React Query Hook → API Call → Backend
```

### State Management
1. **Global State** (Context)
   - User authentication
   - Connected services
   - Last.fm integration

2. **Local State**
   - UI state
   - Form state
   - Modal state

3. **Server State** (React Query)
   - Playlists
   - Albums
   - Transfer history
   - User services

### Key Data Flows

1. **Music Library**
   ```
   Library Page → useQuery(services) → Display Services
                → useQuery(library) → Display Library Items
   ```

2. **Transfer Process**
   ```
   Select Items → Initiate Transfer → Update Cache → Refresh Transfer History
   ```

3. **Service Integration**
   ```
   Connect Service → Update Services Cache → Refresh Connected Services
   ```
