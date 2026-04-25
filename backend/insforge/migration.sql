-- Campus Lost & Found — Insforge DB Migration
-- Run: npx @insforge/cli db import ./backend/insforge/migration.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  full_name   VARCHAR(255) NOT NULL,
  student_id  VARCHAR(50) UNIQUE,
  phone       VARCHAR(20),
  created_at  TIMESTAMP DEFAULT now()
);

-- Lost Reports
CREATE TABLE IF NOT EXISTS lost_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    VARCHAR(255) NOT NULL DEFAULT 'anonymous',
  category      VARCHAR(50)  NOT NULL CHECK (category IN ('id_card','charger','bottle','notebook','headphones','keys','other')),
  description   TEXT         NOT NULL,
  color         VARCHAR(50),
  location_lost VARCHAR(255) NOT NULL,
  time_lost     TIMESTAMP    NOT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','matched','closed')),
  created_at    TIMESTAMP    DEFAULT now()
);

-- Found Reports
CREATE TABLE IF NOT EXISTS found_reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     VARCHAR(255) NOT NULL DEFAULT 'anonymous',
  category       VARCHAR(50)  NOT NULL CHECK (category IN ('id_card','charger','bottle','notebook','headphones','keys','other')),
  description    TEXT         NOT NULL,
  color          VARCHAR(50),
  location_found VARCHAR(255) NOT NULL,
  time_found     TIMESTAMP    NOT NULL,
  finder_contact VARCHAR(255) NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','matched','closed')),
  created_at     TIMESTAMP    DEFAULT now()
);

-- Match Results
CREATE TABLE IF NOT EXISTS match_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_report_id   UUID REFERENCES lost_reports(id) ON DELETE CASCADE,
  found_report_id  UUID REFERENCES found_reports(id) ON DELETE CASCADE,
  confidence_score FLOAT NOT NULL,
  explanation      TEXT  NOT NULL,
  feature_scores   JSONB,
  created_at       TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lost_reports_status    ON lost_reports(status);
CREATE INDEX IF NOT EXISTS idx_lost_reports_category  ON lost_reports(category);
CREATE INDEX IF NOT EXISTS idx_found_reports_status   ON found_reports(status);
CREATE INDEX IF NOT EXISTS idx_found_reports_category ON found_reports(category);
CREATE INDEX IF NOT EXISTS idx_match_results_lost_id  ON match_results(lost_report_id);
