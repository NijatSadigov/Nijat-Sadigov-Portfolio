-- gen_random_uuid() is core in PG13+, but pgcrypto guarantees availability.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────
-- Admin (single operator, but the table allows more)
-- ─────────────────────────────────────────────
CREATE TABLE admin_users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Profile: a single row of personal info (id is pinned to 1)
-- ─────────────────────────────────────────────
CREATE TABLE profile (
    id         INT PRIMARY KEY DEFAULT 1,
    full_name  TEXT NOT NULL DEFAULT '',
    headline   TEXT NOT NULL DEFAULT '',
    bio        TEXT NOT NULL DEFAULT '',
    photo_url  TEXT NOT NULL DEFAULT '',
    email      TEXT NOT NULL DEFAULT '',
    phone      TEXT NOT NULL DEFAULT '',
    location   TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT profile_singleton CHECK (id = 1)
);

CREATE TABLE social_links (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform   TEXT NOT NULL,           -- github | linkedin | twitter | email | website ...
    label      TEXT NOT NULL DEFAULT '',
    url        TEXT NOT NULL,
    icon       TEXT NOT NULL DEFAULT '',
    sort_order INT  NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
-- Categories / profiles (software, game, research). Seeded below.
-- ─────────────────────────────────────────────
CREATE TABLE categories (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         TEXT NOT NULL UNIQUE,    -- 'software' | 'game' | 'research'
    name         TEXT NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    theme        TEXT NOT NULL DEFAULT 'default',  -- drives frontend look ('default','pixel','research')
    accent_color TEXT NOT NULL DEFAULT '#6366f1',
    sort_order   INT  NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
-- Projects
-- ─────────────────────────────────────────────
CREATE TABLE projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    summary     TEXT NOT NULL DEFAULT '',   -- short blurb for cards
    description TEXT NOT NULL DEFAULT '',    -- markdown for detail page
    repo_url    TEXT NOT NULL DEFAULT '',
    demo_url    TEXT NOT NULL DEFAULT '',
    demo_type   TEXT NOT NULL DEFAULT 'none',   -- none | link | embed | video
    demo_guide  TEXT NOT NULL DEFAULT '',       -- markdown usage guide
    status      TEXT NOT NULL DEFAULT 'draft',  -- draft | published
    featured    BOOLEAN NOT NULL DEFAULT false,
    view_count  INT NOT NULL DEFAULT 0,
    started_on  DATE,
    ended_on    DATE,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_categories (
    project_id  UUID NOT NULL REFERENCES projects(id)   ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

CREATE TABLE project_images (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    caption    TEXT NOT NULL DEFAULT '',
    is_cover   BOOLEAN NOT NULL DEFAULT false,   -- the one shown on the card
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE project_tech (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
-- Skills
-- ─────────────────────────────────────────────
CREATE TABLE skills (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    level      INT NOT NULL DEFAULT 0,   -- 0-100
    icon       TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE skill_categories (
    skill_id    UUID NOT NULL REFERENCES skills(id)     ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, category_id)
);

-- ─────────────────────────────────────────────
-- Certifications
-- ─────────────────────────────────────────────
CREATE TABLE certifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    issuer          TEXT NOT NULL DEFAULT '',
    description     TEXT NOT NULL DEFAULT '',
    credential_url  TEXT NOT NULL DEFAULT '',
    cover_image_url TEXT NOT NULL DEFAULT '',
    issued_on       DATE,
    expires_on      DATE,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE certification_categories (
    certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    category_id      UUID NOT NULL REFERENCES categories(id)     ON DELETE CASCADE,
    PRIMARY KEY (certification_id, category_id)
);

CREATE TABLE certification_images (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    url              TEXT NOT NULL,
    caption          TEXT NOT NULL DEFAULT '',
    is_cover         BOOLEAN NOT NULL DEFAULT false,
    sort_order       INT NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
-- Achievements
-- ─────────────────────────────────────────────
CREATE TABLE achievements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    achieved_on DATE,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE achievement_categories (
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    category_id    UUID NOT NULL REFERENCES categories(id)   ON DELETE CASCADE,
    PRIMARY KEY (achievement_id, category_id)
);

-- ─────────────────────────────────────────────
-- Education & work experience (global — shown on every profile)
-- ─────────────────────────────────────────────
CREATE TABLE education (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution TEXT NOT NULL,
    degree      TEXT NOT NULL DEFAULT '',
    field       TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    location    TEXT NOT NULL DEFAULT '',
    start_date  DATE,
    end_date    DATE,
    is_current  BOOLEAN NOT NULL DEFAULT false,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE work_experience (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company     TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT '',
    location    TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',   -- markdown
    start_date  DATE,
    end_date    DATE,
    is_current  BOOLEAN NOT NULL DEFAULT false,
    sort_order  INT NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
-- Resumes: 0 or 1 per category, plus one "main" shown on the ALL view.
-- category_id NULL = a standalone resume not tied to a profile.
-- ─────────────────────────────────────────────
CREATE TABLE resumes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    label       TEXT NOT NULL DEFAULT '',
    file_url    TEXT NOT NULL,
    is_main     BOOLEAN NOT NULL DEFAULT false,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- at most one resume per category, and at most one main resume overall
CREATE UNIQUE INDEX resumes_one_per_category ON resumes (category_id) WHERE category_id IS NOT NULL;
CREATE UNIQUE INDEX resumes_one_main         ON resumes (is_main)     WHERE is_main = true;

-- ─────────────────────────────────────────────
-- Contact form submissions
-- ─────────────────────────────────────────────
CREATE TABLE contact_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    subject    TEXT NOT NULL DEFAULT '',
    message    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Helpful indexes for the public read paths
-- ─────────────────────────────────────────────
CREATE INDEX projects_status_idx        ON projects (status);
CREATE INDEX projects_sort_idx          ON projects (sort_order, created_at DESC);
CREATE INDEX project_categories_cat_idx ON project_categories (category_id);
CREATE INDEX project_images_proj_idx    ON project_images (project_id);
CREATE INDEX project_tech_proj_idx      ON project_tech (project_id);
