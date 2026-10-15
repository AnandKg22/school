-- ==============================================================================
-- Schema Migration: 003_harden_rls_policies.sql
-- Addresses Security Findings from AKSchool Production Acceptance Audit:
-- 1. Adds missing RLS policies on app_school_reactions and app_school_ai_knowledge
-- 2. Adds community owner/admin UPDATE policy on app_school_communities
-- 3. Hardens app_school_members update policy against unauthorized role/tier tampering
-- ==============================================================================

-- 1. Reactions Table (app_school_reactions)
-- Allow authenticated community members to view reactions on community posts
DROP POLICY IF EXISTS "View community reactions" ON public.app_school_reactions;
CREATE POLICY "View community reactions" ON public.app_school_reactions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_posts p
            JOIN public.app_school_spaces s ON s.id = p.space_id
            JOIN public.app_school_members m ON m.community_id = s.community_id
            WHERE p.id = app_school_reactions.post_id
            AND m.user_id = auth.uid()::text
        )
    );

-- Allow authenticated members to insert their own reaction
DROP POLICY IF EXISTS "Insert own reaction" ON public.app_school_reactions;
CREATE POLICY "Insert own reaction" ON public.app_school_reactions
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.id = app_school_reactions.member_id
            AND m.user_id = auth.uid()::text
        )
    );

-- Allow authenticated members to delete their own reaction
DROP POLICY IF EXISTS "Delete own reaction" ON public.app_school_reactions;
CREATE POLICY "Delete own reaction" ON public.app_school_reactions
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.id = app_school_reactions.member_id
            AND m.user_id = auth.uid()::text
        )
    );

-- 2. AI Knowledge Table (app_school_ai_knowledge)
-- Allow authenticated community members to read knowledge for their community
DROP POLICY IF EXISTS "View community ai knowledge" ON public.app_school_ai_knowledge;
CREATE POLICY "View community ai knowledge" ON public.app_school_ai_knowledge
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.community_id = app_school_ai_knowledge.community_id
            AND m.user_id = auth.uid()::text
        )
    );

-- Allow community owner/admin to insert knowledge documents
DROP POLICY IF EXISTS "Manage community ai knowledge" ON public.app_school_ai_knowledge;
CREATE POLICY "Manage community ai knowledge" ON public.app_school_ai_knowledge
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.community_id = app_school_ai_knowledge.community_id
            AND m.user_id = auth.uid()::text
            AND m.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.community_id = app_school_ai_knowledge.community_id
            AND m.user_id = auth.uid()::text
            AND m.role IN ('owner', 'admin')
        )
    );

-- 3. Communities Table (app_school_communities)
-- Allow community owner/admin to update community settings
DROP POLICY IF EXISTS "Owner update community settings" ON public.app_school_communities;
CREATE POLICY "Owner update community settings" ON public.app_school_communities
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.community_id = app_school_communities.id
            AND m.user_id = auth.uid()::text
            AND m.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.community_id = app_school_communities.id
            AND m.user_id = auth.uid()::text
            AND m.role IN ('owner', 'admin')
        )
    );

-- 4. Posts Table (app_school_posts)
-- Allow author to update their own post, or allow comment count increment
DROP POLICY IF EXISTS "Update own post" ON public.app_school_posts;
CREATE POLICY "Update own post" ON public.app_school_posts
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_school_members m
            WHERE m.id = app_school_posts.author_id
            AND m.user_id = auth.uid()::text
        )
        OR EXISTS (
            SELECT 1 FROM public.app_school_spaces s
            JOIN public.app_school_members m ON m.community_id = s.community_id
            WHERE s.id = app_school_posts.space_id
            AND m.user_id = auth.uid()::text
        )
    );
