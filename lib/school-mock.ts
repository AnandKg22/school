import {
  Community,
  Member,
  Space,
  Post,
  Course,
  MembershipPlan,
  AIKnowledgeItem,
  Streak,
  Badge,
  LeaderboardEntry,
  Quiz,
  Certificate,
  Poll,
  Conversation,
  DirectMessage,
  CommunityEvent,
} from "./types";

export const MOCK_COMMUNITY: Community = {
  id: "comm_akschool_001",
  name: "AKSchool AI Builders Club",
  slug: "akschool-builders",
  tagline: "The premier academy & community for AI engineers, founders, and modern builders.",
  description: "Join 1,248+ builders mastering autonomous agent architectures, full-stack systems, and modern AI engineering.",
  logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
  cover_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
  rules: "1. Be helpful and share real code. 2. Ground claims with benchmarks. 3. Zero spam. 4. Respect fellow builders.",
  is_private: false,
  member_count: 1248,
};

export const MOCK_MEMBERS: Member[] = [
  {
    id: "usr_admin_001",
    community_id: "comm_akschool_001",
    user_id: "usr_admin_001",
    email: "admin@akstack.com",
    full_name: "Akaash Sharma (Super Admin)",
    handle: "akaash",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "owner",
    level: 9,
    points: 3450,
    bio: "Platform Architect & Founder @ AKSchool. Building autonomous agent systems and enterprise developer education.",
    plan_tier: "vip",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "usr_sarah_002",
    community_id: "comm_akschool_001",
    user_id: "usr_sarah_002",
    email: "sarah.chen@aiengineer.io",
    full_name: "Sarah Chen",
    handle: "sarahc",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    role: "admin",
    level: 7,
    points: 2180,
    bio: "Staff AI Engineer. Specialized in LLM evaluations, autonomous tool architectures, and RAG frameworks.",
    plan_tier: "pro",
    created_at: "2026-02-15T14:30:00Z",
  },
  {
    id: "usr_marcus_003",
    community_id: "comm_akschool_001",
    user_id: "usr_marcus_003",
    email: "marcus.v@devopslead.com",
    full_name: "Marcus Vance",
    handle: "marcusv",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "moderator",
    level: 5,
    points: 1420,
    bio: "Cloud & DevOps Architect. Specialized in distributed containers, CI/CD automation, and high-availability database infrastructure.",
    plan_tier: "pro",
    created_at: "2026-03-01T09:15:00Z",
  },
  {
    id: "usr_priya_004",
    community_id: "comm_akschool_001",
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
    community_id: "comm_akschool_001",
    user_id: "usr_david_005",
    email: "david.ross@saasgrowth.co",
    full_name: "David Ross",
    handle: "davidross",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "member",
    level: 3,
    points: 620,
    bio: "Product Lead automating operations and enterprise workflows using intelligent AI pipelines.",
    plan_tier: "free",
    created_at: "2026-05-20T11:20:00Z",
  },
];

