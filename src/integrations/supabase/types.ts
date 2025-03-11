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
        Args: {
          role_to_check: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      insert_user_role: {
        Args: {
          user_id: number
          role_id: number
        }
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
