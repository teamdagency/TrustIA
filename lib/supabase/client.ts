import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          locale: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string | null;
          locale?: string;
          timezone?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          locale?: string;
          timezone?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          industry: string | null;
          country: string;
          timezone: string;
          locale: string;
          plan_id: string | null;
          subscription_status: string;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          logo_url?: string | null;
          industry?: string | null;
          country?: string;
          timezone?: string;
          locale?: string;
          plan_id?: string | null;
          subscription_status?: string;
          trial_ends_at?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          logo_url?: string | null;
          industry?: string | null;
          country?: string;
          timezone?: string;
          locale?: string;
          plan_id?: string | null;
          subscription_status?: string;
          trial_ends_at?: string | null;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          invited_by: string | null;
          joined_at: string;
          created_at: string;
        };
        Insert: {
          organization_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'member';
          invited_by?: string | null;
        };
        Update: {
          role?: 'owner' | 'admin' | 'member';
        };
      };
      plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          price_monthly: number;
          price_yearly: number;
          currency: string;
          features: string[];
          limits: Record<string, number>;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          description?: string;
          price_monthly: number;
          price_yearly: number;
          currency?: string;
          features?: string[];
          limits?: Record<string, number>;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string;
          price_monthly?: number;
          price_yearly?: number;
          currency?: string;
          features?: string[];
          limits?: Record<string, number>;
          is_active?: boolean;
        };
      };
      reviews: {
        Row: {
          id: string;
          organization_id: string;
          customer_id: string | null;
          rating: number;
          title: string;
          content: string;
          source: 'internal' | 'google' | 'facebook' | 'tripadvisor' | 'trustpilot' | 'custom';
          external_id: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'flagged';
          is_verified: boolean;
          responded_at: string | null;
          response_content: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          customer_id?: string | null;
          rating: number;
          title?: string;
          content?: string;
          source?: 'internal' | 'google' | 'facebook' | 'tripadvisor' | 'trustpilot' | 'custom';
          external_id?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'flagged';
          is_verified?: boolean;
        };
        Update: {
          rating?: number;
          title?: string;
          content?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'flagged';
          is_verified?: boolean;
          response_content?: string | null;
        };
      };
      customers: {
        Row: {
          id: string;
          organization_id: string;
          email: string | null;
          phone: string | null;
          full_name: string;
          custom_fields: Record<string, unknown>;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string;
          custom_fields?: Record<string, unknown>;
          tags?: string[];
        };
        Update: {
          email?: string | null;
          phone?: string | null;
          full_name?: string;
          custom_fields?: Record<string, unknown>;
          tags?: string[];
        };
      };
      campaigns: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string;
          type: 'email' | 'sms' | 'both';
          status: 'draft' | 'active' | 'paused' | 'completed';
          template_email: string | null;
          template_sms: string | null;
          trigger_event: 'purchase' | 'service' | 'manual' | 'api';
          delay_hours: number;
          max_reminders: number;
          created_by: string | null;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          name: string;
          description?: string;
          type?: 'email' | 'sms' | 'both';
          status?: 'draft' | 'active' | 'paused' | 'completed';
          template_email?: string | null;
          template_sms?: string | null;
          trigger_event?: 'purchase' | 'service' | 'manual' | 'api';
          delay_hours?: number;
          max_reminders?: number;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          description?: string;
          type?: 'email' | 'sms' | 'both';
          status?: 'draft' | 'active' | 'paused' | 'completed';
          template_email?: string | null;
          template_sms?: string | null;
          trigger_event?: 'purchase' | 'service' | 'manual' | 'api';
          delay_hours?: number;
          max_reminders?: number;
        };
      };
      rewards: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string;
          type: 'discount' | 'gift' | 'points' | 'custom';
          value: number;
          min_rating: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          name: string;
          description?: string;
          type?: 'discount' | 'gift' | 'points' | 'custom';
          value?: number;
          min_rating?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          type?: 'discount' | 'gift' | 'points' | 'custom';
          value?: number;
          min_rating?: number;
          is_active?: boolean;
        };
      };
    };
    Views: {};
    Functions: {
      is_org_member: {
        Args: { org_id: string };
        Returns: boolean;
      };
      is_org_admin: {
        Args: { org_id: string };
        Returns: boolean;
      };
    };
    Enums: {};
  };
};
