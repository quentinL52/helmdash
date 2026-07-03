import { BaseSubAgent, SubAgentContext, SubAgentResult } from './base-agent';
import { ResearchAgent } from './research-agent';
import { PMAgent } from './pm-agent';
import { CFOAgent } from './cfo-agent';
import { GrowthAgent } from './growth-agent';
import { LegalAgent } from './legal-agent';
import { TechLeadAgent } from './tech-lead-agent';
import { ContentAgent } from './content-agent';
import { RecruitingAgent } from './recruiting-agent';

export type SubAgentRole = 
  | 'research' 
  | 'pm' 
  | 'cfo' 
  | 'growth' 
  | 'legal' 
  | 'tech_lead' 
  | 'content' 
  | 'recruiting';

export const SUB_AGENT_CONFIG: Record<SubAgentRole, {
  name: string;
  description: string;
  tools: string[];
  defaultModel: string;
  maxTokens: number;
  temperature: number;
}> = {
  research: {
    name: 'Research Scientist',
    description: 'Analyse de marché profonde, validation hypothèses, veille concurrentielle, recherche académique',
    tools: ['web_search', 'deep_research', 'query_memory', 'write_memory', 'academic_search', 'extract_entities'],
    defaultModel: 'gpt-4o',
    maxTokens: 8000,
    temperature: 0.3,
  },
  pm: {
    name: 'Product Manager',
    description: 'Planification sprints, specs techniques, Linear/GitHub sync, priorisation, roadmap',
    tools: ['read_dashboard_tab', 'write_dashboard_tab', 'create_linear_ticket', 'create_github_issue', 'estimate_effort', 'decompose_epic'],
    defaultModel: 'claude-sonnet-4',
    maxTokens: 8000,
    temperature: 0.2,
  },
  cfo: {
    name: 'CFO Agent',
    description: 'Forecasting Monte Carlo, scénarios financiers, export comptable, optimisation fiscale, runway',
    tools: ['read_dashboard_tab', 'write_dashboard_tab', 'stripe_sync', 'runway_calculator', 'scenario_modeling', 'tax_optimizer'],
    defaultModel: 'gpt-4o',
    maxTokens: 8000,
    temperature: 0.1,
  },
  growth: {
    name: 'Growth Operator',
    description: 'Outbound sequences, content calendar, funnel analysis, A/B test design, referral programs',
    tools: ['read_dashboard_tab', 'write_dashboard_tab', 'apollo_sequence', 'linkedin_post', 'email_campaign', 'funnel_analysis', 'ab_test_design'],
    defaultModel: 'gpt-4o',
    maxTokens: 8000,
    temperature: 0.4,
  },
  legal: {
    name: 'Legal/Compliance Agent',
    description: 'CGV, Privacy Policy, DPA, contrats freelance, checklist RGPD, revue contrats',
    tools: ['generate_legal_doc', 'review_contract', 'gdpr_checklist', 'dpa_generator', 'terms_generator'],
    defaultModel: 'gpt-4o',
    maxTokens: 8000,
    temperature: 0.1,
  },
  tech_lead: {
    name: 'Tech Lead',
    description: 'Architecture, ADR, code review, specs techniques, dette technique, choix technos',
    tools: ['read_dashboard_tab', 'write_dashboard_tab', 'create_github_issue', 'generate_mermaid', 'code_review', 'arch_decision_record', 'dependency_audit'],
    defaultModel: 'claude-sonnet-4',
    maxTokens: 8000,
    temperature: 0.2,
  },
  content: {
    name: 'Content Creator',
    description: 'Posts LinkedIn, articles, newsletter, repurposing, calendrier éditorial, SEO',
    tools: ['read_dashboard_tab', 'write_dashboard_tab', 'generate_post', 'write_article', 'newsletter_draft', 'repurpose_content', 'seo_optimize'],
    defaultModel: 'gpt-4o',
    maxTokens: 8000,
    temperature: 0.5,
  },
  recruiting: {
    name: 'Recruiting Agent',
    description: 'Job descriptions, screening CV, grilles entretien, benchmark salaires, onboarding',
    tools: ['write_job_desc', 'screen_cv', 'interview_guide', 'comp_benchmark', 'onboarding_plan', 'culture_fit_assessment'],
    defaultModel: 'gpt-4o',
    maxTokens: 8000,
    temperature: 0.3,
  },
};

