// Auto-generated shape — matches winepass_schema.sql
// Run: supabase gen types typescript --local > src/types/database.ts

export interface Database {
  public: {
    Tables: {
      appellations: {
        Row: {
          id: string
          slug: string
          name: string
          name_en: string
          name_fr: string
          bank: 'left' | 'right' | 'both' | null
          color_hex: string
          dominant_grape: string | null
          price_min: number | null
          price_max: number | null
          distance_km: number | null
          avg_rating: number | null
          chateau_count: number
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['appellations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['appellations']['Insert']>
      }
      chateaux: {
        Row: {
          id: string
          slug: string
          name: string
          appellation_id: string | null
          tier: 'grand_cru_classe' | 'grand_cru' | 'cru_bourgeois' | 'standard'
          description: string | null
          description_en: string | null
          description_fr: string | null
          description_de: string | null
          lat: number | null
          lng: number | null
          address: string | null
          distance_km: number | null
          wine_styles: string[]
          grape_varieties: string[]
          languages: string[]
          avg_rating: number
          review_count: number
          is_active: boolean
          open_days: string[]
          open_time: string
          close_time: string
          photo_url: string | null
          color_hex: string
          awards: string[]
          is_sustainable: boolean
          is_organic: boolean
          free_cancellation: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['chateaux']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['chateaux']['Insert']>
      }
      bundles: {
        Row: {
          id: string
          chateau_id: string
          name: 'basic' | 'classic' | 'premium'
          price: number
          includes_tasting: boolean
          includes_transport: boolean
          includes_lunch: boolean
          includes_guide: boolean
          includes_second_ch: boolean
          includes_dinner: boolean
          tasting_wines: number
          max_persons: number
          duration_hours: number
          description_en: string | null
          description_fr: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bundles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bundles']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          booking_ref: string
          user_id: string | null
          guest_name: string | null
          guest_email: string | null
          guest_phone: string | null
          special_requests: string | null
          chateau_id: string
          bundle_id: string | null
          experience_id: string | null
          visit_date: string
          visit_time: string
          persons: number
          guests_count: number | null
          selected_addons: unknown[] | null
          language: string
          ai_wine_style: string | null
          ai_budget: number | null
          ai_group_type: string | null
          price_per_person: number
          total_price: number
          tax_amount: number
          commission_amount: number | null
          currency: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded'
          stripe_payment_intent: string | null
          paid_at: string | null
          qr_code: string | null
          qr_expires_at: string | null
          cancellation_deadline: string | null
          cancelled_at: string | null
          cancel_reason: string | null
          hold_expires_at: string | null
          reminder_sent_at: string | null
          review_request_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      gift_cards: {
        Row: {
          id: string
          code: string
          amount: number
          amount_used: number
          currency: string
          purchaser_email: string
          purchaser_name: string | null
          recipient_name: string
          recipient_email: string | null
          personal_message: string | null
          occasion: string | null
          delivery_method: 'email' | 'scheduled' | 'pdf'
          scheduled_at: string | null
          delivered_at: string | null
          stripe_payment_intent: string | null
          status: 'pending' | 'active' | 'used' | 'expired' | 'refunded'
          valid_until: string | null
          redeemed_by: string | null
          redeemed_at: string | null
          redeemed_booking: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['gift_cards']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gift_cards']['Insert']>
      }
      corporate_inquiries: {
        Row: {
          id: string
          company_name: string
          contact_name: string
          contact_email: string
          event_type: 'team_building' | 'client_entertainment' | 'incentive' | 'product_launch' | 'other' | null
          group_size: string | null
          preferred_date: string | null
          budget_range: string | null
          special_requests: string | null
          status: 'new' | 'contacted' | 'proposal_sent' | 'confirmed' | 'closed'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['corporate_inquiries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['corporate_inquiries']['Insert']>
      }
      wine_passport_stamps: {
        Row: {
          id: string
          user_id: string
          booking_id: string
          chateau_id: string
          appellation_id: string | null
          stamp_label: string | null
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['wine_passport_stamps']['Row'], 'id' | 'earned_at'>
        Update: never
      }
      reviews: {
        Row: {
          id: string
          booking_id: string | null
          chateau_id: string
          user_id: string | null
          rating: number
          comment: string | null
          language: string
          is_verified: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      chateau_availability: {
        Row: {
          id: string
          chateau_id: string
          date: string
          time_slot: string
          max_capacity: number
          booked_count: number
          is_blocked: boolean
        }
        Insert: Omit<Database['public']['Tables']['chateau_availability']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['chateau_availability']['Insert']>
      }
      experiences: {
        Row: {
          id: string
          chateau_id: string
          name_en: string
          name_fr: string
          description_en: string | null
          description_fr: string | null
          price_per_person: number
          duration_minutes: number
          max_guests: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['experiences']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['experiences']['Insert']>
      }
      experience_addons: {
        Row: {
          id: string
          chateau_id: string
          name_en: string
          name_fr: string
          price: number
          price_type: 'per_person' | 'per_booking'
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['experience_addons']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['experience_addons']['Insert']>
      }
      chateau_schedule: {
        Row: {
          id: string
          chateau_id: string
          day_of_week: number
          is_open: boolean
          time_slots: string[]
          slot_capacity: number
          is_active: boolean
        }
        Insert: Omit<Database['public']['Tables']['chateau_schedule']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['chateau_schedule']['Insert']>
      }
      chateau_blocked_dates: {
        Row: {
          id: string
          chateau_id: string
          blocked_date: string
          reason: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chateau_blocked_dates']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chateau_blocked_dates']['Insert']>
      }
    }
    Functions: {
      chateaux_nearby: {
        Args: { user_lat: number; user_lng: number; radius_km?: number }
        Returns: { id: string; name: string; distance_km: number; lat: number; lng: number }[]
      }
      generate_booking_ref: {
        Args: { chateau_slug: string }
        Returns: string
      }
      generate_gift_code: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}

// ── Convenience aliases ───────────────────────────────────────
export type Appellation     = Database['public']['Tables']['appellations']['Row']
export type Chateau         = Database['public']['Tables']['chateaux']['Row']
export type Bundle          = Database['public']['Tables']['bundles']['Row']
export type Booking         = Database['public']['Tables']['bookings']['Row']
export type GiftCard        = Database['public']['Tables']['gift_cards']['Row']
export type CorporateInquiry = Database['public']['Tables']['corporate_inquiries']['Row']
export type Stamp           = Database['public']['Tables']['wine_passport_stamps']['Row']
export type Review          = Database['public']['Tables']['reviews']['Row']
export type Availability    = Database['public']['Tables']['chateau_availability']['Row']
export type Experience      = Database['public']['Tables']['experiences']['Row']
export type ExperienceAddon = Database['public']['Tables']['experience_addons']['Row']
export type ChateauSchedule = Database['public']['Tables']['chateau_schedule']['Row']
export type BlockedDate     = Database['public']['Tables']['chateau_blocked_dates']['Row']

// ── Enriched types (with relations) ──────────────────────────
export type ChateauWithAppellation = Chateau & {
  appellation: Appellation | null
  bundles?: Pick<Bundle, 'price'>[]
}
export type ChateauFull = Chateau & {
  appellation: Appellation | null
  bundles: Bundle[]
}
export type BookingFull = Booking & {
  chateau: Chateau
  bundle: Bundle
}

// ── AI Builder state (Flow A) ─────────────────────────────────
export interface AIBuilderState {
  style:  'red' | 'white' | 'both' | 'sweet' | null
  budget: number
  group:  'solo' | 'couple' | 'small' | 'group' | null
  groupCount: number
}
