export type MemberRole = "superadmin" | "owner" | "admin" | "moderator" | "member";
export type PlanTier = "free" | "pro" | "vip";

export interface Community {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo_url?: string;
  cover_url?: string;
  rules?: string;
  is_private: boolean;
  member_count?: number;
}

export interface Member {
  id: string;
  community_id: string;
  user_id: string;
  email: string;
  full_name: string;
  handle: string;
  avatar_url: string;
  role: MemberRole;
  level: number;
  points: number;
  bio?: string;
  plan_tier: PlanTier;
  created_at: string;
}

export interface Space {
  id: string;
  community_id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_private: boolean;
  sort_order: number;
}

export interface Post {
  id: string;
  space_id: string;
  author_id: string;
  author: Member;
  title: string;
  content: string;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  comments?: Comment[];
  user_has_liked?: boolean;
  poll?: Poll;
}

// ============================================================================
// Pillar 4: Real-Time Social & Community Features
// ============================================================================

export interface PollOption {
  id: string;
  text: string;
  votes_count: number;
}

export interface Poll {
  id: string;
  post_id: string;
  question: string;
  options: PollOption[];
  total_votes: number;
  user_voted_option_id?: string;
  expires_at?: string;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  participant: Member;
  last_message: DirectMessage;
  unread_count: number;
  messages: DirectMessage[];
}

export interface CommunityEvent {
  id: string;
  community_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  location_type: "live_stream" | "google_meet" | "zoom" | "in_person";
  location_url: string;
  host_member: Member;
  attendees_count: number;
  user_has_rsvped?: boolean;
  category: "workshop" | "office_hours" | "hackathon" | "guest_speaker";
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author: Member;
  content: string;
  likes_count: number;
  created_at: string;
}

export interface Course {
  id: string;
  community_id: string;
  title: string;
  slug: string;
  description: string;
  cover_url: string;
  is_locked: boolean;
  required_tier: PlanTier;
  total_lessons: number;
  sort_order: number;
  modules?: CourseModule[];
  pricing?: CoursePricing;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  content: string;
  video_url?: string;
  duration_minutes: number;
  is_free_preview: boolean;
  sort_order: number;
  is_completed?: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  currency: string;
  features: string[];
  is_active: boolean;
}

export interface AIKnowledgeItem {
  id: string;
  title: string;
  content: string;
  source_type: "post" | "lesson" | "guideline" | "faq";
  source_id?: string;
}

// ============================================================================
// Pillar 2: Gamification & Streaks
// ============================================================================

export interface Streak {
  member_id: string;
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_date: string;
  fire_active: boolean;
}

export type BadgeTier = "bronze" | "silver" | "gold" | "diamond";

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  tier: BadgeTier;
  requirement_type: "points" | "streak" | "course" | "quiz" | "posts";
  requirement_val: number;
  unlocked_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  member: Member;
  points: number;
  streak_days: number;
  level: number;
  courses_completed: number;
  badges_count: number;
}

// ============================================================================
// Pillar 3: Quizzes & Certificates
// ============================================================================

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  course_id: string;
  module_id: string;
  lesson_id?: string;
  title: string;
  description: string;
  passing_percentage: number;
  questions: QuizQuestion[];
  points_reward: number;
}

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  member_id: string;
  score: number;
  passed: boolean;
  submitted_answers: Record<string, number>;
  created_at: string;
}

export interface Certificate {
  id: string;
  course_id: string;
  course_title: string;
  member_id: string;
  recipient_name: string;
  recipient_avatar?: string;
  certificate_number: string;
  issued_at: string;
  verification_hash: string;
  grade_percentage: number;
  instructor_name: string;
}

// ============================================================================
// Pillar 1: Monetization, Multi-Gateway & Course-Specific Pricing
// ============================================================================

export type PaymentGatewayProvider = "stripe" | "paypal" | "both";
export type BillingInterval = "month" | "year" | "one_time";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "unpaid";
export type CoursePricingType = "tier_only" | "one_time" | "subscription" | "hybrid";