class SubAgentRegistry {
  async spawn(role: SubAgentRole, context: SubAgentContext): Promise<SubAgentResult> {
    const config = SUB_AGENT_CONFIG[role];
    if (!config) {
      throw new Error(`Unknown sub-agent role: ${role}`);
    }

    // Vérifier permissions utilisateur (plan tier)
    await this.checkPermissions(context.userId, role);

    const agent = await this.instantiateAgent(role, context);
    
    const startTime = Date.now();
    try {
      const result = await agent.execute();
      
      console.log(`[SubAgent:${role}] Completed in ${Date.now() - startTime}ms`, {
        status: result.status,
        deliverables: result.deliverables.length,
        tokens: result.tokensUsed,
        cost: result.costUsd,
      });

      await this.trackUsage(context.userId, role, result);
      
      return result;
    } catch (error) {
      console.error(`[SubAgent:${role}] Failed:`, error);
      return {
        status: 'failed',
        deliverables: [],
        insights: [`Erreur: ${error instanceof Error ? error.message : 'Unknown'}`],
        nextSteps: [],
        tokensUsed: 0,
        costUsd: 0,
      };
    }
  }

  private async checkPermissions(userId: string, role: SubAgentRole): Promise<void> {
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { planTier: true }
    });
    
    const requiredTier: Record<SubAgentRole, string> = {
      research: 'starter',
      pm: 'starter',
      cfo: 'growth',
      growth: 'growth',
      legal: 'growth',
      tech_lead: 'starter',
      content: 'starter',
      recruiting: 'scale',
    };

    const tierOrder = ['free', 'starter', 'growth', 'scale'];
    const userTierIndex = tierOrder.indexOf(user?.planTier || 'free');
    const requiredTierIndex = tierOrder.indexOf(requiredTier[role]);
    
    if (userTierIndex < requiredTierIndex) {
      throw new Error(`Role ${role} requires ${requiredTier[role]} plan or higher`);
    }
  }

  private async instantiateAgent(role: SubAgentRole, context: SubAgentContext): Promise<BaseSubAgent> {
    // Récupérer la config utilisateur pour le modèle
    const { getModelForAgent } = await import('@/lib/ai/provider-registry');
    const userConfig = await this.getUserConfig(context.userId);
    
    switch (role) {
      case 'research':
        return new ResearchAgent(context, userConfig);
      case 'pm':
        return new PMAgent(context);
      case 'cfo':
        return new CFOAgent(context);
      case 'growth':
        return new GrowthAgent(context);
      case 'legal':
        return new LegalAgent(context);
      case 'tech_lead':
        return new TechLeadAgent(context);
      case 'content':
        return new ContentAgent(context);
      case 'recruiting':
        return new RecruitingAgent(context);
      default:
        throw new Error(`Agent ${role} not implemented`);
    }
  }

  private async getUserConfig(userId: string): Promise<any> {
    try {
      const { prisma } = await import('@/lib/prisma');
      const settings = await prisma.aiSettings.findUnique({ where: { userId } });
      return settings?.modelsConfig || null;
    } catch {
      return null;
    }
  }

  private async trackUsage(userId: string, role: SubAgentRole, result: SubAgentResult): Promise<void> {
    // const { prisma } = await import('@/lib/prisma');
    // await prisma.agentUsage.create({
    //   data: {
    //     userId,
    //     agentRole: role,
    //     status: result.status,
    //     tokensUsed: result.tokensUsed,
    //     costUsd: result.costUsd,
    //     deliverablesCount: result.deliverables.length,
    //   }
    // });
  }

  getConfig(role: SubAgentRole) {
    return SUB_AGENT_CONFIG[role];
  }

  getAllRoles(): SubAgentRole[] {
    return Object.keys(SUB_AGENT_CONFIG) as SubAgentRole[];
  }
}

export const subAgentRegistry = new SubAgentRegistry();