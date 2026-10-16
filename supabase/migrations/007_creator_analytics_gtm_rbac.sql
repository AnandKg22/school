-- ============================================================================
-- AKSchool Migration 007: Creator Analytics, GTM Event Stream & Manager RBAC
-- Multi-tenant isolation with strict namespaced app_school_* tables and RLS
-- ============================================================================

-- 1. GTM Interaction Events & Customer Journey Logs
CREATE TABLE IF NOT EXISTS app_school_gtm_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    member_id UUID REFERENCES app_school_members(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    lifecycle_stage TEXT NOT NULL DEFAULT 'visitor',
    target_id TEXT,
    target_name TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    referrer TEXT,
    device TEXT,
    country TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_school_gtm_comm_event 
    ON app_school_gtm_events(community_id, event_type);

CREATE INDEX IF NOT EXISTS idx_app_school_gtm_comm_created 
    ON app_school_gtm_events(community_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_app_school_gtm_stage 
    ON app_school_gtm_events(community_id, lifecycle_stage);

-- 2. Manager RBAC & Delegated View Permissions
CREATE TABLE IF NOT EXISTS app_school_manager_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    role_title TEXT NOT NULL,
    custom_title TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    can_view_revenue BOOLEAN NOT NULL DEFAULT false,
    can_view_gtm_logs BOOLEAN NOT NULL DEFAULT false,
    can_view_lms_analytics BOOLEAN NOT NULL DEFAULT true,
    can_view_community_metrics BOOLEAN NOT NULL DEFAULT true,
    can_export_reports BOOLEAN NOT NULL DEFAULT false,
    can_manage_curriculum BOOLEAN NOT NULL DEFAULT false,
    can_moderate_content BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_app_school_manager_comm_member UNIQUE (community_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_app_school_mgr_comm 
    ON app_school_manager_permissions(community_id, status);

-- 3. Daily Analytics Aggregates (Rollups for fast performance)
CREATE TABLE IF NOT EXISTS app_school_analytics_daily_aggregates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    mrr NUMERIC(12,2) DEFAULT 0,
    net_revenue NUMERIC(12,2) DEFAULT 0,
    dau INT DEFAULT 0,
    active_subscribers INT DEFAULT 0,
    course_completions INT DEFAULT 0,
    posts_created INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_app_school_daily_agg UNIQUE (community_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_app_school_agg_comm_date 
    ON app_school_analytics_daily_aggregates(community_id, metric_date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE app_school_gtm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_manager_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_analytics_daily_aggregates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: GTM Events
-- Members can log their own client interactions
CREATE POLICY "Members can insert their own GTM interactions"
    ON app_school_gtm_events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_school_members
            WHERE app_school_members.id = app_school_gtm_events.member_id
            AND app_school_members.user_id = auth.uid()
        ) OR member_id IS NULL
    );

-- SuperAdmins and Authorized Managers can read GTM logs
CREATE POLICY "Admins and Managers can read GTM interactions"
    ON app_school_gtm_events
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_gtm_events.community_id
            AND m.user_id = auth.uid()
            AND (
                m.role IN ('superadmin', 'owner', 'admin')
                OR EXISTS (
                    SELECT 1 FROM app_school_manager_permissions mgr
                    WHERE mgr.community_id = app_school_gtm_events.community_id
                    AND mgr.member_id = m.id
                    AND mgr.status = 'active'
                    AND mgr.can_view_gtm_logs = true
                )
            )
        )
    );

-- RLS Policies: Manager Permissions
CREATE POLICY "SuperAdmins and Owners manage manager permissions"
    ON app_school_manager_permissions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_manager_permissions.community_id
            AND m.user_id = auth.uid()
            AND m.role IN ('superadmin', 'owner')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_manager_permissions.community_id
            AND m.user_id = auth.uid()
            AND m.role IN ('superadmin', 'owner')
        )
    );

CREATE POLICY "Managers can read their own permissions"
    ON app_school_manager_permissions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.id = app_school_manager_permissions.member_id
            AND m.user_id = auth.uid()
        )
    );

-- RLS Policies: Daily Aggregates
CREATE POLICY "Admins and authorized managers can view analytics aggregates"
    ON app_school_analytics_daily_aggregates
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_analytics_daily_aggregates.community_id
            AND m.user_id = auth.uid()
            AND (
                m.role IN ('superadmin', 'owner', 'admin')
                OR EXISTS (
                    SELECT 1 FROM app_school_manager_permissions mgr
                    WHERE mgr.community_id = app_school_analytics_daily_aggregates.community_id
                    AND mgr.member_id = m.id
                    AND mgr.status = 'active'
                    AND (mgr.can_view_revenue = true OR mgr.can_view_community_metrics = true)
                )
            )
        )
    );
