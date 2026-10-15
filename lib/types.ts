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