export const MOCK_SPACES: Space[] = [
  {
    id: "space_announcements",
    community_id: "comm_akschool_001",
    name: "🚀 Announcements",
    slug: "announcements",
    description: "Official releases, new masterclass lectures, and academy updates",
    icon: "Megaphone",
    is_private: false,
    sort_order: 1,
  },
  {
    id: "space_general",
    community_id: "comm_akschool_001",
    name: "💡 General Discussion",
    slug: "general",
    description: "Brainstorm agent architectures, discuss model benchmarks, and connect",
    icon: "MessageSquare",
    is_private: false,
    sort_order: 2,
  },
  {
    id: "space_showcase",
    community_id: "comm_akschool_001",
    name: "🏆 Project Showcase",
    slug: "showcase",
    description: "Share live demos, get technical peer reviews, and celebrate wins",
    icon: "Award",
    is_private: false,
    sort_order: 3,
  },
  {
    id: "space_resources",
    community_id: "comm_akschool_001",
    name: "📚 Code & Blueprints",
    slug: "resources",
    description: "Curated prompt architectures, API scripts, and production templates",
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
    title: "🚀 Welcome to AKSchool! The Next-Gen Hub for AI Builders",
    content: `Welcome everyone to the official **AKSchool** workspace! 🌟

Here is what you have access to right now:
1. **Community Discussions**: Post questions, share architectural patterns, and connect with fellow developers.
2. **Classroom Masterclasses**: Watch in-depth video modules on building production-grade autonomous agent loops and modern cloud backends.
3. **Nova AI Study Buddy**: An in-app learning companion trained on all AKSchool curriculum and community resources to answer your questions 24/7.

Introduce yourself in the General space below! What AI project or application are you currently building?`,
    is_pinned: true,
    likes_count: 126,
    comments_count: 4,
    created_at: "2026-10-14T08:00:00Z",
    user_has_liked: true,
    poll: {
      id: "poll_001",
      post_id: "post_001",
      question: "Which AI stack are you prioritizing for production autonomous agents in 2026?",
      total_votes: 184,
      user_voted_option_id: "opt_1",
      options: [
        { id: "opt_1", text: "Multi-Agent Loops with Next.js 15 & Supabase (DevMatrix / CrewAI)", votes_count: 94 },
        { id: "opt_2", text: "LangGraph / LangChain State Machines", votes_count: 52 },
        { id: "opt_3", text: "Direct LLM API Structured Function Calling (OpenAI / Gemini 2.5)", votes_count: 26 },
        { id: "opt_4", text: "Local Offline Models via Ollama / vLLM", votes_count: 12 },
      ],
    },
    comments: [
      {
        id: "c_001",
        post_id: "post_001",
        author_id: "usr_sarah_002",
        author: MOCK_MEMBERS[1],
        content: "Excited to be here! The video player layout, lecture notes, and clean study guides feel just like Skool. Huge congrats on the launch!",
        likes_count: 12,
        created_at: "2026-10-14T08:30:00Z",
      },
      {
        id: "c_002",
        post_id: "post_001",
        author_id: "usr_marcus_003",
        author: MOCK_MEMBERS[2],
        content: "Already deployed my first autonomous agent pipeline following the Lesson 1.2 architecture guide. Performance is incredible.",
        likes_count: 8,
        created_at: "2026-10-14T09:15:00Z",
      },
      {
        id: "c_003",
        post_id: "post_001",
        author_id: "usr_priya_004",
        author: MOCK_MEMBERS[3],
        content: "Hello from Bangalore! Working on an AI clinical research agent. Looking forward to learning from everyone.",
        likes_count: 6,
        created_at: "2026-10-14T10:00:00Z",
      },
      {
        id: "c_004",
        post_id: "post_001",
        author_id: "usr_david_005",
        author: MOCK_MEMBERS[4],
        content: "Love the clean white space and blue-emerald design aesthetic. Great job Akaash!",
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
    title: "💎 Shipped: Zero-Hallucination Deterministic Semantic Query Router",
    content: `Just wrapped up an architecture that combines pre-computed SQL statistical metrics with external LLM synthesis.

By injecting verified numbers directly into the system prompt's ground truth context, the model cannot hallucinate or skew calculations. If external providers encounter a quota timeout, it cleanly degrades to an offline mathematical proof.

Check out the full writeup in Module 2!`,
    is_pinned: false,
    likes_count: 38,
    comments_count: 1,
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
    title: "⚡ Production Architecture Blueprint: Automated CI/CD with Zero-Downtime Rolling Deploys",
    content: `Here is our standard stack for hosting containerized Next.js 15 applications with automated SSL certificates and rolling updates:
- **Reverse Proxy**: High-throughput routing with automatic SSL renewal
- **Container Engine**: Production Docker containers with automated health checks
- **Health Checks**: HTTP \`/api/health\` with automated status monitors
- **Database Layer**: PostgreSQL with Row-Level Security (RLS) isolation and schema migrations

Let me know if you need help architecting your cloud infrastructure!`,
    is_pinned: false,
    likes_count: 29,
    comments_count: 0,
    created_at: "2026-10-14T14:15:00Z",
    user_has_liked: true,
    poll: {
      id: "poll_002",
      post_id: "post_003",
      question: "Primary Production Deployment Target for Agent Microservices:",
      total_votes: 112,
      options: [
        { id: "opt_2_1", text: "Self-Hosted Dokploy / Coolify on VPS (Hetzner / DigitalOcean)", votes_count: 68 },
        { id: "opt_2_2", text: "AWS ECS / Fargate Containers", votes_count: 24 },
        { id: "opt_2_3", text: "Vercel / Cloudflare Workers Edge", votes_count: 15 },
        { id: "opt_2_4", text: "Google Cloud Run / GKE", votes_count: 5 },
      ],
    },
  },
];

export const MOCK_COURSES: Course[] = [
  {
    id: "course_agentic_01",
    community_id: "comm_akschool_001",
    title: "Agentic AI Engineering Masterclass: From Zero to Production",
    slug: "agentic-ai-masterclass",
    description: "Master autonomous agents, tool calling, memory persistence, multi-modal reasoning, and self-hosted database architectures.",
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

> **Key Rule**: The user's instruction is the final deliverable. Abandonment is never an option.

### Core Implementation Pattern

\`\`\`typescript
interface AgentLoop {
  sense: (signal: UserSignal) => TaskPlan;
  act: (toolCall: ToolInvocation) => Promise<ToolResult>;
  observe: (result: ToolResult) => NextStepDecision;
}
\`\`\`
`,
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration_minutes: 14,
            is_free_preview: true,
            sort_order: 1,
            is_completed: true,
          },
          {
            id: "les_02",
            module_id: "mod_01",
            title: "Lesson 1.2: High-Performance LLM Reasoning & Token Pipelines",
            slug: "llm-reasoning-pipelines",
            content: `### High-Throughput Reasoning with Modern LLM Architectures

In this lecture, we connect high-performance reasoning models to autonomous execution loops:

Key architecture pillars:
- **High-Context Windows**: Managing 1M+ token contexts without hallucination
- **Reasoning Step Separation**: Emitting intermediate thought chains prior to synthesized user delivery
- **Sub-Second Streaming**: Token-by-token streaming pipelines for responsive UI feedback
- **Fallback Resilience**: Automatic failover between reasoning tiers when quotas or timeouts occur

### Implementation Blueprint

\`\`\`typescript
export async function streamReasoningPipeline(prompt: string) {
  // Stream reasoning steps to UI, then produce verified final response
  return await dispatchAgentPipeline({ prompt, temperature: 0.3 });
}
\`\`\`
`,
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
            content: `### Tool Calling & Graceful Degradation

Learn how to structure schema-defined function calls and handle JSON parse errors gracefully:
- Schema validation with strict types
- Automatic retry on syntax faults
- Graceful fallbacks when external APIs rate limit`,
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
    community_id: "comm_akschool_001",
    title: "Full-Stack AI Application Engineering & Scalable Cloud Deployments",
    slug: "full-stack-ai-engineering",
    description: "Deploy scalable multi-tenant AI products with automated GitHub CI/CD, production Docker containers, and isolated PostgreSQL namespaces.",
    cover_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    is_locked: true,
    required_tier: "pro",
    total_lessons: 4,
    sort_order: 2,
    modules: [
      {
        id: "mod_saas_01",
        course_id: "course_saas_02",
        title: "Module 1: Cloud Architecture & High-Performance Routing",
        sort_order: 1,
        lessons: [
          {
            id: "les_saas_01",
            module_id: "mod_saas_01",
            title: "Lesson 1.1: Production Docker Containers & Automated CI/CD",
            slug: "production-docker-containers",
            content: `### Scalable Cloud Containerization

In this lecture, we configure production Docker containers for full-stack Next.js applications:

We cover:
- Multi-stage Docker builds minimizing image sizes to < 120MB
- Automated GitHub Actions CI/CD workflows triggering rolling updates
- Zero-downtime rolling deploys with automated health monitoring
- Environment variable injection and secret management`,
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration_minutes: 22,
            is_free_preview: false,
            sort_order: 1,
            is_completed: false,
          },
          {
            id: "les_saas_02",
            module_id: "mod_saas_01",
            title: "Lesson 1.2: Reverse Proxy Routing & Custom Domain SSL",
            slug: "reverse-proxy-ssl",
            content: `### Dynamic SSL & Domain Management

Learn how to manage customer-owned custom domains, configure CNAME routing dynamically, and automate SSL certificate issuance via Let's Encrypt.`,
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration_minutes: 19,
            is_free_preview: false,
            sort_order: 2,
            is_completed: false,
          },
        ],
      },
      {
        id: "mod_saas_02",
        course_id: "course_saas_02",
        title: "Module 2: High-Concurrency PostgreSQL & Multi-Tenant Data Isolation",
        sort_order: 2,
        lessons: [
          {
            id: "les_saas_03",
            module_id: "mod_saas_02",
            title: "Lesson 2.1: Multi-Tenant Database Architecture & Row-Level Security",
            slug: "postgresql-three-layer-isolation",
            content: `### Enterprise Data Isolation

Learn how to safely host multi-tenant communities on a single PostgreSQL instance:
1. **Row-Level Security (RLS)**: Enforcing strict tenant boundaries at the database engine level
2. **Application Claims**: Passing cryptographically signed JWT tokens
3. **Audit Trails**: Maintaining append-only event logs for compliance`,
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration_minutes: 25,
            is_free_preview: false,
            sort_order: 1,
            is_completed: false,
          },
        ],
      },
    ],
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
      "10 Nova AI Study Buddy queries per day",
    ],
    is_active: true,
  },
  {
    id: "plan_pro",
    name: "Pro Builder & Creator",
    description: "Full access to all advanced masterclasses, private code channels, and unlimited Nova AI queries.",
    price_monthly: 999,
    currency: "INR",
    features: [
      "Everything in Free, plus:",
      "Full-Stack AI Application Engineering Course",
      "Private VIP code showcase & review channels",
      "Unlimited Nova AI Study Buddy queries",
      "Downloadable production Docker blueprints & prompt packs",
      "Priority direct office-hours support",
    ],
    is_active: true,
  },
];

export const MOCK_AI_KNOWLEDGE: AIKnowledgeItem[] = [
  {
    id: "k_001",
    title: "AKSchool Guidelines & Conduct",
    content: "AKSchool rules: 1. Be helpful and share real code. 2. Ground claims with benchmarks. 3. Zero spam. 4. Respect fellow builders. Questions should include reproducible examples.",
    source_type: "guideline",
  },
  {
    id: "k_002",
    title: "Agentic AI Masterclass Curriculum",
    content: "The Agentic AI Engineering Masterclass covers 4 core pillars: Sense, Plan, Act, and Observe. It trains students on autonomous loops, tool calling, and high-performance LLM integration.",
    source_type: "lesson",
  },
  {
    id: "k_003",
    title: "Cloud Architecture & Scalability",
    content: "AKSchool teaches modern cloud containerization using Docker, automated GitHub CI/CD, and PostgreSQL with Row-Level Security (RLS) data isolation.",
    source_type: "faq",
  },
  {
    id: "k_004",
    title: "Nova AI Study Buddy",
    content: "Nova is AKSchool's official AI learning companion. Nova indexes classroom masterclasses, community discussions, and code blueprints to provide instant, cited answers to students.",
    source_type: "lesson",
  },
];

// ============================================================================
// Pillar 2: Gamification Demo Data
// ============================================================================

export const MOCK_STREAKS: Record<string, Streak> = {
  usr_admin_001: {
    member_id: "usr_admin_001",
    current_streak_days: 14,
    longest_streak_days: 28,
    last_activity_date: "2026-10-16",
    fire_active: true,
  },
  usr_sarah_002: {
    member_id: "usr_sarah_002",
    current_streak_days: 9,
    longest_streak_days: 15,
    last_activity_date: "2026-10-16",
    fire_active: true,
  },
  usr_marcus_003: {
    member_id: "usr_marcus_003",
    current_streak_days: 5,
    longest_streak_days: 12,
    last_activity_date: "2026-10-15",
    fire_active: true,
  },
  usr_elena_004: {
    member_id: "usr_elena_004",
    current_streak_days: 3,
    longest_streak_days: 7,
    last_activity_date: "2026-10-16",
    fire_active: true,
  },
  usr_dev_005: {
    member_id: "usr_dev_005",
    current_streak_days: 1,
    longest_streak_days: 4,
    last_activity_date: "2026-10-16",
    fire_active: true,
  },
};

export const MOCK_BADGES: Badge[] = [
  {
    id: "bdg_001",
    title: "First Code Drop",
    description: "Published your first technical discussion post in the community feed.",
    icon_name: "Code2",
    tier: "bronze",
    requirement_type: "posts",
    requirement_val: 1,
  },
  {
    id: "bdg_002",
    title: "7-Day Streak Master",
    description: "Maintained an unbroken daily learning or contribution streak for 7 days.",
    icon_name: "Flame",
    tier: "silver",
    requirement_type: "streak",
    requirement_val: 7,
  },
  {
    id: "bdg_003",
    title: "Quiz Champion",
    description: "Scored 100% on any advanced academy assessment quiz.",
    icon_name: "Trophy",
    tier: "gold",
    requirement_type: "quiz",
    requirement_val: 1,
  },
  {
    id: "bdg_004",
    title: "Certified AI Engineer",
    description: "Completed 100% of the Masterclass and earned a verified Certificate.",
    icon_name: "GraduationCap",
    tier: "diamond",
    requirement_type: "course",
    requirement_val: 1,
  },
  {
    id: "bdg_005",
    title: "Centurion Scholar",
    description: "Accumulated 1,000+ reputation points across community lessons & comments.",
    icon_name: "Award",
    tier: "silver",
    requirement_type: "points",
    requirement_val: 1000,
  },
  {
    id: "bdg_006",
    title: "Grandmaster Architect",
    description: "Accumulated 3,000+ points and achieved Level 9 rank.",
    icon_name: "Crown",
    tier: "diamond",
    requirement_type: "points",
    requirement_val: 3000,
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    member: MOCK_MEMBERS[0], // Akaash
    points: 3450,
    streak_days: 14,
    level: 9,
    courses_completed: 4,
    badges_count: 6,
  },
  {
    rank: 2,
    member: MOCK_MEMBERS[1], // Sarah
    points: 2180,
    streak_days: 9,
    level: 7,
    courses_completed: 3,
    badges_count: 4,
  },
  {
    rank: 3,
    member: MOCK_MEMBERS[2], // Marcus
    points: 1420,
    streak_days: 5,
    level: 5,
    courses_completed: 2,
    badges_count: 3,
  },
  {
    rank: 4,
    member: MOCK_MEMBERS[3], // Elena
    points: 890,
    streak_days: 3,
    level: 4,
    courses_completed: 1,
    badges_count: 2,
  },
  {
    rank: 5,
    member: MOCK_MEMBERS[4], // Dev
    points: 340,
    streak_days: 1,
    level: 2,
    courses_completed: 1,
    badges_count: 1,
  },
];

// ============================================================================
// Pillar 3: Quizzes & Certificate Demo Data
// ============================================================================

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: "quiz_mod_001",
    course_id: "course_agentic_001",
    module_id: "mod_01",
    title: "Agentic Loop & Autonomous Tooling Assessment",
    description: "Test your mastery over the Agentic Execution Cycle, default-deny safety boundaries, and structured JSON tool calling.",
    passing_percentage: 75,
    points_reward: 25,
    questions: [
      {
        id: "q1",
        question: "In an autonomous agentic loop, what is the primary role of the PreToolUse lifecycle hook?",
        options: [
          "To automatically rewrite the user's prompt in the background.",
          "To intercept dangerous actions (e.g., git push, drop table) and enforce human confirmation (default-deny).",
          "To measure the token latency of the language model.",
          "To restart the browser whenever a page fails to load.",
        ],
        correct_index: 1,
        explanation: "PreToolUse hooks intercept model tool invocations before execution, evaluating risk tiers and prompting for explicit human confirmation on irreversible or destructive actions.",
      },
      {
        id: "q2",
        question: "Why should Next.js server actions marked with 'use server' only export async functions?",
        options: [
          "Next.js bundler throws a runtime error if non-function objects, schemas, or variables are exported from 'use server' files.",
          "Synchronous functions are deprecated in React 19.",
          "Server actions cannot access database connections synchronously.",
          "To allow browser localStorage to cache server results.",
        ],
        correct_index: 0,
        explanation: "Next.js App Router enforces that files marked with 'use server' act as RPC boundaries and must only export async functions. Shared constants or schemas must be imported from non-'use server' modules.",
      },
      {
        id: "q3",
        question: "When multi-tenancy is implemented on a single shared Supabase database, what guarantees zero data leakage between apps?",
        options: [
          "Using different passwords for each table.",
          "Strict table namespacing (app_<slug>_*) combined with Row-Level Security (RLS) enforcing auth.jwt() -> 'user_metadata' ->> 'app'.",
          "Relying on client-side state filtering in React useEffect.",
          "Encrypting table names with Base64.",
        ],
        correct_index: 1,
        explanation: "PostgreSQL Row-Level Security (RLS) scoped to the application slug in the JWT user metadata ensures that even direct SQL queries cannot select or mutate records belonging to other tenants.",
      },
      {
        id: "q4",
        question: "What is the primary benefit of Next.js 'output: standalone' in Docker multi-stage builds?",
        options: [
          "It enables live WebSockets without a Node server.",
          "It traces only the exact production files needed, creating an ultra-lightweight container (~150MB) without the full node_modules folder.",
          "It automatically compiles TypeScript into WebAssembly.",
          "It removes all CSS styles from production.",
        ],
        correct_index: 1,
        explanation: "Standalone mode copies only the traced dependency subset into .next/standalone, allowing a tiny Node production container that starts instantaneously.",
      },
    ],
  },
  {
    id: "quiz_mod_002",
    course_id: "course_agentic_001",
    module_id: "mod_02",
    title: "RAG & Vector Retrieval Mastery Exam",
    description: "Demonstrate your understanding of embeddings, chunking strategies, hybrid search, and hallucination reduction.",
    passing_percentage: 80,
    points_reward: 30,
    questions: [
      {
        id: "q2_1",
        question: "What is the most effective approach to prevent LLM hallucinations when answering domain-specific queries?",
        options: [
          "Increasing temperature to 1.5 for maximum creativity.",
          "Grounding generation with cited sources and prompting the model to explicitly abstain if evidence is missing.",
          "Prompting the model to always answer affirmatively.",
          "Doubling the repetition penalty parameter.",
        ],
        correct_index: 1,
        explanation: "Evidence-based retrieval combined with an explicit instruction to decline answering when source documents lack coverage eliminates overconfident fabrications.",
      },
      {
        id: "q2_2",
        question: "Why should chunk sizes be bounded (e.g. 300-800 tokens) in knowledge retrieval?",
        options: [
          "To fit within small vector database limits.",
          "To maintain high semantic density and avoid diluting relevant keywords across vast passages.",
          "Because embedding models reject any input longer than 100 words.",
          "To increase the cost of API calls.",
        ],
        correct_index: 1,
        explanation: "Bounded chunks ensure that cosine similarity searches retrieve high-precision excerpts without drowning relevant facts in surrounding noise.",
      },
    ],
  },
];

