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
      artists: {
        Row: {
          id: string;
          name: string;
          mmi_year: string;
          age: number;
          email: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          mmi_year: string;
          age: number;
          email: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          mmi_year?: string;
          age?: number;
          email?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
      };
      social_links: {
        Row: {
          id: string;
          artist_id: string;
          platform: string;
          link: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          platform: string;
          link: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          artist_id?: string;
          platform?: string;
          link?: string;
          created_at?: string;
        };
      };
      works: {
        Row: {
          id: string;
          artist_id: string;
          title: string;
          year: number;
          category: string;
          technique: string | null;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          title: string;
          year: number;
          category: string;
          technique?: string | null;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          artist_id?: string;
          title?: string;
          year?: number;
          category?: string;
          technique?: string | null;
          description?: string;
          created_at?: string;
        };
      };
      work_images: {
        Row: {
          id: string;
          work_id: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          work_id: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          work_id?: string;
          image_url?: string;
          created_at?: string;
        };
      };
    };
  };
}
