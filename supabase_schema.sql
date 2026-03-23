-- ═══════════════════════════════════════════════════════
-- 🧠 Eldad Brain — Supabase Database Schema
-- Run this in your Supabase SQL Editor to create all tables
-- ═══════════════════════════════════════════════════════

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  category TEXT NOT NULL DEFAULT '',
  notes TEXT,
  source_protocol TEXT,
  action_link TEXT,
  assignee TEXT,
  sub_tasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  participants JSONB DEFAULT '[]'::jsonb,
  topics JSONB DEFAULT '[]'::jsonb,
  color TEXT DEFAULT '#f59e0b',
  completed BOOLEAN DEFAULT false,
  prep_stages JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily Notes table
CREATE TABLE IF NOT EXISTS daily_notes (
  date DATE PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge Log table
CREATE TABLE IF NOT EXISTS knowledge_log (
  id TEXT PRIMARY KEY,
  summary TEXT NOT NULL,
  source TEXT NOT NULL,
  layer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents (Incoming) table
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  source TEXT NOT NULL,
  linked_to TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'classified', 'processed')),
  has_vat BOOLEAN,
  amount NUMERIC,
  intake_date TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Indexes ═══
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_layer ON knowledge_log(layer);

-- ═══ Auto-update updated_at ═══
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER daily_notes_updated_at
  BEFORE UPDATE ON daily_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════
-- 🧠 Knowledge Embeddings (RAG — Step 2)
-- ═══════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_embeddings (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  source_file TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding VECTOR(768),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_vector
  ON knowledge_embeddings USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_source
  ON knowledge_embeddings(source_file);

-- ═══════════════════════════════════════════════════════
-- 🚀 Missions (Agent Execution — Step 3)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('build', 'audit')),
  title TEXT NOT NULL,
  instruction TEXT NOT NULL,
  system_name TEXT NOT NULL,
  steps JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'executing', 'review', 'completed')),
  form4 JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);

CREATE OR REPLACE TRIGGER missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
