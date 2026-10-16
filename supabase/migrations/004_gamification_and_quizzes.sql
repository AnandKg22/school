-- ============================================================================
-- AKSchool Migration 004: Gamification, Streaks, Leaderboard, Quizzes & Certificates
-- Namespace: app_school_*
-- Author: DevMatrix Autonomous Agent System
-- ============================================================================

-- 1. Daily Learning Streaks Table
CREATE TABLE IF NOT EXISTS app_school_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    current_streak_days INTEGER NOT NULL DEFAULT 1,
    longest_streak_days INTEGER NOT NULL DEFAULT 1,
    last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    fire_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_member_streak UNIQUE (community_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_streaks_community_member ON app_school_streaks(community_id, member_id);

-- 2. Badges Catalog
CREATE TABLE IF NOT EXISTS app_school_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    icon_name VARCHAR(60) NOT NULL,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond')),
    requirement_type VARCHAR(30) NOT NULL CHECK (requirement_type IN ('points', 'streak', 'course', 'quiz', 'posts')),
    requirement_val INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_community ON app_school_badges(community_id);

-- 3. Member Unlocked Badges (Junction)
CREATE TABLE IF NOT EXISTS app_school_member_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES app_school_badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_member_badge UNIQUE (community_id, member_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_member_badges_member ON app_school_member_badges(member_id);

-- 4. Quizzes Table
CREATE TABLE IF NOT EXISTS app_school_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES app_school_courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES app_school_modules(id) ON DELETE SET NULL,
    lesson_id UUID REFERENCES app_school_lessons(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    passing_percentage INTEGER NOT NULL DEFAULT 80 CHECK (passing_percentage BETWEEN 1 AND 100),
    points_reward INTEGER NOT NULL DEFAULT 150,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_course ON app_school_quizzes(course_id);

-- 5. Quiz Questions
CREATE TABLE IF NOT EXISTS app_school_quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES app_school_quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of string options
    correct_index INTEGER NOT NULL CHECK (correct_index >= 0),
    explanation TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON app_school_quiz_questions(quiz_id, sort_order);

-- 6. Quiz Submissions Table
CREATE TABLE IF NOT EXISTS app_school_quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES app_school_quizzes(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_answers JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_quiz_member ON app_school_quiz_submissions(quiz_id, member_id);

-- 7. Course Certificates Table
CREATE TABLE IF NOT EXISTS app_school_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app_school_communities(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES app_school_courses(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES app_school_members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(80) NOT NULL UNIQUE,
    verification_hash VARCHAR(64) NOT NULL UNIQUE,
    grade_percentage INTEGER NOT NULL CHECK (grade_percentage BETWEEN 0 AND 100),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    instructor_name VARCHAR(120) NOT NULL DEFAULT 'AKSchool Advisory Board',
    CONSTRAINT uq_member_course_cert UNIQUE (community_id, course_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_verification ON app_school_certificates(verification_hash);
CREATE INDEX IF NOT EXISTS idx_certificates_member ON app_school_certificates(member_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE app_school_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_member_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_school_certificates ENABLE ROW LEVEL SECURITY;

-- Streaks: Anyone in community can view streaks for leaderboard, member can update own
CREATE POLICY "streaks_select_policy" ON app_school_streaks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_streaks.community_id
              AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "streaks_insert_update_policy" ON app_school_streaks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.id = app_school_streaks.member_id
              AND m.user_id = auth.uid()
        )
    );

-- Badges: Read-only for community members, admin can manage
CREATE POLICY "badges_select_policy" ON app_school_badges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_badges.community_id
              AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "badges_admin_policy" ON app_school_badges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_badges.community_id
              AND m.user_id = auth.uid()
              AND m.role IN ('owner', 'admin', 'superadmin')
        )
    );

-- Member Badges: Viewable by community
CREATE POLICY "member_badges_select_policy" ON app_school_member_badges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_member_badges.community_id
              AND m.user_id = auth.uid()
        )
    );

-- Quizzes: Viewable by enrolled members
CREATE POLICY "quizzes_select_policy" ON app_school_quizzes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_quizzes.community_id
              AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "quizzes_admin_policy" ON app_school_quizzes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_quizzes.community_id
              AND m.user_id = auth.uid()
              AND m.role IN ('owner', 'admin', 'superadmin')
        )
    );

-- Quiz Questions: Viewable by community
CREATE POLICY "quiz_questions_select_policy" ON app_school_quiz_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_school_quizzes q
            JOIN app_school_members m ON m.community_id = q.community_id
            WHERE q.id = app_school_quiz_questions.quiz_id
              AND m.user_id = auth.uid()
        )
    );

-- Quiz Submissions: Member can view/insert their own submissions
CREATE POLICY "quiz_submissions_select_policy" ON app_school_quiz_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.id = app_school_quiz_submissions.member_id
              AND m.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.community_id = app_school_quiz_submissions.community_id
              AND m.user_id = auth.uid()
              AND m.role IN ('owner', 'admin', 'superadmin')
        )
    );

CREATE POLICY "quiz_submissions_insert_policy" ON app_school_quiz_submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_school_members m
            WHERE m.id = app_school_quiz_submissions.member_id
              AND m.user_id = auth.uid()
        )
    );

-- Certificates: Publicly viewable for tamper-proof verification
CREATE POLICY "certificates_public_select_policy" ON app_school_certificates
    FOR SELECT USING (TRUE);
