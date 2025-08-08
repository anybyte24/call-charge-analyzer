export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      analysis_sessions: {
        Row: {
          caller_analysis_data: Json
          file_name: string
          id: string
          is_favorite: boolean | null
          last_accessed: string | null
          notes: string | null
          prefix_config: Json | null
          records_data: Json | null
          summary_data: Json
          total_records: number
          upload_date: string | null
          user_id: string | null
        }
        Insert: {
          caller_analysis_data: Json
          file_name: string
          id?: string
          is_favorite?: boolean | null
          last_accessed?: string | null
          notes?: string | null
          prefix_config?: Json | null
          records_data?: Json | null
          summary_data: Json
          total_records: number
          upload_date?: string | null
          user_id?: string | null
        }
        Update: {
          caller_analysis_data?: Json
          file_name?: string
          id?: string
          is_favorite?: boolean | null
          last_accessed?: string | null
          notes?: string | null
          prefix_config?: Json | null
          records_data?: Json | null
          summary_data?: Json
          total_records?: number
          upload_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      client_numbers: {
        Row: {
          caller_number: string
          client_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          caller_number: string
          client_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          caller_number?: string
          client_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_numbers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cost_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          notification_sent_at: string | null
          target_caller: string | null
          target_number: string | null
          threshold_value: number
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notification_sent_at?: string | null
          target_caller?: string | null
          target_number?: string | null
          threshold_value: number
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notification_sent_at?: string | null
          target_caller?: string | null
          target_number?: string | null
          threshold_value?: number
          user_id?: string | null
        }
        Relationships: []
      }
      customer_satisfaction: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          rating: number
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          rating: number
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: number
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_satisfaction_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          active: boolean | null
          body: string
          created_at: string
          id: string
          name: string
          subject: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          active?: boolean | null
          body: string
          created_at?: string
          id?: string
          name: string
          subject: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          active?: boolean | null
          body?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      important_notices: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          message: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_articles: {
        Row: {
          author_id: string
          category_id: string | null
          content: string
          created_at: string
          helpful_count: number | null
          id: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          company_name: string | null
          created_at: string | null
          department: string | null
          display_name: string | null
          id: string
          phone: string | null
          sede_intervento: string | null
          theme_preferences: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company?: string | null
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          display_name?: string | null
          id?: string
          phone?: string | null
          sede_intervento?: string | null
          theme_preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company?: string | null
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          display_name?: string | null
          id?: string
          phone?: string | null
          sede_intervento?: string | null
          theme_preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saved_configurations: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          prefix_config: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          prefix_config: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          prefix_config?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_monitors: {
        Row: {
          check_interval_minutes: number | null
          created_at: string | null
          endpoint_url: string | null
          id: string
          is_active: boolean | null
          last_check_at: string | null
          service_name: string
          updated_at: string | null
        }
        Insert: {
          check_interval_minutes?: number | null
          created_at?: string | null
          endpoint_url?: string | null
          id?: string
          is_active?: boolean | null
          last_check_at?: string | null
          service_name: string
          updated_at?: string | null
        }
        Update: {
          check_interval_minutes?: number | null
          created_at?: string | null
          endpoint_url?: string | null
          id?: string
          is_active?: boolean | null
          last_check_at?: string | null
          service_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_status: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_manual_override: boolean | null
          last_checked: string
          manual_status: string | null
          service_name: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_manual_override?: boolean | null
          last_checked?: string
          manual_status?: string | null
          service_name: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_manual_override?: boolean | null
          last_checked?: string
          manual_status?: string | null
          service_name?: string
          status?: string
        }
        Relationships: []
      }
      sla_policies: {
        Row: {
          created_at: string
          escalation_enabled: boolean | null
          escalation_hours: number | null
          id: string
          is_active: boolean | null
          name: string
          priority: string
          resolution_time_hours: number
          response_time_hours: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          escalation_enabled?: boolean | null
          escalation_hours?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          priority: string
          resolution_time_hours: number
          response_time_hours: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          escalation_enabled?: boolean | null
          escalation_hours?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: string
          resolution_time_hours?: number
          response_time_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      ticket_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_categories: {
        Row: {
          color: string | null
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_categories_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string
          id: string
          is_active: boolean | null
          name: string
          priority: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          is_active?: boolean | null
          name: string
          priority?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          id: string
          odoo_id: number | null
          priority: string
          requester_name: string | null
          resolved_at: string | null
          satisfaction_rating: number | null
          sla_breach_type: string | null
          sla_policy_id: string | null
          sla_resolution_due_at: string | null
          sla_response_due_at: string | null
          status: string
          template_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description: string
          id: string
          odoo_id?: number | null
          priority?: string
          requester_name?: string | null
          resolved_at?: string | null
          satisfaction_rating?: number | null
          sla_breach_type?: string | null
          sla_policy_id?: string | null
          sla_resolution_due_at?: string | null
          sla_response_due_at?: string | null
          status?: string
          template_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          odoo_id?: number | null
          priority?: string
          requester_name?: string | null
          resolved_at?: string | null
          satisfaction_rating?: number | null
          sla_breach_type?: string | null
          sla_policy_id?: string | null
          sla_resolution_due_at?: string | null
          sla_response_due_at?: string | null
          status?: string
          template_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          billable: boolean | null
          created_at: string
          description: string | null
          hourly_rate: number | null
          hours_spent: number
          id: string
          ticket_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billable?: boolean | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          hours_spent: number
          id?: string
          ticket_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billable?: boolean | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          hours_spent?: number
          id?: string
          ticket_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_event: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_event: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_event?: string
          updated_at?: string
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
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_cliente: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_staff: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator" | "cliente" | "staff"
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
    Enums: {
      app_role: ["admin", "user", "moderator", "cliente", "staff"],
    },
  },
} as const
