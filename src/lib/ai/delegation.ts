import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AgentTaskStatus = 'pending' | 'running' | 'success' | 'partial' | 'failed' | 'needs_approval';

export interface AgentTaskDTO {
  id: string;
  userId: string;
  taskId: string;
  agentRole: string;
  taskObjective: string;
  status: AgentTaskStatus;
  result?: Record<string, unknown> | null;
  errorMessage?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
}

/**
 * Service de gestion des AgentTask — pont entre le Core Agent
 * et la persistence Prisma. Utilisé par spawn_sub_agent (core-agent.ts)
 * et le frontend pour l'historique des tâches.
 */
export const agentTaskService = {
  /**
   * Crée une nouvelle tâche (statut pending).
   */
  async create(params: {
    userId: string;
    agentRole: string;
    taskObjective: string;
    taskId?: string;
  }): Promise<AgentTaskDTO> {
    const taskId = params.taskId || `${params.agentRole}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return prisma.agentTask.create({
      data: {
        userId: params.userId,
        taskId,
        agentRole: params.agentRole,
        taskObjective: params.taskObjective,
        status: 'pending',
      },
    }) as unknown as AgentTaskDTO;
  },

  /**
   * Met à jour le statut d'une tâche (et startedAt/completedAt automatiquement).
   */
  async updateStatus(taskId: string, status: AgentTaskStatus): Promise<AgentTaskDTO> {
    const updateData: Record<string, unknown> = { status };
    if (status === 'running') {
      updateData.startedAt = new Date();
    }
    if (['success', 'partial', 'failed', 'needs_approval'].includes(status)) {
      updateData.completedAt = new Date();
    }
    return prisma.agentTask.update({
      where: { taskId },
      data: updateData,
    }) as unknown as AgentTaskDTO;
  },

  /**
   * Sauvegarde le résultat complet (JSON) d'une tâche terminée.
   */
  async saveResult(taskId: string, result: Record<string, unknown>): Promise<AgentTaskDTO> {
    return prisma.agentTask.update({
      where: { taskId },
      data: { result: result as any },
    }) as unknown as AgentTaskDTO;
  },

  /**
   * Enregistre une erreur sur une tâche.
   */
  async saveError(taskId: string, errorMessage: string): Promise<AgentTaskDTO> {
    return prisma.agentTask.update({
      where: { taskId },
      data: { errorMessage },
    }) as unknown as AgentTaskDTO;
  },

  /**
   * Récupère les tâches d'un utilisateur, avec filtres optionnels.
   */
  async listForUser(
    userId: string,
    filters?: { status?: AgentTaskStatus; agentRole?: string; limit?: number }
  ): Promise<AgentTaskDTO[]> {
    const where: Record<string, unknown> = { userId };
    if (filters?.status) where.status = filters.status;
    if (filters?.agentRole) where.agentRole = filters.agentRole;

    return prisma.agentTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit ?? 50,
    }) as unknown as AgentTaskDTO[];
  },

  /**
   * Récupère les tâches en attente (pour le worker BullMQ).
   */
  async getPending(): Promise<AgentTaskDTO[]> {
    return prisma.agentTask.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
    }) as unknown as AgentTaskDTO[];
  },
};

// Rétrocompatibilité : TaskDelegator était une classe in-memory
// On garde l'interface mais on route vers le service réel
export class TaskDelegator {
  delegateTask(title: string, description: string, role: string) {
    // Compatible avec l'ancienne API — délègue au service
    return agentTaskService.create({
      userId: 'system', // Sera override par l'appelant
      agentRole: role,
      taskObjective: title,
    });
  }

  async getTasksByRole(role: string) {
    // Note: nécessite userId, utilisation limitée
    return [];
  }

  async getPendingTasks() {
    return agentTaskService.getPending();
  }

  async updateTaskStatus(taskId: string, status: AgentTaskStatus) {
    return agentTaskService.updateStatus(taskId, status);
  }
}

export const taskDelegator = new TaskDelegator();
