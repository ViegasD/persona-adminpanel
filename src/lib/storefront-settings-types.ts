export interface StorefrontPolicy {
  revision: number;
  new_orders_enabled: boolean;
  registration_enabled: boolean;
  credit_redemption_enabled: boolean;
  require_account_checkout: boolean;
  video_duration_seconds: number | null;
  video_model: 'grok-imagine-video' | 'grok-imagine-video-1.5' | null;
}
export interface StorefrontSettings {
  policy: StorefrontPolicy;
  status: {
    processing_enabled: boolean; processing_start_at: string | null;
    recovery_enabled: boolean; account_email_enabled: boolean;
    whatsapp_delivery_enabled: boolean; signup_bonus: number;
    purchase_bonus: number; credits_per_video: number; credit_purchase_enabled: boolean;
    default_video_duration_seconds: number; default_video_model: string;
  };
}
export interface StorefrontPlan {
  id: number; slug: string; name: string; price_cents: number;
  video_count: number; max_characters_per_video: number;
  features: string[] | null; is_active: boolean;
}
