import { Community, Member, Space, Post, Course, MembershipPlan, AIKnowledgeItem } from "./types";

export const MOCK_COMMUNITY: Community = {
  id: "comm_akstack_001",
  name: "AKStack AI Builders Club",
  slug: "akstack-builders",
  tagline: "The premier community for autonomous agent engineers, AI founders, and full-stack builders.",
  description: "Join 1,240+ elite creators and software engineers mastering autonomous agent architectures, multi-tenant cloud systems, and AI-first applications.",
  logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
  cover_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
  rules: "1. Be helpful and share code. 2. No ungrounded hype. 3. Zero spam. 4. Respect fellow builders.",
  is_private: false,
  member_count: 1248,
};

export const MOCK_MEMBERS: Member[] = [
  {
    id: "usr_admin_001",
    community_id: "comm_akstack_001",
    user_id: "usr_admin_001",
    email: "admin@akstack.com",
    full_name: "Akaash Sharma (Super Admin)",
    handle: "akaash",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "owner",
    level: 9,
    points: 3450,
    bio: "Platform Architect & Founder @ AKStack. Building autonomous agent systems and enterprise developer tooling.",
    plan_tier: "vip",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "usr_sarah_002",
    community_id: "comm_akstack_001",
    user_id: "usr_sarah_002",
    email: "sarah.chen@aiengineer.io",
    full_name: "Sarah Chen",
    handle: "sarahc",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    role: "admin",
    level: 7,
    points: 2180,
    bio: "Staff AI Engineer. Specialized in LLM fine-tuning, RAG evaluations, and prompt engineering frameworks.",
    plan_tier: "pro",
    created_at: "2026-02-15T14:30:00Z",
  },
  {
    id: "usr_marcus_003",
    community_id: "comm_akstack_001",
    user_id: "usr_marcus_003",
    email: "marcus.v@devopslead.com",
    full_name: "Marcus Vance",
    handle: "marcusv",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "moderator",
    level: 5,
    points: 1420,
    bio: "Cloud & DevOps Lead. Self-hosted Supabase, Dokploy Swarm, and Traefik reverse-proxy wizard.",
    plan_tier: "pro",
    created_at: "2026-03-01T09:15:00Z",
  },
  {
    id: "usr_priya_004",
    community_id: "comm_akstack_001",
    user_id: "usr_priya_004",
    email: "priya.nair@buildwithai.com",
    full_name: "Priya Nair",
    handle: "priyanair",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "member",
    level: 4,
    points: 980,
    bio: "Full-Stack Developer learning autonomous agent orchestration. Shipping Next.js 15 apps.",
    plan_tier: "free",
    created_at: "2026-04-12T16:45:00Z",
  },
  {
    id: "usr_david_005",
    community_id: "comm_akstack_001",
    user_id: "usr_david_005",
    email: "david.ross@saasgrowth.co",
    full_name: "David Ross",
    handle: "davidross",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "member",
    level: 3,
    points: 620,
    bio: "Product Lead automating repetitive manual sales and marketing operations using AI agent pipelines.",
    plan_tier: "free",
    created_at: "2026-05-20T11:20:00Z",
  },
];

