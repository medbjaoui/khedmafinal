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
      admin_settings: {
        Row: {
          created_at: string | null
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          created_at: string | null
          gemini_api_key: string | null
          groq_api_key: string | null
          id: string
          max_tokens: number | null
          preferred_model: string | null
          temperature: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gemini_api_key?: string | null
          groq_api_key?: string | null
          id?: string
          max_tokens?: number | null
          preferred_model?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          gemini_api_key?: string | null
          groq_api_key?: string | null
          id?: string
          max_tokens?: number | null
          preferred_model?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          completion_tokens: number | null
          created_at: string | null
          id: string
          model: string
          prompt_tokens: number | null
          request_type: string | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          completion_tokens?: number | null
          created_at?: string | null
          id?: string
          model: string
          prompt_tokens?: number | null
          request_type?: string | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          completion_tokens?: number | null
          created_at?: string | null
          id?: string
          model?: string
          prompt_tokens?: number | null
          request_type?: string | null
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          applied_date: string | null
          attachments: string[] | null
          company_email: string | null
          cover_letter: string | null
          cover_letter_file_path: string | null
          created_at: string | null
          custom_message: string | null
          email_id: string | null
          email_sent: boolean | null
          id: string
          interview_date: string | null
          job_id: string
          notes: string | null
          read_receipt: boolean | null
          response: string | null
          response_date: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          applied_date?: string | null
          attachments?: string[] | null
          company_email?: string | null
          cover_letter?: string | null
          cover_letter_file_path?: string | null
          created_at?: string | null
          custom_message?: string | null
          email_id?: string | null
          email_sent?: boolean | null
          id?: string
          interview_date?: string | null
          job_id: string
          notes?: string | null
          read_receipt?: boolean | null
          response?: string | null
          response_date?: string | null
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          applied_date?: string | null
          attachments?: string[] | null
          company_email?: string | null
          cover_letter?: string | null
          cover_letter_file_path?: string | null
          created_at?: string | null
          custom_message?: string | null
          email_id?: string | null
          email_sent?: boolean | null
          id?: string
          interview_date?: string | null
          job_id?: string
          notes?: string | null
          read_receipt?: boolean | null
          response?: string | null
          response_date?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string | null
          credential_id: string | null
          expiry_date: string | null
          id: string
          issue_date: string
          issuer: string
          name: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credential_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date: string
          issuer: string
          name: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credential_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string
          issuer?: string
          name?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string | null
          current: boolean | null
          degree: string
          description: string | null
          end_date: string | null
          field: string
          grade: string | null
          id: string
          institution: string
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current?: boolean | null
          degree: string
          description?: string | null
          end_date?: string | null
          field: string
          grade?: string | null
          id?: string
          institution: string
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          current?: boolean | null
          degree?: string
          description?: string | null
          end_date?: string | null
          field?: string
          grade?: string | null
          id?: string
          institution?: string
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          achievements: string[] | null
          company: string
          created_at: string | null
          current: boolean | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          position: string
          start_date: string
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          company: string
          created_at?: string | null
          current?: boolean | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          position: string
          start_date: string
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          company?: string
          created_at?: string | null
          current?: boolean | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          position?: string
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          benefits: string[] | null
          company: string
          created_at: string | null
          description: string
          expires_at: string | null
          external_id: string | null
          id: string
          is_active: boolean | null
          location: string
          posted_date: string | null
          requirements: string[] | null
          salary: string | null
          source: string
          title: string
          type: string
        }
        Insert: {
          benefits?: string[] | null
          company: string
          created_at?: string | null
          description: string
          expires_at?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          posted_date?: string | null
          requirements?: string[] | null
          salary?: string | null
          source: string
          title: string
          type: string
        }
        Update: {
          benefits?: string[] | null
          company?: string
          created_at?: string | null
          description?: string
          expires_at?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          posted_date?: string | null
          requirements?: string[] | null
          salary?: string | null
          source?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          created_at: string | null
          id: string
          level: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          action: string
          category: string
          completed: boolean | null
          created_at: string | null
          description: string
          dismissed: boolean | null
          id: string
          priority: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action: string
          category: string
          completed?: boolean | null
          created_at?: string | null
          description: string
          dismissed?: boolean | null
          id?: string
          priority: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action?: string
          category?: string
          completed?: boolean | null
          created_at?: string | null
          description?: string
          dismissed?: boolean | null
          id?: string
          priority?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string | null
          id: string
          level: string
          name: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          level: string
          name: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          level?: string
          name?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          level: string
          message: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          source: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          level: string
          message: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          source: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          level?: string
          message?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          source?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          level: string
          message: string
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          level: string
          message: string
          source: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          level?: string
          message?: string
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          payment_method: string
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          payment_method: string
          status: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          payment_method?: string
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          completion_score: number | null
          created_at: string | null
          cv_file_path: string | null
          date_of_birth: string | null
          first_name: string
          github: string | null
          id: string
          last_name: string
          linkedin: string | null
          location: string | null
          phone: string | null
          portfolio: string | null
          summary: string | null
          title: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          completion_score?: number | null
          created_at?: string | null
          cv_file_path?: string | null
          date_of_birth?: string | null
          first_name: string
          github?: string | null
          id: string
          last_name: string
          linkedin?: string | null
          location?: string | null
          phone?: string | null
          portfolio?: string | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          completion_score?: number | null
          created_at?: string | null
          cv_file_path?: string | null
          date_of_birth?: string | null
          first_name?: string
          github?: string | null
          id?: string
          last_name?: string
          linkedin?: string | null
          location?: string | null
          phone?: string | null
          portfolio?: string | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      debug_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_user_id: string
          has_admin_role: boolean
          user_metadata: Json
          error_message: string
        }[]
      }
      fix_admin_role: {
        Args: { admin_email: string }
        Returns: string
      }
      get_user_role: {
        Args: { target_user_id: string }
        Returns: string
      }
      get_users_with_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          first_name: string
          last_name: string
          email: string
          title: string
          location: string
          completion_score: number
          created_at: string
          updated_at: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_user_role: {
        Args: { target_user_id: string; new_role: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
