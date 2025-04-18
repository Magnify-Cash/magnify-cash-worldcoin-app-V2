export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          action: string | null
          content: string
          created_at: string
          created_by: string | null
          date: string
          id: number
          is_highlighted: boolean
          is_new: boolean
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
        }
        Insert: {
          action?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          date?: string
          id?: number
          is_highlighted?: boolean
          is_new?: boolean
          title: string
          type?: Database["public"]["Enums"]["announcement_type"]
        }
        Update: {
          action?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          date?: string
          id?: number
          is_highlighted?: boolean
          is_new?: boolean
          title?: string
          type?: Database["public"]["Enums"]["announcement_type"]
        }
        Relationships: []
      }
      mag_roles: {
        Row: {
          created_at: string | null
          description: string | null
          role_id: number
          role_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          role_id?: number
          role_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          role_id?: number
          role_name?: string
        }
        Relationships: []
      }
      mag_user_roles: {
        Row: {
          assigned_at: string | null
          role_id: number
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          role_id: number
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mag_user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "mag_roles"
            referencedColumns: ["role_id"]
          },
          {
            foreignKeyName: "mag_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "mag_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mag_users: {
        Row: {
          created_at: string | null
          email: string
          is_active: boolean | null
          password_hash: string
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          is_active?: boolean | null
          password_hash: string
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          is_active?: boolean | null
          password_hash?: string
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      notifications_log: {
        Row: {
          created_at: string
          environment: string
          id: number
          message: string
          number_of_recipients: number
          path: string
          sender: string | null
          title: string
        }
        Insert: {
          created_at?: string
          environment: string
          id?: number
          message: string
          number_of_recipients: number
          path: string
          sender?: string | null
          title: string
        }
        Update: {
          created_at?: string
          environment?: string
          id?: number
          message?: string
          number_of_recipients?: number
          path?: string
          sender?: string | null
          title?: string
        }
        Relationships: []
      }
      pool_addresses: {
        Row: {
          address: string | null
          created_at: string
          id: number
          name: string | null
          symbol: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: number
          name?: string | null
          symbol?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: number
          name?: string | null
          symbol?: string | null
        }
        Relationships: []
      }
      pool_lp_tokens: {
        Row: {
          created_at: string | null
          id: number
          pool_id: number | null
          timestamp: number | null
          token_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          pool_id?: number | null
          timestamp?: number | null
          token_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          pool_id?: number | null
          timestamp?: number | null
          token_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_lp_tokens_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_announcement_reads: {
        Row: {
          announcement_id: number | null
          id: string
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          announcement_id?: number | null
          id?: string
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          announcement_id?: number | null
          id?: string
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pool_lending: {
        Row: {
          address: string
          assets: number
          blocknumber: number
          eventname: string
          id: number
          pool_id: number
          shares: number
          timestamp: string
        }
        Insert: {
          address: string
          assets: number
          blocknumber: number
          eventname: string
          id?: number
          pool_id: number
          shares: number
          timestamp: string
        }
        Update: {
          address?: string
          assets?: number
          blocknumber?: number
          eventname?: string
          id?: number
          pool_id?: number
          shares?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pool_lending_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          created_at: string
          id: number
          notification: boolean | null
          wallet: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          notification?: boolean | null
          wallet?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          notification?: boolean | null
          wallet?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { role_to_check: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      insert_user_role: {
        Args: { user_id: number; role_id: number }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      announcement_type: "new-feature" | "security" | "update" | "announcement"
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      announcement_type: ["new-feature", "security", "update", "announcement"],
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
