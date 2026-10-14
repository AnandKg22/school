import { Community, Member, Space, Post, Course, MembershipPlan, AIKnowledgeItem } from "./types";

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