export const MOCK_CERTIFICATES: Record<string, Certificate> = {
  cert_ak_001: {
    id: "cert_ak_001",
    course_id: "course_agentic_001",
    course_title: "Agentic AI Engineering & Autonomous Systems Masterclass",
    member_id: "usr_admin_001",
    recipient_name: "Akaash Sharma",
    recipient_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    certificate_number: "CERT-AK-2026-9841",
    issued_at: "2026-10-15T18:30:00Z",
    verification_hash: "8f7b3c2e1d0a5e9f4b6c8d2a",
    grade_percentage: 98,
    instructor_name: "AKSchool Technical Advisory Board",
  },
};

// ============================================================================
// Pillar 4: Real-Time Social & Community Mock Data
// ============================================================================

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv_001",
    participant: MOCK_MEMBERS[1], // Sarah Chen
    last_message: {
      id: "dm_003",
      sender_id: "usr_sarah_002",
      receiver_id: "usr_admin_001",
      content: "Loved your zero-hallucination query router pattern! Are you open to reviewing my RAG benchmark tomorrow?",
      created_at: "2026-10-16T10:45:00Z",
      is_read: false,
    },
    unread_count: 1,
    messages: [
      {
        id: "dm_001",
        sender_id: "usr_sarah_002",
        receiver_id: "usr_admin_001",
        content: "Hey Akaash! Great to connect in the AKSchool community.",
        created_at: "2026-10-16T10:30:00Z",
        is_read: true,
      },
      {
        id: "dm_002",
        sender_id: "usr_admin_001",
        receiver_id: "usr_sarah_002",
        content: "Welcome Sarah! Excited to see your work on LLM evaluation harnesses.",
        created_at: "2026-10-16T10:38:00Z",
        is_read: true,
      },
      {
        id: "dm_003",
        sender_id: "usr_sarah_002",
        receiver_id: "usr_admin_001",
        content: "Loved your zero-hallucination query router pattern! Are you open to reviewing my RAG benchmark tomorrow?",
        created_at: "2026-10-16T10:45:00Z",
        is_read: false,
      },
    ],
  },
  {
    id: "conv_002",
    participant: MOCK_MEMBERS[2], // Marcus Vance
    last_message: {
      id: "dm_005",
      sender_id: "usr_marcus_003",
      receiver_id: "usr_admin_001",
      content: "The multi-stage standalone Docker build finished in 45s on the VPS. Zero memory leaks on Dokploy.",
      created_at: "2026-10-16T09:12:00Z",
      is_read: true,
    },
    unread_count: 0,
    messages: [
      {
        id: "dm_004",
        sender_id: "usr_admin_001",
        receiver_id: "usr_marcus_003",
        content: "Marcus, how did the rolling deployment test go on the production server?",
        created_at: "2026-10-16T08:50:00Z",
        is_read: true,
      },
      {
        id: "dm_005",
        sender_id: "usr_marcus_003",
        receiver_id: "usr_admin_001",
        content: "The multi-stage standalone Docker build finished in 45s on the VPS. Zero memory leaks on Dokploy.",
        created_at: "2026-10-16T09:12:00Z",
        is_read: true,
      },
    ],
  },
  {
    id: "conv_003",
    participant: {
      id: "usr_nova_ai",
      community_id: "comm_akschool_001",
      user_id: "usr_nova_ai",
      email: "nova@akstack.com",
      full_name: "Nova AI (Study Buddy)",
      handle: "nova_ai",
      avatar_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
      role: "admin",
      level: 10,
      points: 9999,
      bio: "24/7 Autonomous Learning Assistant for AKSchool students.",
      plan_tier: "vip",
      created_at: "2026-01-01T00:00:00Z",
    },
    last_message: {
      id: "dm_007",
      sender_id: "usr_nova_ai",
      receiver_id: "usr_admin_001",
      content: "You've completed Module 1 assessments with 98% accuracy! Ready to generate your verified certificate?",
      created_at: "2026-10-16T07:30:00Z",
      is_read: true,
    },
    unread_count: 0,
    messages: [
      {
        id: "dm_006",
        sender_id: "usr_nova_ai",
        receiver_id: "usr_admin_001",
        content: "Hi! I am Nova AI, your dedicated study assistant. I can clarify agent patterns, review SQL schemas, and test your knowledge.",
        created_at: "2026-10-16T07:00:00Z",
        is_read: true,
      },
      {
        id: "dm_007",
        sender_id: "usr_nova_ai",
        receiver_id: "usr_admin_001",
        content: "You've completed Module 1 assessments with 98% accuracy! Ready to generate your verified certificate?",
        created_at: "2026-10-16T07:30:00Z",
        is_read: true,
      },
    ],
  },
];

