-- ============================================================================
-- AKSchool Migration 005: Social, Community Polls, Direct Messaging & Events
-- Namespace: app_school_*
-- Author: DevMatrix Autonomous Agent System
-- ============================================================================

-- 1. Community Polls Table
CREATE TABLE IF NOT EXISTS app_school_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES app_school_posts(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    total_votes INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_post_poll UNIQUE (post_id)
);

CREATE INDEX IF NOT EXISTS idx_polls_post ON app_school_polls(post_id);

-- 2. Poll Options Table
CREATE TABLE IF NOT EXISTS app_school_poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES app_school_polls(id) ON DELETE CASCADE,
    text VARCHAR(255) NOT NULL,
    votes_count INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON app_school_poll_options(poll_id);

-- 3. Poll Votes Table (Enforces single vote per member per poll)
CREATE TABLE IF NOT EXISTS app_school_poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    poll_id UUID NOT NULL REFERENCES app_school_polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES app_school_poll_options(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_member_poll_vote UNIQUE (poll_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_member ON app_school_poll_votes(poll_id, member_id);

-- 4. 1-on-1 Direct Messages Table
CREATE TABLE IF NOT EXISTS app_school_direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_thread 
    ON app_school_direct_messages(community_id, sender_id, receiver_id, created_at);

-- 5. Community Calendar Events Table
CREATE TABLE IF NOT EXISTS app_school_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    location_type VARCHAR(30) NOT NULL CHECK (location_type IN ('live_stream', 'google_meet', 'zoom', 'in_person')),
    location_url TEXT NOT NULL,
    host_member_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    attendees_count INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(30) NOT NULL CHECK (category IN ('workshop', 'office_hours', 'hackathon', 'guest_speaker')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_community_date ON app_school_events(community_id, starts_at);

-- 6. Event RSVPs Table (Enforces single RSVP per member per event)
CREATE TABLE IF NOT EXISTS app_school_event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES app_school_events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    rsvped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_member_event_rsvp UNIQUE (event_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_member ON app_school_event_rsvps(event_id, member_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE app_school_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_event_rsvps ENABLE ROW LEVEL SECURITY;

-- Polls & Options: Selectable by community members
CREATE POLICY "polls_select_policy" ON app_school_polls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_polls.community_id
              AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "poll_options_select_policy" ON app_school_poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_school_polls p
            JOIN app_school_members m ON m.community_id = p.community_id
            WHERE p.id = app_school_poll_options.poll_id
              AND m.user_id = auth.uid()
        )
    );

-- Poll Votes: Member can view community votes and insert/update their own
CREATE POLICY "poll_votes_select_policy" ON app_school_poll_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_poll_votes.community_id
              AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "poll_votes_insert_policy" ON app_school_poll_votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.id = app_school_poll_votes.member_id
              AND m.user_id = auth.uid()
        )
    );

-- Direct Messages: Only sender or receiver can view or insert
CREATE POLICY "direct_messages_select_policy" ON app_school_direct_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE (m.id = app_school_direct_messages.sender_id OR m.id = app_school_direct_messages.receiver_id)
              AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "direct_messages_insert_policy" ON app_school_direct_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.id = app_school_direct_messages.sender_id
              AND m.user_id = auth.uid()
        )
    );

-- Events & RSVPs: Selectable by community members, creators can manage
CREATE POLICY "events_select_policy" ON app_school_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_events.community_id
              AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "events_admin_policy" ON app_school_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_events.community_id
              AND m.user_id = auth.uid()
              AND m.role IN ('owner', 'admin', 'superadmin')
        )
    );

CREATE POLICY "event_rsvps_select_policy" ON app_school_event_rsvps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_event_rsvps.community_id
              AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "event_rsvps_insert_delete_policy" ON app_school_event_rsvps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.id = app_school_event_rsvps.member_id
              AND m.user_id = auth.uid()
        )
    );
