-- ============================================================
-- Initialization Schema
-- ============================================================

-- Users
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username      VARCHAR(100) UNIQUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ─── User Profiles ──────────────────────────────────────────
CREATE TABLE user_profiles (
    id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID  UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    bio          TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Element-collection table for targetRoles
CREATE TABLE user_profile_target_roles (
    user_profile_id UUID         NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role            VARCHAR(200) NOT NULL
);

-- ─── Integration Statuses ───────────────────────────────────
CREATE TABLE integration_statuses (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform          VARCHAR(50) NOT NULL,
    platform_username VARCHAR(100),
    status            VARCHAR(50) NOT NULL DEFAULT 'NEVER_SYNCED',
    last_synced       TIMESTAMPTZ,
    UNIQUE (user_id, platform)
);

CREATE INDEX idx_integration_statuses_user_id ON integration_statuses(user_id);

-- ─── Projects ───────────────────────────────────────────────
CREATE TABLE projects (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    link        VARCHAR(500),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Element-collection table for techStack
CREATE TABLE project_tech_stack (
    project_id UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    technology VARCHAR(100) NOT NULL
);

-- ─── Notifications ──────────────────────────────────────────
CREATE TABLE notifications (
    id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message    TEXT    NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ─── Gamification Profiles ──────────────────────────────────
CREATE TABLE gamification_profiles (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_xp      INTEGER      NOT NULL DEFAULT 0,
    current_level VARCHAR(100) NOT NULL DEFAULT 'Code Newbie',
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gamification_xp ON gamification_profiles(total_xp DESC);

-- ─── Cached Activity Data ────────────────────────────────────
-- Populated by async sync jobs (LeetCode, Codeforces, GitHub scrapers)
CREATE TABLE cached_activity_data (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    global_stats_json  TEXT,
    github_stats_json  TEXT,
    contest_stats_json TEXT,
    topics_json        TEXT,
    heatmap_json       TEXT,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