export const MOCK_EVENTS: CommunityEvent[] = [
  {
    id: "evt_001",
    community_id: "comm_akschool_001",
    title: "Weekly Office Hours & Architecture Teardown with Akaash",
    description: "Bring your active autonomous AI workflows, codebases, and deployment configs. We'll conduct live architectural teardowns, review RAG latency bottlenecks, and debug production setups.",
    starts_at: "2026-10-18T18:00:00Z",
    ends_at: "2026-10-18T19:30:00Z",
    location_type: "google_meet",
    location_url: "https://meet.google.com/aks-arch-live",
    host_member: MOCK_MEMBERS[0],
    attendees_count: 142,
    user_has_rsvped: true,
    category: "office_hours",
  },
  {
    id: "evt_002",
    community_id: "comm_akschool_001",
    title: "Autonomous Agent 48-Hour Hackathon: Production Loops",
    description: "Build and deploy a full-stack autonomous AI microservice with multi-agent orchestration, verifiable tool execution, and zero-hallucination boundaries. Win $2,500 in cloud credits and VIP tier lifetime membership.",
    starts_at: "2026-10-24T12:00:00Z",
    ends_at: "2026-10-26T12:00:00Z",
    location_type: "live_stream",
    location_url: "https://school.akstack.com/live/hackathon-2026",
    host_member: MOCK_MEMBERS[0],
    attendees_count: 286,
    user_has_rsvped: false,
    category: "hackathon",
  },
  {
    id: "evt_003",
    community_id: "comm_akschool_001",
    title: "Deep Dive Workshop: Multi-Tenant Supabase RLS & Dokploy CD",
    description: "Marcus Vance and Sarah Chen walk through step-by-step hard isolation of database tenants, JWT claims enforcement, and zero-downtime rolling container deployments on bare-metal cloud VPS.",
    starts_at: "2026-10-28T17:00:00Z",
    ends_at: "2026-10-28T18:30:00Z",
    location_type: "zoom",
    location_url: "https://zoom.us/j/9841029412",
    host_member: MOCK_MEMBERS[2],
    attendees_count: 98,
    user_has_rsvped: false,
    category: "workshop",
  },
];

