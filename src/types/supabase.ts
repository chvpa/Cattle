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
      animals: {
        Row: {
          birth_date: string
          breed: string
          category: string | null
          created_at: string | null
          ear_tag: string | null
          entry_date: string | null
          farm: string | null
          gender: string
          id: string
          name: string
          owner: string | null
          paddock: string | null
          purpose: string | null
          status: string
          tag: string
          user_id: string
          weight: string | null
        }
        Insert: {
          birth_date: string
          breed: string
          category?: string | null
          created_at?: string | null
          ear_tag?: string | null
          entry_date?: string | null
          farm?: string | null
          gender: string
          id?: string
          name: string
          owner?: string | null
          paddock?: string | null
          purpose?: string | null
          status: string
          tag: string
          user_id: string
          weight?: string | null
        }
        Update: {
          birth_date?: string
          breed?: string
          category?: string | null
          created_at?: string | null
          ear_tag?: string | null
          entry_date?: string | null
          farm?: string | null
          gender?: string
          id?: string
          name?: string
          owner?: string | null
          paddock?: string | null
          purpose?: string | null
          status?: string
          tag?: string
          user_id?: string
          weight?: string | null
        }
        Relationships: []
      }
      reproductions: {
        Row: {
          actual_birth_date: string | null
          created_at: string | null
          expected_birth_date: string
          father_id: string
          id: string
          mother_id: string
          notes: string | null
          service_date: string
          service_method: string
          status: string | null
          user_id: string
        }
        Insert: {
          actual_birth_date?: string | null
          created_at?: string | null
          expected_birth_date: string
          father_id: string
          id?: string
          mother_id: string
          notes?: string | null
          service_date: string
          service_method: string
          status?: string | null
          user_id: string
        }
        Update: {
          actual_birth_date?: string | null
          created_at?: string | null
          expected_birth_date?: string
          father_id?: string
          id?: string
          mother_id?: string
          notes?: string | null
          service_date?: string
          service_method?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reproductions_father_id_fkey"
            columns: ["father_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reproductions_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccines: {
        Row: {
          animal_id: string
          created_at: string | null
          date: string
          id: string
          next_date: string | null
          notes: string | null
          user_id: string
          vaccine_type: string
        }
        Insert: {
          animal_id: string
          created_at?: string | null
          date: string
          id?: string
          next_date?: string | null
          notes?: string | null
          user_id: string
          vaccine_type: string
        }
        Update: {
          animal_id?: string
          created_at?: string | null
          date?: string
          id?: string
          next_date?: string | null
          notes?: string | null
          user_id?: string
          vaccine_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccines_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