export interface PaymentGatewayConfig {
  community_id: string;
  active_gateways: PaymentGatewayProvider;
  stripe_enabled: boolean;
  stripe_publishable_key: string;
  stripe_secret_key_masked: string;
  stripe_webhook_secret_masked: string;
  stripe_live_mode: boolean;
  stripe_connected: boolean;
  paypal_enabled: boolean;
  paypal_client_id: string;
  paypal_secret_masked: string;
  paypal_webhook_id: string;
  paypal_sandbox_mode: boolean;
  paypal_connected: boolean;
  currency: string;
  updated_at: string;
}

export interface CoursePricing {
  course_id: string;
  pricing_type: CoursePricingType;
  one_time_price: number;
  monthly_price: number;
  yearly_price: number;
  required_tier: PlanTier;
  allow_standalone_purchase: boolean;
  currency: string;
}

export interface Subscription {
  id: string;
  community_id: string;
  member_id: string;
  plan_tier: PlanTier;
  billing_interval: BillingInterval;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  provider: "stripe" | "paypal";
  provider_subscription_id: string;
  created_at: string;
}

export interface CoursePurchase {
  id: string;
  community_id: string;
  member_id: string;
  course_id: string;
  purchase_type: "one_time" | "monthly" | "yearly";
  amount: number;
  currency: string;
  provider: "stripe" | "paypal";
  provider_payment_id: string;
  expires_at?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  member_id: string;
  subscription_id?: string;
  course_id?: string;
  item_description: string;
  amount: number;
  currency: string;
  status: "paid" | "open" | "void";
  provider: "stripe" | "paypal";
  receipt_url?: string;
  created_at: string;
}

// ============================================================================
// Pillar 6: Creator Analytics, GTM Engineering & Delegated Views (RBAC)
// ============================================================================

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  growth_rate_pct: number;
  net_revenue_30d: number;
  arpu: number;
  ltv: number;
  by_gateway: {
    stripe: number;
    paypal: number;
  };
  by_tier: {
    pro: number;
    vip: number;
    standalone_courses: number;
  };
}

export interface ChurnMetrics {
  churn_rate_pct: number;
  voluntary_cancellations_30d: number;
  payment_failures_30d: number;
  net_mrr_churn: number;
  retention_rate_pct: number;
  at_risk_members_count: number;
}

export interface CourseFunnelMetric {
  course_id: string;
  course_title: string;
  enrolled_count: number;
  started_count: number;
  halfway_count: number;
  completed_count: number;
  completion_rate_pct: number;
  average_days_to_finish: number;
  quiz_pass_rate_pct: number;
  certificates_issued_count: number;
  top_dropoff_lesson?: {
    module_id: string;
    lesson_id: string;
    lesson_title: string;
    dropoff_pct: number;
  };
}

export interface CommunityEngagementMetrics {
  dau: number;
  wau: number;
  mau: number;
  stickiness_ratio: number; // DAU / MAU * 100
  total_posts_30d: number;
  total_comments_30d: number;
  total_poll_votes_30d: number;
  total_dms_sent_30d: number;
  total_event_rsvps_30d: number;
  top_contributors: Array<{
    member_id: string;
    name: string;
    avatar_url: string;
    xp: number;
    level: number;
    posts_count: number;
  }>;
}

export interface AnalyticsSummary {
  community_id: string;
  timestamp: string;
  revenue: RevenueMetrics;
  churn: ChurnMetrics;
  courses: CourseFunnelMetric[];
  engagement: CommunityEngagementMetrics;
}

export type GTMLifecycleStage = 
  | "visitor" 
  | "lead" 
  | "activated" 
  | "engaged" 
  | "paying_customer" 
  | "vip" 
  | "at_risk" 
  | "churned";

export type GTMEventType =
  | "user_registered"
  | "community_joined"
  | "course_viewed"
  | "paywall_hit"
  | "checkout_initiated"
  | "checkout_completed"
  | "tier_upgraded"
  | "lesson_started"
  | "lesson_completed"
  | "quiz_attempted"
  | "certificate_claimed"
  | "post_created"
  | "poll_voted"
  | "dm_sent"
  | "event_rsvped"
  | "subscription_cancelled";

