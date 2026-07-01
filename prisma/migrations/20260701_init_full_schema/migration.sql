-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "MoodType" AS ENUM ('on_fire', 'focus', 'burnout', 'zen');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done');

-- CreateEnum
CREATE TYPE "HypothesisStatus" AS ENUM ('draft', 'testing', 'validated', 'invalidated', 'pivoted');

-- CreateEnum
CREATE TYPE "HypothesisRisk" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "HypothesisCategory" AS ENUM ('problem', 'solution', 'channel', 'revenue', 'segment');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('Infrastructure', 'API_IA', 'Auth_Data', 'Observabilite', 'Email', 'Outils_SaaS', 'Marketing', 'Divers');

-- CreateEnum
CREATE TYPE "ExpenseFrequency" AS ENUM ('monthly', 'annual', 'one_time');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('income', 'expense');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('candidat', 'entreprise', 'investisseur', 'ecole');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('a_contacter', 'en_discussion', 'qualifie', 'client', 'perdu');

-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('todo', 'doing', 'done');

-- CreateEnum
CREATE TYPE "RoadmapPriority" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "CanvasSection" AS ENUM ('problem', 'solution', 'keyMetrics', 'uvp', 'unfairAdvantage', 'channels', 'customerSegments', 'costStructure', 'revenueStreams');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "mrr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "arr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "plan_tier" TEXT NOT NULL DEFAULT 'free',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_launch_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "mood_type" "MoodType" NOT NULL,
    "note" TEXT,
    "shared_publicly" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID,
    "title" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" DATE,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_settings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" TEXT,
    "api_key" TEXT,
    "active_agents" JSONB,
    "models_config" JSONB,

    CONSTRAINT "ai_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_encryption_keys" (
    "user_id" UUID NOT NULL,
    "key_hash" TEXT NOT NULL,
    "salt" BYTEA NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "rotated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_encryption_keys_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "memory_notes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tags" TEXT[],
    "links" TEXT[],
    "entities" JSONB,
    "embedding" vector(3072),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,

    CONSTRAINT "memory_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graph_nodes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "graph_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graph_edges" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "source_node_id" UUID NOT NULL,
    "target_node_id" UUID NOT NULL,
    "relationType" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "graph_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hypotheses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "statement" TEXT NOT NULL,
    "category" "HypothesisCategory" NOT NULL,
    "riskLevel" "HypothesisRisk" NOT NULL,
    "test_method" TEXT NOT NULL,
    "success_criteria" TEXT NOT NULL,
    "deadline" DATE,
    "cost" DOUBLE PRECISION,
    "measure_notes" TEXT,
    "status" "HypothesisStatus" NOT NULL DEFAULT 'draft',
    "actual_result" TEXT,
    "learnings" TEXT,
    "next_action" TEXT,
    "pivoted_from_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hypotheses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_finances" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "month" VARCHAR(7) NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_finances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "monthly_finance_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "frequency" "ExpenseFrequency" NOT NULL DEFAULT 'monthly',
    "type" "TransactionType" NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_one_time_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_one_time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_settings" (
    "user_id" UUID NOT NULL,
    "target_mrr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "first_revenue_date" DATE,
    "first_revenue_amount" DOUBLE PRECISION,
    "cash_available" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "gtm_strategies" (
    "user_id" UUID NOT NULL,
    "sb_hero" TEXT,
    "sb_problem" TEXT,
    "sb_guide" TEXT,
    "oa_alternatives" TEXT,
    "oa_unique_attributes" TEXT,
    "oa_value" TEXT,
    "omp_target" TEXT,
    "omp_message" TEXT,
    "omp_media" TEXT,
    "cs_atomic_network" TEXT,
    "ow_cadence" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gtm_strategies_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ContactType",
    "role" TEXT,
    "company" TEXT,
    "email" TEXT,
    "linkedin" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'a_contacter',
    "last_contact_date" DATE NOT NULL,
    "next_action_date" DATE,
    "next_action_label" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'todo',
    "priority" "RoadmapPriority" NOT NULL DEFAULT 'medium',
    "week" TEXT,
    "start_date" DATE,
    "due_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lean_canvas_sections" (
    "user_id" UUID NOT NULL,
    "section_id" "CanvasSection" NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lean_canvas_sections_pkey" PRIMARY KEY ("user_id","section_id")
);

-- CreateTable
CREATE TABLE "scheduled_tasks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "task_name" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "payload" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "mood_entries_user_id_date_idx" ON "mood_entries"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_user_id_key" ON "streaks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_settings_user_id_key" ON "ai_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "graph_nodes_user_id_type_name_key" ON "graph_nodes"("user_id", "type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "graph_edges_source_node_id_target_node_id_relationType_key" ON "graph_edges"("source_node_id", "target_node_id", "relationType");

-- CreateIndex
CREATE INDEX "hypotheses_user_id_idx" ON "hypotheses"("user_id");

-- CreateIndex
CREATE INDEX "hypotheses_user_id_status_idx" ON "hypotheses"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_finances_user_id_month_key" ON "monthly_finances"("user_id", "month");

-- CreateIndex
CREATE INDEX "finance_entries_user_id_idx" ON "finance_entries"("user_id");

-- CreateIndex
CREATE INDEX "finance_one_time_entries_user_id_idx" ON "finance_one_time_entries"("user_id");

-- CreateIndex
CREATE INDEX "contacts_user_id_idx" ON "contacts"("user_id");

-- CreateIndex
CREATE INDEX "contacts_user_id_status_idx" ON "contacts"("user_id", "status");

-- CreateIndex
CREATE INDEX "roadmap_items_user_id_idx" ON "roadmap_items"("user_id");

-- CreateIndex
CREATE INDEX "roadmap_items_user_id_status_idx" ON "roadmap_items"("user_id", "status");

-- CreateIndex
CREATE INDEX "scheduled_tasks_user_id_idx" ON "scheduled_tasks"("user_id");

-- CreateIndex
CREATE INDEX "scheduled_tasks_next_run_at_idx" ON "scheduled_tasks"("next_run_at");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_settings" ADD CONSTRAINT "ai_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_encryption_keys" ADD CONSTRAINT "user_encryption_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_notes" ADD CONSTRAINT "memory_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_nodes" ADD CONSTRAINT "graph_nodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_edges" ADD CONSTRAINT "graph_edges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_edges" ADD CONSTRAINT "graph_edges_source_node_id_fkey" FOREIGN KEY ("source_node_id") REFERENCES "graph_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_edges" ADD CONSTRAINT "graph_edges_target_node_id_fkey" FOREIGN KEY ("target_node_id") REFERENCES "graph_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hypotheses" ADD CONSTRAINT "hypotheses_pivoted_from_id_fkey" FOREIGN KEY ("pivoted_from_id") REFERENCES "hypotheses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hypotheses" ADD CONSTRAINT "hypotheses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_finances" ADD CONSTRAINT "monthly_finances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_entries" ADD CONSTRAINT "finance_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_entries" ADD CONSTRAINT "finance_entries_monthly_finance_id_fkey" FOREIGN KEY ("monthly_finance_id") REFERENCES "monthly_finances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_one_time_entries" ADD CONSTRAINT "finance_one_time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_settings" ADD CONSTRAINT "finance_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gtm_strategies" ADD CONSTRAINT "gtm_strategies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lean_canvas_sections" ADD CONSTRAINT "lean_canvas_sections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_tasks" ADD CONSTRAINT "scheduled_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Note: pgvector HNSW/IVFFlat index skipped — both limited to 2000d max,
-- and our embeddings are 3072d (text-embedding-3-large). For <10k notes,
-- sequential scan with cosine distance is fast enough (<50ms).
-- Upgrade path: pgvector 0.8+ should support HNSW for higher dimensions,
-- or switch to text-embedding-3-small (1536d) to enable indexing.