export const MOCK_SPACES: Space[] = [
  {
    id: "space_announcements",
    community_id: "comm_akstack_001",
    name: "🚀 Announcements",
    slug: "announcements",
    description: "Official releases, new masterclass lectures, and platform updates",
    icon: "Megaphone",
    is_private: false,
    sort_order: 1,
  },
  {
    id: "space_general",
    community_id: "comm_akstack_001",
    name: "💡 General Discussion",
    slug: "general",
    description: "Brainstorm agent architectures, discuss model benchmarks, and connect",
    icon: "MessageSquare",
    is_private: false,
    sort_order: 2,
  },
  {
    id: "space_showcase",
    community_id: "comm_akstack_001",
    name: "🏆 Project Showcase",
    slug: "showcase",
    description: "Share live demos, get technical peer reviews, and celebrate wins",
    icon: "Award",
    is_private: false,
    sort_order: 3,
  },
  {
    id: "space_resources",
    community_id: "comm_akstack_001",
    name: "📚 Cheat Sheets & Prompts",
    slug: "resources",
    description: "Curated prompt architectures, API scripts, and Docker templates",
    icon: "Bookmark",
    is_private: false,
    sort_order: 4,
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: "post_001",
    space_id: "space_announcements",
    author_id: "usr_admin_001",
    author: MOCK_MEMBERS[0],
    title: "Welcome to AKStack CommunityOS! The Next-Gen Hub for AI Builders",
    content: `Welcome everyone to the official AKStack CommunityOS workspace! 🌟

Here is what you have access to right now:
1. **Community Discussions**: Post questions, share architectural patterns, and connect with fellow developers.
2. **Classroom Masterclass**: Watch in-depth video modules on building production-grade autonomous agent loops and self-hosted cloud backends.
3. **AI Knowledge Assistant**: An in-app copilot powered by Xiaomi MiMo AI V2.6 via the high-speed Singapore Token Plan gateway, trained on all community resources.

Introduce yourself in the General space below! What agent or SaaS are you currently building?`,
    is_pinned: true,
    likes_count: 54,
    comments_count: 4,
    created_at: "2026-10-14T08:00:00Z",
    user_has_liked: true,
    comments: [
      {
        id: "c_001",
        post_id: "post_001",
        author_id: "usr_sarah_002",
        author: MOCK_MEMBERS[1],
        content: "Excited to be here! The video player layout and lesson progression checklist feel just like Skool. Huge congrats on the launch!",
        likes_count: 12,
        created_at: "2026-10-14T08:30:00Z",
      },
      {
        id: "c_002",
        post_id: "post_001",
        author_id: "usr_marcus_003",
        author: MOCK_MEMBERS[2],
        content: "Already deployed my first micro-agent following the Lesson 1.2 MiMo guide. Sub-second response latency is incredible.",
        likes_count: 8,
        created_at: "2026-10-14T09:15:00Z",
      },
      {
        id: "c_003",
        post_id: "post_001",
        author_id: "usr_priya_004",
        author: MOCK_MEMBERS[3],
        content: "Hello from Bangalore! Working on an AI clinical trial research agent. Looking forward to learning from everyone.",
        likes_count: 6,
        created_at: "2026-10-14T10:00:00Z",
      },
      {
        id: "c_004",
        post_id: "post_001",
        author_id: "usr_david_005",
        author: MOCK_MEMBERS[4],
        content: "Love the UI clean light/dark mode aesthetic. Great job Akaash!",
        likes_count: 4,
        created_at: "2026-10-14T11:20:00Z",
      },
    ],
  },
  {
    id: "post_002",
    space_id: "space_showcase",
    author_id: "usr_sarah_002",
    author: MOCK_MEMBERS[1],
    title: "Shipped: Zero-Hallucination Deterministic Semantic Query Router",
    content: `Just wrapped up an architecture that combines pre-computed SQL statistical metrics (sum, average, 2-sigma variance anomalies) with external LLM synthesis.

By injecting verified numbers directly into the system prompt's ground truth context, the model cannot hallucinate or skew calculations. If external providers encounter a quota timeout, it cleanly degrades to an offline mathematical proof.

Check out the full writeup in Module 2!`,
    is_pinned: false,
    likes_count: 38,
    comments_count: 2,
    created_at: "2026-10-14T12:00:00Z",
    user_has_liked: false,
    comments: [
      {
        id: "c_005",
        post_id: "post_002",
        author_id: "usr_admin_001",
        author: MOCK_MEMBERS[0],
        content: "This pattern is game-changing for business intelligence tools. Grounded citations give users absolute confidence.",
        likes_count: 9,
        created_at: "2026-10-14T12:30:00Z",
      },
    ],
  },
  {
    id: "post_003",
    space_id: "space_resources",
    author_id: "usr_marcus_003",
    author: MOCK_MEMBERS[2],
    title: "Production Dokploy VPS Traefik Blueprint with Zero-Downtime Rolling Deploys",
    content: `Here is our standard stack for hosting containerized Next.js apps with automated Let's Encrypt certificates and Docker Swarm rolling updates:
- Reverse Proxy: Traefik on port 80/443
- Container Engine: Docker Swarm / Nixpacks
- Health Checks: HTTP /api/health with 5s timeouts
- Multi-Tenant DB: Self-hosted Supabase with prefix isolation (app_<slug>_*)

Let me know if you need help setting this up on your VPS!`,
    is_pinned: false,
    likes_count: 29,
    comments_count: 1,
    created_at: "2026-10-14T14:15:00Z",
    user_has_liked: true,
  },
];

