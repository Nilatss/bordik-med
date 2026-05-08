/**
 * P1-CR-5 — Hand-typed Supabase database types.
 *
 * РЕКОМЕНДУЕМЫЙ путь — auto-generation через CLI:
 *   npx supabase gen types typescript --project-id <SUPABASE_PROJECT_ID>
 *     > lib/database.types.ts
 *
 * Но на момент написания SUPABASE_PROJECT_ID не задан в env, и
 * прямой запрос к Management API требует ручного access-token'а.
 * Поэтому файл собран вручную из supabase/schema.sql + content-schema.sql.
 *
 * Когда SUPABASE_PROJECT_ID появится:
 *   1. npm exec -- supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > lib/database.types.ts
 *   2. Удалить этот header, оставить auto-generated content
 *   3. Обновить импорты во всех routes:
 *      sb.from<Database['public']['Tables']['profiles']['Row']>('profiles')
 *
 * До тех пор этот файл — single source of truth для table-shape'ов.
 * При изменениях schema.sql ОБЯЗАТЕЛЬНО синхронизировать вручную
 * (или автоматизировать generation в CI).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ─── Auth-side profile ──────────────────────────────────────
      profiles: {
        Row: {
          id: string;                    // uuid → auth.users
          display_name: string | null;
          email: string | null;
          status: string | null;         // school / university / working
          country: string | null;
          specialty: string | null;
          language: string;              // default 'ru'
          goal: string | null;
          updated_at: string;            // timestamptz
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email?: string | null;
          status?: string | null;
          country?: string | null;
          specialty?: string | null;
          language?: string;
          goal?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };

      // ─── Course progress ────────────────────────────────────────
      course_progress: {
        Row: {
          user_id: string;
          course_id: string;
          started_at: string | null;
          completed_at: string | null;
          highest_test_level: number;    // smallint 0-5
          module_passed: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          course_id: string;
          started_at?: string | null;
          completed_at?: string | null;
          highest_test_level?: number;
          module_passed?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['course_progress']['Insert']>;
        Relationships: [];
      };

      // ─── Test attempts (last 50 per user) ───────────────────────
      test_attempts: {
        Row: {
          id: string;                    // uuid
          user_id: string;
          course_id: string;
          level: number;                 // 1-5 or 0 = module final
          score: number;
          total: number;
          passed: boolean;
          violations: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          level: number;
          score: number;
          total: number;
          passed: boolean;
          violations?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['test_attempts']['Insert']>;
        Relationships: [];
      };

      // ─── Tools page persistent settings ─────────────────────────
      tool_settings: {
        Row: {
          user_id: string;
          query: string;
          categories: Json;              // string[]
          subcategories: Json;           // string[]
          countries: Json;               // string[]
          only_available: boolean;
          favourites: Json;              // string[]
          updated_at: string;
        };
        Insert: {
          user_id: string;
          query?: string;
          categories?: Json;
          subcategories?: Json;
          countries?: Json;
          only_available?: boolean;
          favourites?: Json;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tool_settings']['Insert']>;
        Relationships: [];
      };

      // ─── Study time (seconds per course) ────────────────────────
      study_time: {
        Row: {
          user_id: string;
          course_id: string;
          seconds: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          course_id: string;
          seconds?: number;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['study_time']['Insert']>;
        Relationships: [];
      };

      // ─── Content tables (review-flow) ───────────────────────────
      tools: {
        Row: {
          id: string;
          slug: string;
          status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
          title: string;
          summary: string | null;
          category: string | null;
          published_at: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          status?: 'draft' | 'review' | 'approved' | 'published' | 'archived';
          title: string;
          summary?: string | null;
          category?: string | null;
          published_at?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tools']['Insert']>;
        Relationships: [];
      };

      tools_bands: {
        Row: {
          id: string;
          tool_id: string;
          min_score: number;
          max_score: number;
          label: string;
          color: string;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          min_score: number;
          max_score: number;
          label: string;
          color: string;
          description?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tools_bands']['Insert']>;
        Relationships: [];
      };
    };

    Views: { [_ in never]: never };
    Functions: {
      // SECURITY DEFINER helpers (см. supabase/*.sql).
      handle_new_user: { Args: Record<string, never>; Returns: unknown };
      enforce_four_eye: { Args: Record<string, never>; Returns: unknown };
      editor_role_of: { Args: { uid: string }; Returns: string };
      delete_user_cascade: { Args: { target_user_id: string }; Returns: void };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };

  // audit-схема — append-only event log. См. supabase/p3-audit-events.sql.
  audit: {
    Tables: {
      events: {
        Row: {
          id: number;                    // bigserial
          ts: string;
          event_type: string;            // varchar(100)
          actor_id: string | null;
          target_id: string | null;
          metadata: Json;
          severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
        };
        Insert: {
          id?: number;
          ts?: string;
          event_type: string;
          actor_id?: string | null;
          target_id?: string | null;
          metadata?: Json;
          severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
        };
        Update: Partial<Database['audit']['Tables']['events']['Insert']>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      log_event: {
        Args: {
          p_event_type: string;
          p_actor_id?: string | null;
          p_target_id?: string | null;
          p_metadata?: Json;
          p_severity?: string;
        };
        Returns: number;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

/**
 * Convenience aliases — для использования без длинного doted-path'а:
 *   import type { Profile, CourseProgress } from '@/lib/database.types';
 */
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type CourseProgress = Database['public']['Tables']['course_progress']['Row'];
export type TestAttempt = Database['public']['Tables']['test_attempts']['Row'];
export type ToolSettings = Database['public']['Tables']['tool_settings']['Row'];
export type StudyTime = Database['public']['Tables']['study_time']['Row'];
export type Tool = Database['public']['Tables']['tools']['Row'];
export type ToolBand = Database['public']['Tables']['tools_bands']['Row'];
export type AuditEvent = Database['audit']['Tables']['events']['Row'];
