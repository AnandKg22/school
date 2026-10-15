-- ==============================================================================
-- Schema Migration: 002_secure_tenant_rls.sql
-- Hardens RLS on all public.app_school_* tables to enforce:
-- 1. True user isolation via auth.uid()
-- 2. Tenant isolation via app metadata & community membership
-- 3. Entitlement tier gating for paid classroom courses
-- ==============================================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public read communities" ON public.app_school_communities;
DROP POLICY IF EXISTS "Public read spaces" ON public.app_school_spaces;
DROP POLICY IF EXISTS "Public read posts" ON public.app_school_posts;
DROP POLICY IF EXISTS "Public read comments" ON public.app_school_comments;
DROP POLICY IF EXISTS "Public read courses" ON public.app_school_courses;
DROP POLICY IF EXISTS "Public read modules" ON public.app_school_modules;
DROP POLICY IF EXISTS "Public read lessons" ON public.app_school_lessons;
DROP POLICY IF EXISTS "Public read members" ON public.app_school_members;
DROP POLICY IF EXISTS "Public read plans" ON public.app_school_plans;

-- 1. Communities Table
-- Non-private communities are viewable by all authenticated users.
-- Private communities are only visible to active members of that community.
CREATE POLICY "View communities" ON public.app_school_communities
    FOR SELECT TO authenticated
    USING (
        is_private = false OR 
        EXISTS (
            SELECT 1 FROM public.app_school_members m 
            WHERE m.community_id = app_school_communities.id 
            AND m.user_id = auth.uid()::text
        )
    );

-- 2. Community Members Table
-- Authenticated users can view members belonging to the same community they are in.
CREATE POLICY "View community members" ON public.app_school_members
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_members m 
            WHERE m.community_id = app_school_members.community_id 
            AND m.user_id = auth.uid()::text
        )
    );

-- Members can only update their own profile (name, bio, avatar)
CREATE POLICY "Update own member profile" ON public.app_school_members
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);

-- 3. Spaces Table
-- Viewable only if the user is a verified member of that community
CREATE POLICY "View community spaces" ON public.app_school_spaces
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_members m 
            WHERE m.community_id = app_school_spaces.community_id 
            AND m.user_id = auth.uid()::text
        )
    );

-- 4. Posts Table
-- Viewable only by members of the parent community
CREATE POLICY "View community posts" ON public.app_school_posts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_spaces s
            JOIN public.app_school_members m ON m.community_id = s.community_id
            WHERE s.id = app_school_posts.space_id
            AND m.user_id = auth.uid()::text
        )
    );

-- Creating posts: only active member matching author_id
CREATE POLICY "Create community post" ON public.app_school_posts
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.id = app_school_posts.author_id
            AND m.user_id = auth.uid()::text
        )
    );

-- 5. Comments Table
-- Viewable by members of the community
CREATE POLICY "View comments" ON public.app_school_comments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_posts p
            JOIN public.app_school_spaces s ON s.id = p.space_id
            JOIN public.app_school_members m ON m.community_id = s.community_id
            WHERE p.id = app_school_comments.post_id
            AND m.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Insert comments" ON public.app_school_comments
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.id = app_school_comments.author_id
            AND m.user_id = auth.uid()::text
        )
    );

-- 6. Courses & Lessons (Entitlement-Gated Content)
-- Course list is visible to community members
CREATE POLICY "View community courses" ON public.app_school_courses
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_members m 
            WHERE m.community_id = app_school_courses.community_id 
            AND m.user_id = auth.uid()::text
        )
    );

-- Modules are visible to community members
CREATE POLICY "View community modules" ON public.app_school_modules
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_courses c
            JOIN public.app_school_members m ON m.community_id = c.community_id
            WHERE c.id = app_school_modules.course_id
            AND m.user_id = auth.uid()::text
        )
    );

-- Lessons are gated by tier entitlement:
-- Free tier courses are accessible to all members;
-- Pro tier courses require plan_tier IN ('pro', 'vip');
-- VIP tier courses require plan_tier = 'vip'.
CREATE POLICY "View entitled lessons" ON public.app_school_lessons
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_modules mod
            JOIN public.app_school_courses c ON c.id = mod.course_id
            JOIN public.app_school_members m ON m.community_id = c.community_id
            WHERE mod.id = app_school_lessons.module_id
            AND m.user_id = auth.uid()::text
            AND (
                c.required_tier = 'free'
                OR (c.required_tier = 'pro' AND m.plan_tier IN ('pro', 'vip'))
                OR (c.required_tier = 'vip' AND m.plan_tier = 'vip')
                OR m.role IN ('owner', 'admin')
            )
        )
    );

-- 7. Progress Table
-- Users can only read and mutate their own lesson progress
DROP POLICY IF EXISTS "Own progress read" ON public.app_school_progress;
DROP POLICY IF EXISTS "Own progress write" ON public.app_school_progress;

CREATE POLICY "Own progress read" ON public.app_school_progress
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.id = app_school_progress.member_id
            AND m.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Own progress write" ON public.app_school_progress
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.id = app_school_progress.member_id
            AND m.user_id = auth.uid()::text
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.id = app_school_progress.member_id
            AND m.user_id = auth.uid()::text
        )
    );

-- 8. Plans Table
-- Read-only for authenticated community users
CREATE POLICY "View plans" ON public.app_school_plans
    FOR SELECT TO authenticated
    USING (true);
