export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          created_at: string
          emoji: string | null
          id: string
          league_id: string
          message: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          id?: string
          league_id: string
          message: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string | null
          id?: string
          league_id?: string
          message?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          league_id: string | null
          name: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          league_id?: string | null
          name?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          league_id?: string | null
          name?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      holdings: {
        Row: {
          allocation: number
          avg_cost: number
          current_price: number
          id: string
          is_active: boolean
          league_id: string
          name: string
          sector: string
          shares: number
          symbol: string
          updated_at: string
          user_id: string
          weeks_held: number
        }
        Insert: {
          allocation?: number
          avg_cost?: number
          current_price?: number
          id?: string
          is_active?: boolean
          league_id: string
          name: string
          sector: string
          shares?: number
          symbol: string
          updated_at?: string
          user_id: string
          weeks_held?: number
        }
        Update: {
          allocation?: number
          avg_cost?: number
          current_price?: number
          id?: string
          is_active?: boolean
          league_id?: string
          name?: string
          sector?: string
          shares?: number
          symbol?: string
          updated_at?: string
          user_id?: string
          weeks_held?: number
        }
        Relationships: [
          {
            foreignKeyName: "holdings_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      league_members: {
        Row: {
          id: string
          joined_at: string
          league_id: string
          losses: number
          streak: string | null
          user_id: string
          wins: number
        }
        Insert: {
          id?: string
          joined_at?: string
          league_id: string
          losses?: number
          streak?: string | null
          user_id: string
          wins?: number
        }
        Update: {
          id?: string
          joined_at?: string
          league_id?: string
          losses?: number
          streak?: string | null
          user_id?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          allow_crypto: boolean
          allow_international: boolean
          commissioner_id: string
          created_at: string
          current_week: number
          diversity_strictness: string
          id: string
          invite_code: string | null
          is_public: boolean
          max_members: number
          max_single_sector_pct: number
          min_sectors_required: number
          name: string
          playoff_start_week: number
          playoff_teams: number
          season_length: number
          weekly_deposit: number
        }
        Insert: {
          allow_crypto?: boolean
          allow_international?: boolean
          commissioner_id: string
          created_at?: string
          current_week?: number
          diversity_strictness?: string
          id?: string
          invite_code?: string | null
          is_public?: boolean
          max_members?: number
          max_single_sector_pct?: number
          min_sectors_required?: number
          name: string
          playoff_start_week?: number
          playoff_teams?: number
          season_length?: number
          weekly_deposit?: number
        }
        Update: {
          allow_crypto?: boolean
          allow_international?: boolean
          commissioner_id?: string
          created_at?: string
          current_week?: number
          diversity_strictness?: string
          id?: string
          invite_code?: string | null
          is_public?: boolean
          max_members?: number
          max_single_sector_pct?: number
          min_sectors_required?: number
          name?: string
          playoff_start_week?: number
          playoff_teams?: number
          season_length?: number
          weekly_deposit?: number
        }
        Relationships: []
      }
      matchups: {
        Row: {
          away_adjusted_pct: number | null
          away_growth_pct: number | null
          away_user_id: string
          created_at: string
          home_adjusted_pct: number | null
          home_growth_pct: number | null
          home_user_id: string
          id: string
          is_final: boolean
          league_id: string
          week: number
          winner_user_id: string | null
        }
        Insert: {
          away_adjusted_pct?: number | null
          away_growth_pct?: number | null
          away_user_id: string
          created_at?: string
          home_adjusted_pct?: number | null
          home_growth_pct?: number | null
          home_user_id: string
          id?: string
          is_final?: boolean
          league_id: string
          week: number
          winner_user_id?: string | null
        }
        Update: {
          away_adjusted_pct?: number | null
          away_growth_pct?: number | null
          away_user_id?: string
          created_at?: string
          home_adjusted_pct?: number | null
          home_growth_pct?: number | null
          home_user_id?: string
          id?: string
          is_final?: boolean
          league_id?: string
          week?: number
          winner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matchups_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          level: number
          team_name: string
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          level?: number
          team_name?: string
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          level?: number
          team_name?: string
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      snaptrade_secrets: {
        Row: {
          created_at: string
          id: string
          user_id: string
          user_secret: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          user_secret: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          user_secret?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          level: number | null
          team_name: string | null
          updated_at: string | null
          user_id: string | null
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          level?: number | null
          team_name?: string | null
          updated_at?: string | null
          user_id?: string | null
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          level?: number | null
          team_name?: string | null
          updated_at?: string | null
          user_id?: string | null
          xp?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_conversation_ids: {
        Args: { _user_id: string }
        Returns: string[]
      }
      get_user_league_ids: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
