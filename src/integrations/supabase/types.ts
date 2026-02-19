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
      "podbank-test": {
        Row: {
          created_at: string
          id: number
          message: string | null
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          message?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          message?: string | null
          name?: string | null
        }
        Relationships: []
      }
      task_steps: {
        Row: {
          comment: string | null
          completion_date: string | null
          created_at: string
          id: string
          position: number | null
          status: Database["public"]["Enums"]["step_status"]
          step_name: string
          task_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          completion_date?: string | null
          created_at?: string
          id?: string
          position?: number | null
          status?: Database["public"]["Enums"]["step_status"]
          step_name: string
          task_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          completion_date?: string | null
          created_at?: string
          id?: string
          position?: number | null
          status?: Database["public"]["Enums"]["step_status"]
          step_name?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_steps_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          daily_dedicated_time: Database["public"]["Enums"]["daily_time"] | null
          id: string
          is_completed: boolean
          notes: string | null
          position: number | null
          status: Database["public"]["Enums"]["task_status"]
          task_name: string
          task_type: Database["public"]["Enums"]["task_type"]
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          daily_dedicated_time?:
            | Database["public"]["Enums"]["daily_time"]
            | null
          id?: string
          is_completed?: boolean
          notes?: string | null
          position?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          task_name: string
          task_type?: Database["public"]["Enums"]["task_type"]
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          daily_dedicated_time?:
            | Database["public"]["Enums"]["daily_time"]
            | null
          id?: string
          is_completed?: boolean
          notes?: string | null
          position?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          task_name?: string
          task_type?: Database["public"]["Enums"]["task_type"]
          user_id?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          title: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      daily_time:
        | "30_min"
        | "1_hour"
        | "1_5_hour"
        | "2_hour"
        | "2_5_hour"
        | "3_hour"
        | "3_5_hour"
        | "4_hour"
        | "5_hour"
        | "6_hour"
      step_status: "unstarted" | "in_progress" | "completed"
      task_status: "unstarted" | "in_progress" | "paused" | "finished"
      task_type: "single_step" | "multi_step"
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
      daily_time: [
        "30_min",
        "1_hour",
        "1_5_hour",
        "2_hour",
        "2_5_hour",
        "3_hour",
        "3_5_hour",
        "4_hour",
        "5_hour",
        "6_hour",
      ],
      step_status: ["unstarted", "in_progress", "completed"],
      task_status: ["unstarted", "in_progress", "paused", "finished"],
      task_type: ["single_step", "multi_step"],
    },
  },
} as const
