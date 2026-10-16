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
