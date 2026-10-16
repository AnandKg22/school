-- ============================================================================
-- AKSchool Migration 006: Multi-Gateway Monetization & Course-Specific Pricing
-- Supports Stripe & PayPal Dual Gateways, Custom Course Pricing & Entitlements
-- ============================================================================

-- 1. Payment Gateways Table (SuperAdmin Config)
CREATE TABLE IF NOT EXISTS app_school_payment_gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    active_gateways VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (active_gateways IN ('stripe', 'paypal', 'both')),
    stripe_enabled BOOLEAN NOT NULL DEFAULT true,
    stripe_publishable_key TEXT,
    stripe_secret_key TEXT,
    stripe_webhook_secret TEXT,
    stripe_live_mode BOOLEAN NOT NULL DEFAULT false,
    paypal_enabled BOOLEAN NOT NULL DEFAULT true,
    paypal_client_id TEXT,
    paypal_secret TEXT,
    paypal_webhook_id TEXT,
    paypal_sandbox_mode BOOLEAN NOT NULL DEFAULT true,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_school_gateway_community UNIQUE (community_id)
);

CREATE INDEX IF NOT EXISTS idx_school_gateways_community ON app_school_payment_gateways(community_id);

-- 2. Custom Course Pricing (One-time, Monthly, Yearly, Hybrid)
CREATE TABLE IF NOT EXISTS app_school_course_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES app_school_courses(id) ON DELETE CASCADE,
    pricing_type VARCHAR(30) NOT NULL DEFAULT 'tier_only' CHECK (pricing_type IN ('tier_only', 'one_time', 'subscription', 'hybrid')),
    one_time_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    yearly_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    required_tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (required_tier IN ('free', 'pro', 'vip')),
    allow_standalone_purchase BOOLEAN NOT NULL DEFAULT false,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_school_course_pricing UNIQUE (course_id)
);

CREATE INDEX IF NOT EXISTS idx_school_course_pricing_course ON app_school_course_pricing(course_id);

-- 3. Community Subscriptions (Recurring Pro / VIP memberships)
CREATE TABLE IF NOT EXISTS app_school_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    plan_tier VARCHAR(20) NOT NULL CHECK (plan_tier IN ('free', 'pro', 'vip')),
    billing_interval VARCHAR(20) NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year', 'one_time')),
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'paypal')),
    provider_subscription_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_subs_member ON app_school_subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_school_subs_community ON app_school_subscriptions(community_id);
CREATE INDEX IF NOT EXISTS idx_school_subs_status ON app_school_subscriptions(status);

-- 4. Course Purchases (Standalone licenses or course subscriptions)
CREATE TABLE IF NOT EXISTS app_school_course_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES app_school_courses(id) ON DELETE CASCADE,
    purchase_type VARCHAR(20) NOT NULL DEFAULT 'one_time' CHECK (purchase_type IN ('one_time', 'monthly', 'yearly')),
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'paypal')),
    provider_payment_id TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_course_purchases_member ON app_school_course_purchases(member_id);
CREATE INDEX IF NOT EXISTS idx_school_course_purchases_course ON app_school_course_purchases(course_id);

-- 5. Invoices & Receipts Ledger
CREATE TABLE IF NOT EXISTS app_school_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    subscription_id UUID REFERENCES app_school_subscriptions(id) ON DELETE SET NULL,
    course_id UUID REFERENCES app_school_courses(id) ON DELETE SET NULL,
    item_description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'open', 'void')),
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'paypal')),
    receipt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_invoices_member ON app_school_invoices(member_id);
CREATE INDEX IF NOT EXISTS idx_school_invoices_community ON app_school_invoices(community_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE app_school_payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_course_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_invoices ENABLE ROW LEVEL SECURITY;

-- Gateway Config: Only Admin / Owner can view or update
CREATE POLICY p_school_gateways_admin ON app_school_payment_gateways
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members
            WHERE app_school_members.community_id = app_school_payment_gateways.community_id
            AND app_school_members.user_id = auth.uid()
            AND app_school_members.role IN ('owner', 'superadmin', 'admin')
        )
    );

-- Course Pricing: Public read, Admin write
CREATE POLICY p_school_pricing_read ON app_school_course_pricing
    FOR SELECT USING (true);

CREATE POLICY p_school_pricing_admin ON app_school_course_pricing
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM app_school_courses c
            JOIN app_school_members m ON m.community_id = c.community_id
            WHERE c.id = app_school_course_pricing.course_id
            AND m.user_id = auth.uid()
            AND m.role IN ('owner', 'superadmin', 'admin')
        )
    );

-- Subscriptions: Member reads their own, Admin reads community
CREATE POLICY p_school_subs_member ON app_school_subscriptions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members
            WHERE app_school_members.id = app_school_subscriptions.member_id
            AND app_school_members.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM app_school_members
            WHERE app_school_members.community_id = app_school_subscriptions.community_id
            AND app_school_members.user_id = auth.uid()
            AND app_school_members.role IN ('owner', 'superadmin', 'admin')
        )
    );

-- Course Purchases: Member reads own, Admin reads community
CREATE POLICY p_school_purchases_member ON app_school_course_purchases
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members
            WHERE app_school_members.id = app_school_course_purchases.member_id
            AND app_school_members.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM app_school_members
            WHERE app_school_members.community_id = app_school_course_purchases.community_id
            AND app_school_members.user_id = auth.uid()
            AND app_school_members.role IN ('owner', 'superadmin', 'admin')
        )
    );

-- Invoices: Member reads own, Admin reads community
CREATE POLICY p_school_invoices_member ON app_school_invoices
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM app_school_members
            WHERE app_school_members.id = app_school_invoices.member_id
            AND app_school_members.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM app_school_members
            WHERE app_school_members.community_id = app_school_invoices.community_id
            AND app_school_members.user_id = auth.uid()
            AND app_school_members.role IN ('owner', 'superadmin', 'admin')
        )
    );
