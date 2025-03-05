export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      album_tracks: {
        Row: {
          album_id: string
          artist_name: string | null
          created_at: string
          duration_ms: number | null
          external_url: string | null
          id: string
          is_playable: boolean | null
          name: string
          preview_url: string | null
          service: string
          track_number: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          album_id: string
          artist_name?: string | null
          created_at?: string
          duration_ms?: number | null
          external_url?: string | null
          id?: string
          is_playable?: boolean | null
          name: string
          preview_url?: string | null
          service: string
          track_number?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          album_id?: string
          artist_name?: string | null
          created_at?: string
          duration_ms?: number | null
          external_url?: string | null
          id?: string
          is_playable?: boolean | null
          name?: string
          preview_url?: string | null
          service?: string
          track_number?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      library_syncs: {
        Row: {
          created_at: string
          error_count: number | null
          id: string
          last_error: string | null
          last_sync_time: string | null
          metadata: Json
          next_sync_time: string | null
          service: string
          stats: Json | null
          sync_status: Database["public"]["Enums"]["sync_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_count?: number | null
          id?: string
          last_error?: string | null
          last_sync_time?: string | null
          metadata?: Json
          next_sync_time?: string | null
          service: string
          stats?: Json | null
          sync_status?: Database["public"]["Enums"]["sync_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_count?: number | null
          id?: string
          last_error?: string | null
          last_sync_time?: string | null
          metadata?: Json
          next_sync_time?: string | null
          service?: string
          stats?: Json | null
          sync_status?: Database["public"]["Enums"]["sync_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      playlist_sync_pairs: {
        Row: {
          created_at: string | null
          error_count: number | null
          id: string
          is_active: boolean | null
          last_error: string | null
          last_error_at: string | null
          synced_at: string | null
          source_playlist_id: string
          source_service: string
          sync_enabled: boolean | null
          target_playlist_id: string
          target_service: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_error_at?: string | null
          synced_at?: string | null
          source_playlist_id: string
          source_service: string
          sync_enabled?: boolean | null
          target_playlist_id: string
          target_service: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_error_at?: string | null
          synced_at?: string | null
          source_playlist_id?: string
          source_service?: string
          sync_enabled?: boolean | null
          target_playlist_id?: string
          target_service?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_sync_pairs_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_syncs: {
        Row: {
          created_at: string
          id: string
          last_error: Json | null
          last_synced: string | null
          next_sync: string
          source_playlist: Json
          sync_enabled: boolean | null
          sync_frequency: Database["public"]["Enums"]["sync_frequency"]
          sync_interval: number | null
          target_playlist: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: Json | null
          last_synced?: string | null
          next_sync: string
          source_playlist: Json
          sync_enabled?: boolean | null
          sync_frequency: Database["public"]["Enums"]["sync_frequency"]
          sync_interval?: number | null
          target_playlist: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: Json | null
          last_synced?: string | null
          next_sync?: string
          source_playlist?: Json
          sync_enabled?: boolean | null
          sync_frequency?: Database["public"]["Enums"]["sync_frequency"]
          sync_interval?: number | null
          target_playlist?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          subscription_expires_at: string | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          subscription_expires_at?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          subscription_expires_at?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          created_at: string
          features: Json
          id: string
          name: string
          price: number
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          features: Json
          id?: string
          name: string
          price: number
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          name?: string
          price?: number
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      transfers: {
        Row: {
          completed_at: string | null
          created_at: string
          destination_service: string
          error: string | null
          id: string
          metadata: Json | null
          source_service: string
          started_at: string | null
          status: string
          tracksCount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          destination_service: string
          error?: string | null
          id?: string
          metadata?: Json | null
          source_service: string
          started_at?: string | null
          status: string
          tracksCount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          destination_service?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          source_service?: string
          started_at?: string | null
          status?: string
          tracksCount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_albums: {
        Row: {
          added_at: string | null
          album_id: string
          album_type: string | null
          artist_name: string
          created_at: string | null
          external_url: string | null
          id: string
          image_url: string | null
          name: string
          release_date: string | null
          service: Database["public"]["Enums"]["service_type"]
          synced_at: string | null
          tracks: number | null
          upc: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          album_id: string
          album_type?: string | null
          artist_name: string
          created_at?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          name: string
          release_date?: string | null
          service: Database["public"]["Enums"]["service_type"]
          synced_at?: string | null
          tracks?: number | null
          upc?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          album_id?: string
          album_type?: string | null
          artist_name?: string
          created_at?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          name?: string
          release_date?: string | null
          service?: Database["public"]["Enums"]["service_type"]
          synced_at?: string | null
          tracks?: number | null
          upc?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_playlists: {
        Row: {
          added_at: string | null
          collaborative: boolean | null
          created_at: string | null
          description: string | null
          external_url: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          name: string
          owner_id: string | null
          owner_name: string | null
          playlist_id: string
          public: boolean | null
          service: Database["public"]["Enums"]["service_type"]
          synced_at: string | null
          tracks: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          collaborative?: boolean | null
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          name: string
          owner_id?: string | null
          owner_name?: string | null
          playlist_id: string
          public?: boolean | null
          service: Database["public"]["Enums"]["service_type"]
          synced_at?: string | null
          tracks?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          collaborative?: boolean | null
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          name?: string
          owner_id?: string | null
          owner_name?: string | null
          playlist_id?: string
          public?: boolean | null
          service?: Database["public"]["Enums"]["service_type"]
          synced_at?: string | null
          tracks?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_services: {
        Row: {
          access_token: string
          created_at: string | null
          id: string
          synced_at: string | null
          music_user_token: string | null
          refresh_token: string | null
          service: Database["public"]["Enums"]["service_type"]
          expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          id?: string
          synced_at?: string | null
          music_user_token?: string | null
          refresh_token?: string | null
          service: Database["public"]["Enums"]["service_type"]
          expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          id?: string
          synced_at?: string | null
          music_user_token?: string | null
          refresh_token?: string | null
          service?: Database["public"]["Enums"]["service_type"]
          expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_stale_syncs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      count_unique_albums: {
        Args: {
          user_id_param: string
        }
        Returns: number
      }
      count_unique_playlists: {
        Args: {
          user_id_param: string
        }
        Returns: number
      }
    }
    Enums: {
      library_item_type: "track" | "album" | "playlist"
      service_type: "spotify" | "apple-music"
      subscription_tier: "free" | "pro" | "enterprise"
      sync_frequency: "hourly" | "daily" | "weekly"
      sync_status: "idle" | "syncing" | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

