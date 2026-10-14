-- ==============================================================================
-- Schema Migration: AKStack CommunityOS (School)
-- Namespaced Isolation Prefix: app_school_*
-- Strict RLS & Multi-Tenancy Architecture
-- ==============================================================================

-- 1. Communities (Tenants)
CREATE TABLE IF NOT EXISTS public.app_school_communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT,
    logo_url TEXT,
    cover_url TEXT,
    rules TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Community Members & Roles
CREATE TABLE IF NOT EXISTS public.app_school_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.app_school_communities(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    handle TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    level INT NOT NULL DEFAULT 1,
    points INT NOT NULL DEFAULT 0,
    bio TEXT,
    plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'vip')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (community_id, user_id)
);

-- 3. Discussion Spaces / Categories
CREATE TABLE IF NOT EXISTS public.app_school_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.app_school_communities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'MessageSquare',
    is_private BOOLEAN DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (community_id, slug)
);

-- 4. Posts
CREATE TABLE IF NOT EXISTS public.app_school_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID NOT NULL REFERENCES public.app_school_spaces(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.app_school_members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Comments
CREATE TABLE IF NOT EXISTS public.app_school_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.app_school_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.app_school_members(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Reactions (Likes & Emojis)
CREATE TABLE IF NOT EXISTS public.app_school_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.app_school_posts(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.app_school_members(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL DEFAULT '🔥',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (post_id, member_id, emoji)
);

-- 7. Courses (Classroom)
CREATE TABLE IF NOT EXISTS public.app_school_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.app_school_communities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    required_tier TEXT NOT NULL DEFAULT 'free' CHECK (required_tier IN ('free', 'pro', 'vip')),
    total_lessons INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (community_id, slug)
);

-- 8. Course Modules
CREATE TABLE IF NOT EXISTS public.app_school_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.app_school_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Course Lessons
CREATE TABLE IF NOT EXISTS public.app_school_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.app_school_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    duration_minutes INT NOT NULL DEFAULT 10,
    is_free_preview BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Student Progress Tracking
CREATE TABLE IF NOT EXISTS public.app_school_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.app_school_members(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.app_school_lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.app_school_courses(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (member_id, lesson_id)
);

-- 11. Membership Plans
CREATE TABLE IF NOT EXISTS public.app_school_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.app_school_communities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly INT NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. AI Knowledge Ingestion Store
CREATE TABLE IF NOT EXISTS public.app_school_ai_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.app_school_communities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('post', 'lesson', 'guideline', 'faq')),
    source_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_school_members_comm ON public.app_school_members(community_id);
CREATE INDEX IF NOT EXISTS idx_school_spaces_comm ON public.app_school_spaces(community_id);
CREATE INDEX IF NOT EXISTS idx_school_posts_space ON public.app_school_posts(space_id);
CREATE INDEX IF NOT EXISTS idx_school_comments_post ON public.app_school_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_school_courses_comm ON public.app_school_courses(community_id);
CREATE INDEX IF NOT EXISTS idx_school_lessons_mod ON public.app_school_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_school_progress_member ON public.app_school_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_school_ai_knowledge_comm ON public.app_school_ai_knowledge(community_id);

-- Enable RLS
ALTER TABLE public.app_school_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_school_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_school_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_school_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_school_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_school_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_school_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_school_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_school_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_school_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_school_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_school_ai_knowledge ENABLE ROW LEVEL SECURITY;

-- Transparent Public/Member Read Policies
DROP POLICY IF EXISTS "Public read communities" ON public.app_school_communities;
CREATE POLICY "Public read communities" ON public.app_school_communities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read spaces" ON public.app_school_spaces;
CREATE POLICY "Public read spaces" ON public.app_school_spaces FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read posts" ON public.app_school_posts;
CREATE POLICY "Public read posts" ON public.app_school_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read comments" ON public.app_school_comments;
CREATE POLICY "Public read comments" ON public.app_school_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read courses" ON public.app_school_courses;
CREATE POLICY "Public read courses" ON public.app_school_courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read modules" ON public.app_school_modules;
CREATE POLICY "Public read modules" ON public.app_school_modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read lessons" ON public.app_school_lessons;
CREATE POLICY "Public read lessons" ON public.app_school_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read members" ON public.app_school_members;
CREATE POLICY "Public read members" ON public.app_school_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read plans" ON public.app_school_plans;
CREATE POLICY "Public read plans" ON public.app_school_plans FOR SELECT USING (true);

-- Seed Initial Community, Spaces, Courses & Demo Users
DO $$
DECLARE
    comm_id UUID;
    owner_id UUID;
    member1_id UUID;
    member2_id UUID;
    member3_id UUID;
    member4_id UUID;
    space_gen UUID;
    space_qa UUID;
    space_showcase UUID;
    space_resources UUID;
    course1_id UUID;
    course2_id UUID;
    mod1_id UUID;
    mod2_id UUID;
    mod3_id UUID;
BEGIN
    -- Check if community already exists
    SELECT id INTO comm_id FROM public.app_school_communities WHERE slug = 'akstack-builders' LIMIT 1;
    
    IF comm_id IS NULL THEN
        INSERT INTO public.app_school_communities (name, slug, tagline, description, rules)
        VALUES (
            'AKStack AI Builders Club',
            'akstack-builders',
            'The premier community for autonomous agent engineers, AI founders, and full-stack builders.',
            'Connect with 1,200+ elite engineers and creators building agentic AI, modern web apps, and autonomous platform architectures.',
            '1. Be helpful and share real code. 2. No ungrounded hype. 3. Zero spam. 4. Respect fellow builders.'
        ) RETURNING id INTO comm_id;

        -- 5 Demo Accounts + Super Admin
        INSERT INTO public.app_school_members (community_id, user_id, email, full_name, handle, role, level, points, bio, plan_tier, avatar_url)
        VALUES 
        (comm_id, 'usr_admin_001', 'admin@akstack.com', 'Akaash Sharma (Super Admin)', 'akaash', 'owner', 9, 3450, 'Founder & Platform Architect @ AKStack. Building autonomous agent systems.', 'vip', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')
        RETURNING id INTO owner_id;

        INSERT INTO public.app_school_members (community_id, user_id, email, full_name, handle, role, level, points, bio, plan_tier, avatar_url)
        VALUES 
        (comm_id, 'usr_sarah_002', 'sarah.chen@aiengineer.io', 'Sarah Chen', 'sarahc', 'admin', 7, 2180, 'Staff AI Engineer. LLM fine-tuning, RAG evaluation, and prompt architecture.', 'pro', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80')
        RETURNING id INTO member1_id;

        INSERT INTO public.app_school_members (community_id, user_id, email, full_name, handle, role, level, points, bio, plan_tier, avatar_url)
        VALUES 
        (comm_id, 'usr_marcus_003', 'marcus.v@devopslead.com', 'Marcus Vance', 'marcusv', 'moderator', 5, 1420, 'Platform & Infrastructure Lead. Dokploy, Kubernetes, and self-hosted Supabase fanatic.', 'pro', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80')
        RETURNING id INTO member2_id;

        INSERT INTO public.app_school_members (community_id, user_id, email, full_name, handle, role, level, points, bio, plan_tier, avatar_url)
        VALUES 
        (comm_id, 'usr_priya_004', 'priya.nair@buildwithai.com', 'Priya Nair', 'priyanair', 'member', 4, 980, 'Full-Stack Developer learning Autonomous Agent Systems. Next.js 15 enthusiast.', 'free', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80')
        RETURNING id INTO member3_id;

        INSERT INTO public.app_school_members (community_id, user_id, email, full_name, handle, role, level, points, bio, plan_tier, avatar_url)
        VALUES 
        (comm_id, 'usr_david_005', 'david.ross@saasgrowth.co', 'David Ross', 'davidross', 'member', 3, 620, 'Product Lead turning manual workflows into automated AI micro-SaaS apps.', 'free', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80')
        RETURNING id INTO member4_id;

        -- Create Spaces
        INSERT INTO public.app_school_spaces (community_id, name, slug, description, icon, sort_order)
        VALUES (comm_id, '🚀 Announcements', 'announcements', 'Official platform news, product releases, and masterclass updates', 'Megaphone', 1)
        RETURNING id INTO space_gen;

        INSERT INTO public.app_school_spaces (community_id, name, slug, description, icon, sort_order)
        VALUES (comm_id, '💡 General Discussion', 'general', 'Share ideas, ask questions, and chat about agentic engineering', 'MessageSquare', 2)
        RETURNING id INTO space_qa;

        INSERT INTO public.app_school_spaces (community_id, name, slug, description, icon, sort_order)
        VALUES (comm_id, '🏆 Project Showcase', 'showcase', 'Show what you built, launch demos, and get peer feedback', 'Award', 3)
        RETURNING id INTO space_showcase;

        INSERT INTO public.app_school_spaces (community_id, name, slug, description, icon, sort_order)
        VALUES (comm_id, '📚 Cheat Sheets & Prompts', 'resources', 'Production prompt architectures, Dockerfiles, and API blueprints', 'Bookmark', 4)
        RETURNING id INTO space_resources;

        -- Create Posts
        INSERT INTO public.app_school_posts (space_id, author_id, title, content, is_pinned, likes_count, comments_count)
        VALUES (
            space_gen,
            owner_id,
            'Welcome to AKStack CommunityOS! The Future of AI Learning and Collaborative Building',
            'Hey everyone! Welcome to the official AKStack CommunityOS platform.\n\nHere we combine Skool-style community discussions, hands-on masterclass courses, and built-in AI Knowledge Assistance powered by Xiaomi MiMo AI.\n\nTake a moment to introduce yourself in General Discussion and check out the Classroom courses!',
            true,
            48,
            12
        );

        INSERT INTO public.app_school_posts (space_id, author_id, title, content, is_pinned, likes_count, comments_count)
        VALUES (
            space_showcase,
            member1_id,
            'Built an Autonomous Data Profiler in Next.js 15 using Dokploy & Supabase RLS',
            'Just shipped a full-featured deterministic statistical engine + multi-provider AI query router with zero hallucinations.\n\nKey takeaway: injecting calculated mathematical bounds into the LLM system prompt prevents any numbers from drifting. Thoughts on this architecture?',
            false,
            32,
            8
        );

        INSERT INTO public.app_school_posts (space_id, author_id, title, content, is_pinned, likes_count, comments_count)
        VALUES (
            space_resources,
            member2_id,
            'Production Dokploy Traefik Reverse-Proxy Blueprint for Next.js Apps',
            'Here is the exact configuration for zero-downtime rolling deploys with Let''s Encrypt wildcard certificates and container health checks on port 3000.',
            false,
            24,
            5
        );

        -- Create Courses (Classroom)
        INSERT INTO public.app_school_courses (community_id, title, slug, description, cover_url, is_locked, required_tier, total_lessons, sort_order)
        VALUES (
            comm_id,
            'Agentic AI Engineering Masterclass: From Zero to Production',
            'agentic-ai-masterclass',
            'Master autonomous agents, tool calling, memory persistence, multi-modal reasoning, and self-hosted Supabase RLS architectures.',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
            false,
            'free',
            6,
            1
        ) RETURNING id INTO course1_id;

        INSERT INTO public.app_school_courses (community_id, title, slug, description, cover_url, is_locked, required_tier, total_lessons, sort_order)
        VALUES (
            comm_id,
            'Full-Stack SaaS Platform Engineering with Dokploy & Supabase',
            'saas-platform-engineering',
            'Deploy scalable multi-tenant SaaS products with automated GitHub actions, Dokploy VPS orchestration, and isolated PostgreSQL namespaces.',
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
            true,
            'pro',
            8,
            2
        ) RETURNING id INTO course2_id;

        -- Create Modules for Course 1
        INSERT INTO public.app_school_modules (course_id, title, sort_order)
        VALUES (course1_id, 'Module 1: Foundations of Autonomous Agents', 1)
        RETURNING id INTO mod1_id;

        INSERT INTO public.app_school_modules (course_id, title, sort_order)
        VALUES (course1_id, 'Module 2: Tool Calling & Memory Persistence', 2)
        RETURNING id INTO mod2_id;

        -- Create Lessons for Course 1
        INSERT INTO public.app_school_lessons (module_id, title, slug, content, video_url, duration_minutes, is_free_preview, sort_order)
        VALUES (
            mod1_id,
            'Lesson 1.1: Architecture of Agentic Loops (Sense, Plan, Act, Observe)',
            'architecture-agentic-loops',
            'In this lesson we break down how autonomous agents execute deterministic reasoning, handle tool failures, and maintain session continuity across compaction cycles.\n\nKey Concepts:\n- Reactive vs Polling Wakeup\n- Context window compaction and memory replay\n- Zero-hallucination evidence drawers',
            'https://www.youtube.com/embed/dQw4w9WgXcQ',
            14,
            true,
            1
        );

        INSERT INTO public.app_school_lessons (module_id, title, slug, content, video_url, duration_minutes, is_free_preview, sort_order)
        VALUES (
            mod1_id,
            'Lesson 1.2: Xiaomi MiMo AI V2.6 Integration & Reasoning Token Pipelines',
            'mimo-ai-integration',
            'Deep dive into connecting Xiaomi MiMo AI models (mimo-v2.6-flash, mimo-v2.6-pro) via regional Token Plan gateways (Singapore cluster: token-plan-sgp.xiaomimimo.com) with 1M context capabilities.',
            'https://www.youtube.com/embed/dQw4w9WgXcQ',
            18,
            true,
            2
        );

        INSERT INTO public.app_school_lessons (module_id, title, slug, content, video_url, duration_minutes, is_free_preview, sort_order)
        VALUES (
            mod2_id,
            'Lesson 2.1: Multi-Tenant RLS Policies in PostgreSQL and Supabase',
            'multi-tenant-rls-postgresql',
            'Learn how to isolate tenant data with zero collision risk using app-scoped namespaces and row-level security tokens.',
            'https://www.youtube.com/embed/dQw4w9WgXcQ',
            22,
            false,
            1
        );

        -- Create Membership Plans
        INSERT INTO public.app_school_plans (community_id, name, description, price_monthly, currency, features)
        VALUES 
        (comm_id, 'Free Community Member', 'Access to public discussion spaces, introductory course module, and community knowledge search.', 0, 'INR', '["Access to Announcements and General spaces", "Agentic AI Foundations Course", "Community directory profile", "Ask AI Copilot (10 questions/day)"]'::jsonb),
        (comm_id, 'Pro Creator & Builder', 'Full access to all masterclasses, private coding spaces, live office hours, and unlimited AI assistant queries.', 999, 'INR', '["All Free features included", "Full SaaS Platform Engineering Course", "Private Discord/VIP channel access", "Unlimited Xiaomi MiMo AI queries", "Monthly live code review sessions"]'::jsonb);

        -- Ingest Initial AI Knowledge Sources
        INSERT INTO public.app_school_ai_knowledge (community_id, title, content, source_type)
        VALUES 
        (comm_id, 'Community Guidelines & Conduct', 'AKStack CommunityOS rules: 1. Be helpful and share real code. 2. No ungrounded hype. 3. Zero spam. 4. Respect fellow builders. Questions should include reproducible examples.', 'guideline'),
        (comm_id, 'Agentic AI Masterclass Syllabus', 'The Agentic AI Engineering Masterclass covers 4 core pillars: Sense, Plan, Act, and Observe. It integrates Xiaomi MiMo AI V2.6 with Singapore Token Plan endpoints for fast high-context inference.', 'lesson'),
        (comm_id, 'Dokploy & Supabase Architecture', 'AKStack uses Dokploy VPS on 185.205.244.119 with self-hosted PostgreSQL. Each application is strictly isolated using prefix-based namespacing (app_school_*) and Row-Level Security.', 'faq');

    END IF;
END $$;
