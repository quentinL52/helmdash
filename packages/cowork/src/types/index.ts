import { z } from 'zod';

export const TaskCategorySchema = z.enum(['Tech', 'Growth', 'Product', 'CFO', 'Admin']);
export type TaskCategory = z.infer<typeof TaskCategorySchema>;

export const TaskStatusSchema = z.enum(['backlog', 'todo', 'in_progress', 'blocked', 'done']);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  category: z.preprocess((val) => (!val || val === '' ? 'Tech' : val), TaskCategorySchema),
  status: z.preprocess((val) => (!val || val === '' ? 'todo' : val), TaskStatusSchema),
  priority: z.preprocess((val) => (!val || val === '' ? 'medium' : val), TaskPrioritySchema),
  dueDate: z.string().default(''),
  reminderDate: z.string().default(''),
  assignedAgent: z.string().default('founder'),
  notes: z.string().default(''),
});
export type Task = z.infer<typeof TaskSchema>;

export const DecisionStatusSchema = z.enum(['open', 'decided', 'superseded']);
export type DecisionStatus = z.infer<typeof DecisionStatusSchema>;

export const DecisionSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string().min(1),
  status: z.preprocess((val) => (!val || val === '' ? 'open' : val), DecisionStatusSchema),
  context: z.string().default(''),
  chosenOption: z.string().default(''),
  tradeOffs: z.string().default(''),
  revisitDate: z.string().default(''),
});
export type Decision = z.infer<typeof DecisionSchema>;

export const HypothesisStatusSchema = z.enum(['untested', 'in_progress', 'validated', 'invalidated']);
export type HypothesisStatus = z.infer<typeof HypothesisStatusSchema>;

export const HypothesisSchema = z.object({
  id: z.string(),
  hypothesis: z.string().min(1),
  validationMethod: z.string().default(''),
  successCriteria: z.string().default(''),
  status: z.preprocess((val) => (!val || val === '' ? 'untested' : val), HypothesisStatusSchema),
  validatedAt: z.string().default(''),
});
export type Hypothesis = z.infer<typeof HypothesisSchema>;

export const LeanCanvasSchema = z.object({
  problem: z.string().default(''),
  solution: z.string().default(''),
  customerSegments: z.string().default(''),
  uniqueValueProposition: z.string().default(''),
  channels: z.string().default(''),
  revenueStreams: z.string().default(''),
  costStructure: z.string().default(''),
  keyMetrics: z.string().default(''),
  unfairAdvantage: z.string().default(''),
});
export type LeanCanvas = z.infer<typeof LeanCanvasSchema>;

export const CoworkConfigSchema = z.object({
  version: z.string().default('0.1.0'),
  projectName: z.string().default('Mon Projet'),
  mvpTargetDate: z.string().nullable().default(null),
  port: z.number().default(3333),
  idleTimeoutMinutes: z.number().default(15),
  founderName: z.string().default('Solopreneur'),
  syncEnabled: z.boolean().default(false),
});
export type CoworkConfig = z.infer<typeof CoworkConfigSchema>;
