-- Migration: Add AgentTask table for sub-agent queue persistence
CREATE TABLE "agent_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "task_id" TEXT NOT NULL,
    "agent_role" TEXT NOT NULL,
    "task_objective" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_tasks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "agent_tasks_task_id_key" ON "agent_tasks"("task_id");
CREATE INDEX "agent_tasks_user_id_idx" ON "agent_tasks"("user_id");
CREATE INDEX "agent_tasks_user_id_status_idx" ON "agent_tasks"("user_id", "status");