export interface GTMInteractionLog {
  id: string;
  community_id: string;
  member_id?: string;
  member_name?: string;
  member_email?: string;
  event_type: GTMEventType;
  lifecycle_stage: GTMLifecycleStage;
  target_id?: string;
  target_name?: string;
  metadata: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referrer?: string;
    device?: string;
    country?: string;
    amount?: number;
    currency?: string;
    provider?: "stripe" | "paypal";
    plan_tier?: PlanTier;
    [key: string]: any;
  };
  created_at: string;
}

export type ManagerRoleTitle = 
  | "growth_lead" 
  | "community_manager" 
  | "course_director" 
  | "operations_manager" 
  | "support_lead";

export interface ManagerPermission {
  id: string;
  community_id: string;
  member_id: string;
  member_name: string;
  member_email: string;
  role_title: ManagerRoleTitle;
  custom_title?: string;
  status: "active" | "invited" | "suspended";
  created_at: string;
  // Granular View & Action Permissions
  can_view_revenue: boolean;
  can_view_gtm_logs: boolean;
  can_view_lms_analytics: boolean;
  can_view_community_metrics: boolean;
  can_export_reports: boolean;
  can_manage_curriculum: boolean;
  can_moderate_content: boolean;
}

// ============================================================================
// Growth Suite: Affiliates, Email Broadcasts & Live Rooms
// ============================================================================

export interface AffiliatePartner {
  id: string;
  community_id: string;
  member_id: string;
  referral_code: string;
  referral_url: string;
  commission_rate_pct: number;
  total_clicks: number;
  total_referrals: number;
  total_revenue_generated: number;
  unpaid_commission: number;
  paid_commission: number;
  payout_email: string;
  payout_method: "paypal" | "bank_transfer" | "stripe";
  status: "active" | "pending" | "suspended";
  created_at: string;
}

export interface ReferralConversion {
  id: string;
  affiliate_id: string;
  buyer_id: string;
  buyer_name: string;
  item_type: "membership" | "course";
  item_title: string;
  order_amount: number;
  commission_amount: number;
  currency: string;
  status: "pending" | "approved" | "paid" | "rejected";
  created_at: string;
}

export interface AffiliateProgramConfig {
  is_enabled: boolean;
  default_commission_pct: number;
  cookie_duration_days: number;
  minimum_payout_amount: number;
  auto_approve_members: boolean;
}

export type BroadcastAudience = "all_members" | "pro_only" | "vip_only" | "free_only" | "course_students";

export interface EmailBroadcast {
  id: string;
  community_id: string;
  subject: string;
  preview_text: string;
  content_html: string;
  audience: BroadcastAudience;
  target_course_id?: string;
  status: "draft" | "scheduled" | "sent";
  recipient_count: number;
  open_rate_pct?: number;
  click_rate_pct?: number;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
}

export interface BroadcastTemplate {
  id: string;
  name: string;
  description: string;
  category: "digest" | "announcement" | "upsell" | "welcome";
  subject_template: string;
  content_template: string;
}

export type LiveRoomPlatform = "native" | "zoom" | "google_meet" | "youtube_live";

export interface LiveSessionRoom {
  id: string;
  community_id: string;
  title: string;
  description: string;
  host_id: string;
  host_name: string;
  host_avatar: string;
  platform: LiveRoomPlatform;
  join_url: string;
  is_live_now: boolean;
  scheduled_start: string;
  duration_minutes: number;
  agenda: string[];
  attendees_count: number;
  recording_url?: string;
  required_tier: PlanTier;
}

export interface EventReplayTimestamp {
  time: string;
  label: string;
}

export interface EventReplay {
  id: string;
  title: string;
  description: string;
  speaker: string;
  speaker_avatar: string;
  recorded_at: string;
  duration: string;
  video_url: string;
  thumbnail_url: string;
  required_tier: PlanTier;
  views_count: number;
  slides_url?: string;
  timestamps: EventReplayTimestamp[];
}