export const MOCK_COURSES: Course[] = [
  {
    id: "course_agentic_01",
    community_id: "comm_akstack_001",
    title: "Agentic AI Engineering Masterclass: From Zero to Production",
    slug: "agentic-ai-masterclass",
    description: "Master autonomous agents, tool calling, memory persistence, multi-modal reasoning, and self-hosted Supabase RLS architectures.",
    cover_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    is_locked: false,
    required_tier: "free",
    total_lessons: 4,
    sort_order: 1,
    modules: [
      {
        id: "mod_01",
        course_id: "course_agentic_01",
        title: "Module 1: Foundations of Autonomous Agents",
        sort_order: 1,
        lessons: [
          {
            id: "les_01",
            module_id: "mod_01",
            title: "Lesson 1.1: Architecture of Agentic Loops (Sense, Plan, Act, Observe)",
            slug: "architecture-agentic-loops",
            content: `### Understanding the Autonomous Loop

Traditional software is deterministic and procedural. Autonomous agents, however, operate in a continuous perception-action feedback loop:

1. **Sense**: The agent receives incoming signals (user goals, background notifications, webhook triggers).
2. **Plan**: Formulates an execution strategy, decomposing complex requests into atomic sub-tasks.
3. **Act**: Invokes specialized tools (database execution, code synthesis, web queries).
4. **Observe**: Inspects tool return values, captures errors, and self-corrects without giving up.

> **Key Rule**: The user's instruction is the final deliverable. Abandonment is never an option.`,
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration_minutes: 14,
            is_free_preview: true,
            sort_order: 1,
            is_completed: true,
          },
          {
            id: "les_02",
            module_id: "mod_01",
            title: "Lesson 1.2: Xiaomi MiMo AI V2.6 & Singapore Token Plan Gateway",
            slug: "mimo-ai-integration",
            content: `### High-Throughput Reasoning with Xiaomi MiMo AI

In this lecture, we connect Xiaomi's flagship **MiMo-V2.6-Flash** model using the regional Singapore Token Plan gateway (\`token-plan-sgp.xiaomimimo.com\`).

Key highlights:
- 1 Million Token context window
- Deep reasoning step output before final synthesis
- Fast sub-second response times for enterprise agent workflows
- Regional token plan cluster authentication via \`tp-*\` keys`,
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration_minutes: 18,
            is_free_preview: true,
            sort_order: 2,
            is_completed: true,
          },
        ],
      },
      {
        id: "mod_02",
        course_id: "course_agentic_01",
        title: "Module 2: Memory Persistence & Compaction",
        sort_order: 2,
        lessons: [
          {
            id: "les_03",
            module_id: "mod_02",
            title: "Lesson 2.1: Surviving Context Windows with Structured Compaction",
            slug: "context-compaction",
            content: `### The Compaction Pattern

When building long-running coding agents, conversations frequently exceed model context lengths. 

Instead of discarding history:
1. Distill active tasks into structured task state artifacts.
2. Persist decisions to long-term memory (\`MEMORY.md\`).
3. Re-inject continuity summaries upon session wakeup.`,
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration_minutes: 20,
            is_free_preview: false,
            sort_order: 1,
            is_completed: false,
          },
          {
            id: "les_04",
            module_id: "mod_02",
            title: "Lesson 2.2: Tool Calling & Error Recovery Protocols",
            slug: "tool-calling-recovery",
            content: `Learn how to structure schema-defined function calls and handle JSON parse errors gracefully.`,
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration_minutes: 16,
            is_free_preview: false,
            sort_order: 2,
            is_completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "course_saas_02",
    community_id: "comm_akstack_001",
    title: "Full-Stack SaaS Platform Engineering with Dokploy & Supabase",
    slug: "saas-platform-engineering",
    description: "Deploy scalable multi-tenant SaaS products with automated GitHub actions, Dokploy VPS orchestration, and isolated PostgreSQL namespaces.",
    cover_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    is_locked: true,
    required_tier: "pro",
    total_lessons: 6,
    sort_order: 2,
    modules: [],
  },
];

export const MOCK_PLANS: MembershipPlan[] = [
  {
    id: "plan_free",
    name: "Free Community Member",
    description: "Access to community discussions, foundation courses, and community directory profile.",
    price_monthly: 0,
    currency: "INR",
    features: [
      "Access to Announcements and General spaces",
      "Agentic AI Foundations Masterclass",
      "Community directory profile & achievements",
      "10 AI Copilot queries per day",
    ],
    is_active: true,
  },
  {
    id: "plan_pro",
    name: "Pro Builder & Creator",
    description: "Full access to all advanced masterclasses, private code channels, and unlimited MiMo AI queries.",
    price_monthly: 999,
    currency: "INR",
    features: [
      "Everything in Free, plus:",
      "Full-Stack SaaS Platform Engineering Course",
      "Private VIP code showcase & review channels",
      "Unlimited Xiaomi MiMo AI Copilot queries",
      "Downloadable production Docker blueprints & prompt packs",
      "Priority direct office-hours support",
    ],
    is_active: true,
  },
];

export const MOCK_AI_KNOWLEDGE: AIKnowledgeItem[] = [
  {
    id: "k_001",
    title: "AKStack CommunityOS Guidelines & Conduct",
    content: "AKStack CommunityOS rules: 1. Be helpful and share real code. 2. No ungrounded hype. 3. Zero spam. 4. Respect fellow builders. Questions should include reproducible examples.",
    source_type: "guideline",
  },
  {
    id: "k_002",
    title: "Agentic AI Masterclass Syllabus",
    content: "The Agentic AI Engineering Masterclass covers 4 core pillars: Sense, Plan, Act, and Observe. It integrates Xiaomi MiMo AI V2.6 with Singapore Token Plan endpoints for fast high-context inference.",
    source_type: "lesson",
  },
  {
    id: "k_003",
    title: "Dokploy & Supabase Architecture",
    content: "AKStack uses Dokploy VPS on 185.205.244.119 with self-hosted PostgreSQL. Each application is strictly isolated using prefix-based namespacing (app_school_*) and Row-Level Security.",
    source_type: "faq",
  },
  {
    id: "k_004",
    title: "Xiaomi MiMo AI Integration",
    content: "Xiaomi MiMo AI Token Plan keys (starting with tp- or ttp-) connect to https://token-plan-sgp.xiaomimimo.com/v1. Supported models include mimo-v2.6-flash, mimo-v2.6-pro, and mimo-v2.6-pro-ultraspeed.",
    source_type: "lesson",
  },
];
