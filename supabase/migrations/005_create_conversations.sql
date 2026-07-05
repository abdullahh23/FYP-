-- 005_create_conversations.sql
-- Create conversations table for chat functionality
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    homeowner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contractor_id uuid NULL REFERENCES users(id) ON DELETE SET NULL,
    supplier_id uuid NULL REFERENCES users(id) ON DELETE SET NULL,
    quotation_id uuid NULL REFERENCES quotations(id) ON DELETE SET NULL,
    last_message_at timestamp with time zone NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for quick lookup
CREATE INDEX IF NOT EXISTS idx_conversations_homeowner ON public.conversations(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contractor ON public.conversations(contractor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_supplier ON public.conversations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_conversations_project ON public.conversations(project_id);
