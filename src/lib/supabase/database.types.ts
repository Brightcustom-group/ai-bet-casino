export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          author_id: string;
          body: string;
          category_id: number;
          content_type: Database["public"]["Enums"]["content_type"];
          created_at: string;
          excerpt: string;
          id: string;
          is_featured: boolean;
          league_id: number | null;
          published_at: string | null;
          search: unknown;
          slug: string;
          sport_id: number | null;
          status: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          author_id?: string;
          body: string;
          category_id: number;
          content_type: Database["public"]["Enums"]["content_type"];
          created_at?: string;
          excerpt: string;
          id?: string;
          is_featured?: boolean;
          league_id?: number | null;
          published_at?: string | null;
          search?: never;
          slug: string;
          sport_id?: number | null;
          status?: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          category_id?: number;
          content_type?: Database["public"]["Enums"]["content_type"];
          created_at?: string;
          excerpt?: string;
          id?: string;
          is_featured?: boolean;
          league_id?: number | null;
          published_at?: string | null;
          search?: never;
          slug?: string;
          sport_id?: number | null;
          status?: Database["public"]["Enums"]["content_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_league_id_sport_id_fkey";
            columns: ["league_id", "sport_id"];
            isOneToOne: false;
            referencedRelation: "leagues";
            referencedColumns: ["id", "sport_id"];
          },
          {
            foreignKeyName: "articles_sport_id_fkey";
            columns: ["sport_id"];
            isOneToOne: false;
            referencedRelation: "sports";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          details: NonNullable<Json>;
          entity: string;
          entity_id: string | null;
          id: number;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          details?: NonNullable<Json>;
          entity: string;
          entity_id?: string | null;
          id?: never;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          details?: NonNullable<Json>;
          entity?: string;
          entity_id?: string | null;
          id?: never;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          description: string;
          id: number;
          name: string;
          section: Database["public"]["Enums"]["content_section"];
          slug: string;
        };
        ComputedFields: never;
        Insert: {
          description?: string;
          id?: never;
          name: string;
          section: Database["public"]["Enums"]["content_section"];
          slug: string;
        };
        Update: {
          description?: string;
          id?: never;
          name?: string;
          section?: Database["public"]["Enums"]["content_section"];
          slug?: string;
        };
        Relationships: [];
      };
      leagues: {
        Row: {
          country: string | null;
          id: number;
          name: string;
          slug: string;
          sport_id: number;
        };
        ComputedFields: never;
        Insert: {
          country?: string | null;
          id?: never;
          name: string;
          slug: string;
          sport_id: number;
        };
        Update: {
          country?: string | null;
          id?: never;
          name?: string;
          slug?: string;
          sport_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "leagues_sport_id_fkey";
            columns: ["sport_id"];
            isOneToOne: false;
            referencedRelation: "sports";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          display_name: string;
          id: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      sports: {
        Row: {
          id: number;
          name: string;
          slug: string;
        };
        ComputedFields: never;
        Insert: {
          id?: never;
          name: string;
          slug: string;
        };
        Update: {
          id?: never;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_set_role: {
        Args: { new_role: Database["public"]["Enums"]["app_role"]; target_user: string };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: "reader" | "editor" | "admin";
      content_section: "sports" | "casino" | "responsible_gambling";
      content_status: "draft" | "published" | "archived";
      content_type: "preview" | "tip" | "odds_analysis" | "casino_guide" | "responsible_gambling";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["reader", "editor", "admin"],
      content_section: ["sports", "casino", "responsible_gambling"],
      content_status: ["draft", "published", "archived"],
      content_type: ["preview", "tip", "odds_analysis", "casino_guide", "responsible_gambling"],
    },
  },
} as const;
