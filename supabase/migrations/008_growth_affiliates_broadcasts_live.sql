-- ============================================================================
-- AKSchool Migration 008: Growth Suite (Affiliates, Email Broadcasts, Live Rooms)
-- Multi-tenant isolation with strict namespaced app_school_* tables and RLS
-- ============================================================================

-- 1. Affiliates Table
CREATE TABLE IF NOT EXISTS app_school_affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL UNIQUE,
    commission_rate_pct NUMERIC(5,2) DEFAULT 30.00,
    total_clicks INT DEFAULT 0,
    total_referrals INT DEFAULT 0,
    total_revenue_generated NUMERIC(12,2) DEFAULT 0,
    unpaid_commission NUMERIC(12,2) DEFAULT 0,
    paid_commission NUMERIC(12,2) DEFAULT 0,
    payout_email TEXT,
    payout_method TEXT DEFAULT 'paypal' CHECK (payout_method IN ('paypal', 'stripe', 'bank_transfer')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_app_school_affiliate_member UNIQUE (community_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_app_school_aff_code ON app_school_affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_app_school_aff_comm ON app_school_affiliates(community_id);

-- 2. Referral Conversions Table
CREATE TABLE IF NOT EXISTS app_school_referral_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES app_school_affiliates(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES app_school_members(id) ON DELETE SET NULL,
    buyer_name TEXT,
    item_type TEXT NOT NULL CHECK (item_type IN ('membership', 'course')),
    item_title TEXT NOT NULL,
    order_amount NUMERIC(10,2) NOT NULL,
    commission_amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_school_ref_aff ON app_school_referral_conversions(affiliate_id, created_at DESC);

-- 3. Email Broadcasts & Newsletters Table
CREATE TABLE IF NOT EXISTS app_school_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    preview_text TEXT,
    content_html TEXT NOT NULL,
    audience TEXT NOT NULL DEFAULT 'all_members',
    target_course_id UUID REFERENCES app_school_courses(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
    recipient_count INT DEFAULT 0,
    open_rate_pct NUMERIC(5,2),
    click_rate_pct NUMERIC(5,2),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_school_bc_comm ON app_school_broadcasts(community_id, created_at DESC);

-- 4. Live Coaching & Meeting Rooms Table
CREATE TABLE IF NOT EXISTS app_school_live_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    host_id UUID REFERENCES app_school_members(id) ON DELETE SET NULL,
    platform TEXT DEFAULT 'native' CHECK (platform IN ('native', 'zoom', 'google_meet', 'youtube_live')),
    join_url TEXT NOT NULL,
    is_live_now BOOLEAN DEFAULT false,
    scheduled_start TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 60,
    agenda JSONB DEFAULT '[]'::jsonb,
    required_tier TEXT DEFAULT 'free' CHECK (required_tier IN ('free', 'pro', 'vip')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_school_live_comm ON app_school_live_rooms(community_id, is_live_now, scheduled_start);

-- Enable RLS
ALTER TABLE app_school_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_live_rooms ENABLE ROW LEVEL SECURITY;

-- RLS: Affiliates - members view own affiliate partner record
CREATE POLICY "Members can view own affiliate account"
    ON app_school_affiliates
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.id = app_school_affiliates.member_id
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins have full affiliate management"
    ON app_school_affiliates
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_affiliates.community_id
            AND m.user_id = auth.uid()
            AND m.role IN ('superadmin', 'owner', 'admin')
        )
    );

-- RLS: Conversions
CREATE POLICY "Affiliates view their own conversions"
    ON app_school_referral_conversions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app_school_affiliates a
            JOIN app_school_members m ON m.id = a.member_id
            WHERE a.id = app_school_referral_conversions.affiliate_id
            AND m.user_id = auth.uid()
        )
    );

-- RLS: Broadcasts - Admin only
CREATE POLICY "Admins manage broadcasts"
    ON app_school_broadcasts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_broadcasts.community_id
            AND m.user_id = auth.uid()
            AND m.role IN ('superadmin', 'owner', 'admin')
        )
    );

-- RLS: Live Rooms - Read for community members
CREATE POLICY "Community members can view live sessions"
    ON app_school_live_rooms
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_live_rooms.community_id
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins manage live sessions"
    ON app_school_live_rooms
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_live_rooms.community_id
            AND m.user_id = auth.uid()
            AND m.role IN ('superadmin', 'owner', 'admin')
        )
    );
