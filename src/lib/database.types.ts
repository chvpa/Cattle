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
      animals: {
        Row: {
          id: string;
          tag: string;
          name: string;
          gender: "male" | "female";
          birth_date: string;
          breed: string;
          status: "healthy" | "sick" | "pregnant";
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          tag: string;
          name: string;
          gender: "male" | "female";
          birth_date: string;
          breed: string;
          status: "healthy" | "sick" | "pregnant";
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          tag?: string;
          name?: string;
          gender?: "male" | "female";
          birth_date?: string;
          breed?: string;
          status?: "healthy" | "sick" | "pregnant";
          created_at?: string;
          user_id?: string;
        };
      };
      vaccines: {
        Row: {
          id: string;
          animal_id: string;
          vaccine_type: string;
          date: string;
          next_date: string | null;
          notes: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          vaccine_type: string;
          date: string;
          next_date?: string | null;
          notes?: string | null;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          vaccine_type?: string;
          date?: string;
          next_date?: string | null;
          notes?: string | null;
          created_at?: string;
          user_id?: string;
        };
      };
    };
  };
}
