import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Types ---

// Module 6: Hypotheses
export type HypothesisStatus = 'draft' | 'testing' | 'validated' | 'invalidated' | 'pivoted';
export type HypothesisRisk = 'critical' | 'high' | 'medium' | 'low';
export type HypothesisCategory = 'problem' | 'solution' | 'channel' | 'revenue' | 'segment';

export interface Hypothesis {
    id: string;
    createdAt: string;
    updatedAt: string;

    // Formulation
    statement: string;
    category: HypothesisCategory;
    riskLevel: HypothesisRisk;

    // Test
    testMethod: string;
    successCriteria: string;
    deadline?: string;
    cost?: number; // Estimated cost

    // Result
    status: HypothesisStatus;
    actualResult?: string;
    learnings?: string;
    nextAction?: string;
}

// Module 7: Finances
export type ExpenseCategory = 'saas' | 'hosting' | 'marketing' | 'legal' | 'salary' | 'freelance' | 'other';

export interface ExpenseItem {
    id: string;
    label: string;
    amount: number;
    category: ExpenseCategory;
    isRecurring: boolean;
    date?: string; // ISO Date "YYYY-MM-DD"
}

export interface MonthlyFinance {
    id: string;
    month: string; // "YYYY-MM"
    revenue: number;
    expenses: ExpenseItem[];
    incomes: ExpenseItem[];
    notes?: string;
}

export interface OneTimeEntry {
    id: string;
    date: string;
    label: string;
    amount: number; // Positive = income, Negative = expense
    category: string;
}

export interface FinanceData {
    cashAvailable: number;
    lastUpdated: string;
    monthlyEntries: MonthlyFinance[];
    oneTimeEntries: OneTimeEntry[];
    // Scenarios can be added later
}

// Module 12: Dashboard (Aggregated Data is derived, but we need types for OKRs and Routine if we strictly follow spec)
// For now, we'll implement types as we build those modules, but provide placeholders in the store.

// Module 8: Journal
export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface JournalEntry {
    id: string;
    date: string; // ISO String
    content: string; // HTML or Markdown
    mood: Mood;
    tags: string[];
    blockers?: string;
}

// Module 9: OKRs
export interface KeyResult {
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string; // e.g., '%', 'users', 'EUR'
}

export interface Objective {
    id: string;
    title: string;
    description?: string;
    progress: number; // 0-100 (auto-calculated)
    keyResults: KeyResult[];
    status: 'on-track' | 'risk' | 'behind' | 'completed';
    quarter: string; // e.g. "Q1 2024"
}

// Module 10: Content Pipeline
export type ContentPlatform = 'linkedin' | 'twitter' | 'blog' | 'newsletter' | 'youtube' | 'instagram';
export type ContentStatus = 'idea' | 'draft' | 'scheduled' | 'published';

export interface ContentIdea {
    id: string;
    title: string;
    description?: string;
    platform: ContentPlatform;
    status: ContentStatus;
    date?: string; // Scheduled or Published date
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

// Module 11: CRM Lite
export type ContactStatus = 'lead' | 'contacted' | 'negotiation' | 'customer' | 'partner' | 'lost';

export interface Contact {
    id: string;
    name: string;
    role?: string;
    company?: string;
    email?: string;
    linkedin?: string;
    status: ContactStatus;
    lastContactDate: string; // ISO Date
    nextFollowUpDate?: string; // ISO Date
    notes?: string;
}

// Module 12: Routine & Dashboard
export interface RoutineTask {
    id: string; // crypto.randomUUID()
    text: string;
    done: boolean;
}

export interface RoutineDay {
    id: string; // e.g. "monday"
    day: string; // "Lundi"
    tasks: RoutineTask[];
}

export interface RoutineHistory {
    date: string; // ISO Date YYYY-MM-DD
    completedItemIds: string[];
    completionRate: number; // 0-1
}

// Module 14: Competitive Watch
export interface CompetitorRadarScores {
    price: number; // 1-10
    features: number; // 1-10
    ux: number; // 1-10
    market: number; // 1-10
    innovation: number; // 1-10
    support: number; // 1-10
}

export interface CompetitorSWOT {
    strengths: string;
    weaknesses: string;
    opportunities: string;
    threats: string;
}

export type PricingModelType = 'free' | 'freemium' | 'subscription' | 'usage' | 'enterprise' | 'other';
export type FeatureStatus = 'yes' | 'no' | 'partial' | 'planned';

export type CompetitorMomentum = 'rising' | 'stable' | 'declining';

export interface Competitor {
    id: string;
    name: string;
    website?: string;
    description?: string;
    strengths?: string;
    weaknesses?: string;
    pricing?: string;
    positioning?: string;
    // Structured fields for strategic analysis
    targetSegment?: string;
    businessModel?: string;
    teamSize?: string;
    fundingStage?: string;
    fundingAmount?: string;
    keyFeatures?: string[];
    differentiators?: string[];
    pricingModel?: PricingModelType;
    pricingRange?: string;
    yearFounded?: string;
    geography?: string;
    radarScores: CompetitorRadarScores;
    swot: CompetitorSWOT;
    featureAnalysis?: Record<string, FeatureStatus>;
    // Intelligence fields
    threatLevel?: number; // 0-100
    momentum?: CompetitorMomentum;
    tags?: string[];
    lastCheckedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MySolution {
    name: string;
    website: string;
    description: string;
    positioning?: string;
    targetSegment?: string;
    businessModel?: string;
    keyFeatures?: string[];
    differentiators?: string[];
    pricingModel?: PricingModelType;
    pricingRange?: string;
    radarScores: CompetitorRadarScores;
    swot: {
        strengths: string;
        weaknesses: string;
        opportunities: string;
        threats: string;
    };
    featureAnalysis: Record<string, FeatureStatus>;
    comparisonCriteria: string[];
    // Intelligence fields
    competitiveAdvantages?: string[];
    targetMarketSize?: string;
}

export interface RoadmapItem {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'doing' | 'done';
    priority: 'high' | 'medium' | 'low';
    week?: string;
    createdAt: string;
    updatedAt: string;
}

export type MarketSignalImpact = 'positive' | 'negative' | 'neutral';
export type MarketSignalCategory = 'funding' | 'product_launch' | 'pricing_change' | 'partnership' | 'hiring' | 'acquisition' | 'market_entry' | 'regulation' | 'technology' | 'leadership' | 'other';
export type MarketSignalUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface MarketSignal {
    id: string;
    date: string;
    title: string;
    description?: string;
    source?: string;
    impact: MarketSignalImpact;
    competitorId?: string;
    category?: MarketSignalCategory;
    urgency?: MarketSignalUrgency;
    sourceUrl?: string;
    isAutoGenerated?: boolean;
    aiSummary?: string;
    createdAt: string;
}

// Module 13: Weekly AI Coach
export interface WeeklyReport {
    id: string;
    date: string; // ISO Date of generation (Monday)
    content: string; // Markdown
    status: 'pending' | 'generated' | 'failed';
    createdAt: string; // ISO String
}

// Module 13: Strategic Recommendations (AI)
export interface StrategicRecommendation {
    generatedAt: string;
    featureGaps: { feature: string; status: 'critical' | 'nice-to-have'; reason: string }[];
    leanCanvasRecommendations: { section: string; suggestion: string }[];
    roadmapRecommendations: { title: string; priority: 'high' | 'medium' | 'low'; timeframe: string }[];
    hypothesisSuggestions: { statement: string; category: string; testMethod: string }[];
    routineOptimization: { suggestion: string; benefit: string; timeframe: string }[];
    marketNews: { title: string; url: string; summary: string; date?: string }[];
}

// Module 14+: Competitive Intelligence System
export type AlertType = 'threat' | 'opportunity' | 'action_required' | 'info';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ScenarioProbability = 'low' | 'medium' | 'high';
export type ScenarioImpact = 'low' | 'medium' | 'high';

export interface CompetitiveSnapshot {
    id: string;
    date: string;
    competitorId: string;
    radarScores: CompetitorRadarScores;
    overallThreatLevel: number; // 0-100
}

export interface CompetitiveAlert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    description: string;
    relatedCompetitorId?: string;
    suggestedAction?: string;
    createdAt: string;
    acknowledgedAt?: string;
    source: 'ai_analysis' | 'signal_detection' | 'score_change' | 'manual';
}

export interface CompetitiveHealthBreakdown {
    featureParity: number;      // 0-100
    pricingPosition: number;    // 0-100
    marketMomentum: number;     // 0-100
    differentiationStrength: number; // 0-100
    threatExposure: number;     // 0-100
}

export interface CompetitiveIntelligence {
    lastAnalyzedAt: string;
    healthScore: number; // 0-100
    healthBreakdown: CompetitiveHealthBreakdown;
    alerts: CompetitiveAlert[];
    trendSummary?: string;
}

export interface ScenarioAnalysis {
    id: string;
    scenario: string;
    probability: ScenarioProbability;
    impact: ScenarioImpact;
    yourResponse: string;
    timeline: string;
    createdAt: string;
}

export interface FounderStore {
    // --- State ---
    userId: string | null; // For data isolation check
    hypotheses: Hypothesis[];
    finance: FinanceData;
    journalEntries: JournalEntry[];
    objectives: Objective[];
    contentIdeas: ContentIdea[]; // NEW
    contacts: Contact[]; // Module 11
    routine: RoutineDay[]; // Module 12
    routineHistory: RoutineHistory[]; // Module 12 - Routine Optimization
    leanCanvas: Record<string, string>;
    roadmap: RoadmapItem[];
    weeklyReport: WeeklyReport | null; // Module 13
    competitors: Competitor[]; // Module 14
    marketSignals: MarketSignal[]; // Module 14
    mySolution: MySolution; // Module 14 - User's own solution for benchmarking
    strategicRecommendations: StrategicRecommendation | null;
    // Competitive Intelligence System
    competitiveIntelligence: CompetitiveIntelligence | null;
    competitiveSnapshots: CompetitiveSnapshot[];
    scenarioAnalyses: ScenarioAnalysis[];

    // --- Actions ---

    // Hypotheses
    addHypothesis: (hypothesis: Omit<Hypothesis, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateHypothesis: (id: string, updates: Partial<Hypothesis>) => void;
    deleteHypothesis: (id: string) => void;

    // Finances
    updateCashAvailable: (amount: number) => void;
    addMonthlyEntry: (entry: MonthlyFinance) => void;
    updateMonthlyEntry: (id: string, updates: Partial<MonthlyFinance>) => void;
    addOneTimeEntry: (entry: OneTimeEntry) => void;
    deleteFinancialEntry: (monthId: string, entryId: string, type: 'expense' | 'revenue') => void;
    updateFinancialEntry: (monthId: string, entryId: string, type: 'expense' | 'revenue', updates: Partial<ExpenseItem>) => void;

    // Journal
    addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
    updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
    deleteJournalEntry: (id: string) => void;

    // OKRs
    addObjective: (objective: Omit<Objective, 'id' | 'progress' | 'keyResults'>) => void;
    updateObjective: (id: string, updates: Partial<Objective>) => void;
    deleteObjective: (id: string) => void;
    addKeyResult: (objectiveId: string, keyResult: Omit<KeyResult, 'id'>) => void;
    updateKeyResult: (objectiveId: string, keyResultId: string, updates: Partial<KeyResult>) => void;
    deleteKeyResult: (objectiveId: string, keyResultId: string) => void;

    // Content Pipeline
    addContentIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateContentIdea: (id: string, updates: Partial<ContentIdea>) => void;
    deleteContentIdea: (id: string) => void;

    // CRM
    addContact: (contact: Omit<Contact, 'id'>) => void;
    updateContact: (id: string, updates: Partial<Contact>) => void;
    deleteContact: (id: string) => void;

    // Routine
    toggleRoutineTask: (dayId: string, taskId: string) => void;
    addRoutineTask: (dayId: string, text: string) => void;
    updateRoutineTask: (dayId: string, taskId: string, text: string) => void;
    deleteRoutineTask: (dayId: string, taskId: string) => void;
    resetRoutineWeek: () => void;

    // Weekly Coach
    setWeeklyReport: (report: WeeklyReport | null) => void;

    // Competitive Watch
    addCompetitor: (competitor: Omit<Competitor, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateCompetitor: (id: string, updates: Partial<Competitor>) => void;
    deleteCompetitor: (id: string) => void;
    addMarketSignal: (signal: Omit<MarketSignal, 'id' | 'createdAt'>) => void;
    deleteMarketSignal: (id: string) => void;
    updateMySolution: (updates: Partial<MySolution>) => void;

    // Feature Matrix Actions
    addComparisonCriterion: (feature: string) => void;
    deleteComparisonCriterion: (feature: string) => void;

    // Market Signal update
    updateMarketSignal: (id: string, updates: Partial<MarketSignal>) => void;

    // Competitive Intelligence Actions
    setCompetitiveIntelligence: (intelligence: CompetitiveIntelligence) => void;
    addCompetitiveSnapshot: (snapshot: Omit<CompetitiveSnapshot, 'id'>) => void;
    acknowledgeAlert: (alertId: string) => void;
    addScenarioAnalysis: (scenario: Omit<ScenarioAnalysis, 'id' | 'createdAt'>) => void;
    updateScenarioAnalysis: (id: string, updates: Partial<ScenarioAnalysis>) => void;
    deleteScenarioAnalysis: (id: string) => void;

    // AI Actions
    setStrategicRecommendations: (recommendations: StrategicRecommendation) => void;
    showStrategicRecommendations: boolean;
    toggleStrategicRecommendations: () => void;

    // Canvas
    updateCanvasSection: (sectionId: string, content: string) => void;

    // Roadmap
    addRoadmapItem: (item: Omit<RoadmapItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateRoadmapItem: (id: string, updates: Partial<RoadmapItem>) => void;
    deleteRoadmapItem: (id: string) => void;

    // --- Settings / i18n ---
    language: 'fr' | 'en';
    setLanguage: (lang: 'fr' | 'en') => void;
    hydrate: (state: Partial<FounderStore>) => void;
    setUserId: (id: string | null) => void;
    reset: () => void;
}

// Helper to calc progress
const calculateObjectiveProgress = (krs: KeyResult[]): number => {
    if (krs.length === 0) return 0;
    const total = krs.reduce((acc, kr) => {
        const p = Math.min(100, Math.max(0, (kr.current / kr.target) * 100));
        return acc + p;
    }, 0);
    return Math.round(total / krs.length);
};

// --- Store Implementation ---

const initialState = {
    userId: null,
    language: 'fr' as const,
    hypotheses: [],
    finance: {
        cashAvailable: 0,
        lastUpdated: new Date().toISOString(),
        monthlyEntries: [],
        oneTimeEntries: [],
    },
    journalEntries: [],
    objectives: [],
    contentIdeas: [],
    contacts: [],
    routine: [
        {
            id: 'mon', day: 'Lundi', tasks: [
                { id: '1', text: 'Revue stratégie & mise à jour Lean Canvas', done: false },
                { id: '2', text: 'Définir les 3 priorités de la semaine', done: false }
            ]
        },
        {
            id: 'tue', day: 'Mardi', tasks: [
                { id: '3', text: 'Outreach : contacter 5-10 prospects', done: false },
                { id: '4', text: '1 interview utilisateur (15-20 min)', done: false }
            ]
        },
        {
            id: 'wed', day: 'Mercredi', tasks: [
                { id: '5', text: 'Rédiger 1 post LinkedIn (build in public)', done: false },
                { id: '6', text: 'Veille concurrence & écosystème IA', done: false }
            ]
        },
        {
            id: 'thu', day: 'Jeudi', tasks: [
                { id: '7', text: '1 appel réseau (mentor, fondateur, expert)', done: false },
                { id: '8', text: 'Avancement admin / finance / juridique', done: false }
            ]
        },
        {
            id: 'fri', day: 'Vendredi', tasks: [
                { id: '9', text: 'Synthèse feedback utilisateurs → décisions produit', done: false },
                { id: '10', text: 'Rétrospective perso : qu\'est-ce qui a marché ?', done: false },
                { id: '11', text: 'Mise à jour roadmap semaine suivante', done: false }
            ]
        }
    ],
    routineHistory: [],
    leanCanvas: {},
    roadmap: [], // Initial empty state
    weeklyReport: null,
    competitors: [],
    marketSignals: [],
    mySolution: {
        name: '',
        website: '',
        description: '',
        radarScores: {
            price: 5,
            features: 5,
            ux: 5,
            market: 5,
            innovation: 5,
            support: 5,
        },
        swot: {
            strengths: '',
            weaknesses: '',
            opportunities: '',
            threats: '',
        },
        featureAnalysis: {},
        comparisonCriteria: ['Mobile App', 'API Access', '24/7 Support', 'Custom Branding', 'Analytics'], // Defaults
    },
    strategicRecommendations: null,
    competitiveIntelligence: null,
    competitiveSnapshots: [],
    scenarioAnalyses: [],
    showStrategicRecommendations: true, // Default to true
};

export const useFounderStore = create<FounderStore>()(
    persist(
        (set, get) => ({
            ...initialState,
            language: 'fr', // Explicit override if needed, but initialState has it

            setUserId: (id) => set({ userId: id }),
            setLanguage: (lang) => set({ language: lang }),
            reset: () => set(initialState),
            hydrate: (state) => set({ ...state }),
            addHypothesis: (hypothesis) => set((state) => ({
                hypotheses: [
                    ...state.hypotheses,
                    {
                        ...hypothesis,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
            })),

            updateHypothesis: (id, updates) => set((state) => ({
                hypotheses: state.hypotheses.map((h) =>
                    h.id === id
                        ? { ...h, ...updates, updatedAt: new Date().toISOString() }
                        : h
                ),
            })),

            deleteHypothesis: (id) => set((state) => ({
                hypotheses: state.hypotheses.filter((h) => h.id !== id),
            })),

            updateCashAvailable: (amount) => set((state) => ({
                finance: {
                    ...state.finance,
                    cashAvailable: amount,
                    lastUpdated: new Date().toISOString(),
                },
            })),

            addMonthlyEntry: (entry) => set((state) => {
                // Ensure all items have a date. If not, default to 1st of month.
                const defaultDate = `${entry.month}-01`;
                const enrichItem = (item: ExpenseItem) => ({ ...item, id: item.id || crypto.randomUUID(), date: item.date || defaultDate });

                const enrichedEntry = {
                    ...entry,
                    id: crypto.randomUUID(),
                    expenses: entry.expenses.map(enrichItem),
                    incomes: (entry.incomes || []).map(enrichItem)
                };

                // Check if month already exists
                const existingMonthIndex = state.finance.monthlyEntries.findIndex(m => m.month === entry.month);

                let newMonthlyEntries = [...state.finance.monthlyEntries];
                if (existingMonthIndex >= 0) {
                    const existing = newMonthlyEntries[existingMonthIndex];
                    newMonthlyEntries[existingMonthIndex] = {
                        ...existing,
                        revenue: existing.revenue + enrichedEntry.revenue,
                        expenses: [...existing.expenses, ...enrichedEntry.expenses],
                        incomes: [...(existing.incomes || []), ...enrichedEntry.incomes]
                    };
                } else {
                    newMonthlyEntries.push(enrichedEntry);
                }

                return {
                    finance: {
                        ...state.finance,
                        monthlyEntries: newMonthlyEntries,
                    },
                };
            }),

            updateMonthlyEntry: (id, updates) => set((state) => ({
                finance: {
                    ...state.finance,
                    monthlyEntries: state.finance.monthlyEntries.map((entry) =>
                        entry.id === id ? { ...entry, ...updates } : entry
                    ),
                },
            })),

            addOneTimeEntry: (entry) => set((state) => ({
                finance: {
                    ...state.finance,
                    oneTimeEntries: [...state.finance.oneTimeEntries, { ...entry, id: crypto.randomUUID() }],
                },
            })),

            deleteFinancialEntry: (monthId, entryId, type) => set((state) => {
                const monthEntry = state.finance.monthlyEntries.find(m => m.id === monthId);
                if (!monthEntry) return state;

                let newExpenses = monthEntry.expenses || [];
                let newIncomes = monthEntry.incomes || [];
                let newRevenue = monthEntry.revenue;

                if (type === 'expense') {
                    newExpenses = newExpenses.filter(e => e.id !== entryId);
                } else {
                    const incomeToRemove = newIncomes.find(i => i.id === entryId);
                    if (incomeToRemove) {
                        newRevenue -= incomeToRemove.amount;
                    }
                    newIncomes = newIncomes.filter(i => i.id !== entryId);
                }

                return {
                    finance: {
                        ...state.finance,
                        monthlyEntries: state.finance.monthlyEntries.map(m =>
                            m.id === monthId
                                ? { ...m, expenses: newExpenses, incomes: newIncomes, revenue: newRevenue }
                                : m
                        )
                    }
                };
            }),

            updateFinancialEntry: (monthId, entryId, type, updates) => set((state) => {
                const monthEntry = state.finance.monthlyEntries.find(m => m.id === monthId);
                if (!monthEntry) return state;

                let newExpenses = monthEntry.expenses || [];
                let newIncomes = monthEntry.incomes || [];
                let newRevenue = monthEntry.revenue;

                if (type === 'expense') {
                    newExpenses = newExpenses.map(e => e.id === entryId ? { ...e, ...updates } : e);
                } else {
                    newIncomes = newIncomes.map(i => {
                        if (i.id === entryId) {
                            const oldAmount = i.amount;
                            const newAmount = updates.amount !== undefined ? updates.amount : oldAmount;
                            // Only update aggregate if amount changed
                            if (updates.amount !== undefined) {
                                newRevenue = newRevenue - oldAmount + newAmount;
                            }
                            return { ...i, ...updates };
                        }
                        return i;
                    });
                }

                return {
                    finance: {
                        ...state.finance,
                        monthlyEntries: state.finance.monthlyEntries.map(m =>
                            m.id === monthId
                                ? { ...m, expenses: newExpenses, incomes: newIncomes, revenue: newRevenue }
                                : m
                        )
                    }
                };
            }),

            addJournalEntry: (entry) => set((state) => {
                const entryDate = entry.date.split('T')[0]; // Simple YYYY-MM-DD check
                const existingIndex = state.journalEntries.findIndex(e => e.date.split('T')[0] === entryDate);

                if (existingIndex >= 0) {
                    // Update existing
                    const newEntries = [...state.journalEntries];
                    newEntries[existingIndex] = { ...newEntries[existingIndex], ...entry };
                    return { journalEntries: newEntries };
                }

                return {
                    journalEntries: [
                        ...state.journalEntries,
                        { ...entry, id: crypto.randomUUID() }
                    ]
                };
            }),

            updateJournalEntry: (id, updates) => set((state) => ({
                journalEntries: state.journalEntries.map((e) =>
                    e.id === id ? { ...e, ...updates } : e
                )
            })),

            deleteJournalEntry: (id) => set((state) => ({
                journalEntries: state.journalEntries.filter((e) => e.id !== id)
            })),

            // OKR Actions
            addObjective: (objective) => set((state) => ({
                objectives: [
                    ...state.objectives,
                    { ...objective, id: crypto.randomUUID(), progress: 0, keyResults: [] }
                ]
            })),

            updateObjective: (id, updates) => set((state) => ({
                objectives: state.objectives.map(o => o.id === id ? { ...o, ...updates } : o)
            })),

            deleteObjective: (id) => set((state) => ({
                objectives: state.objectives.filter(o => o.id !== id)
            })),

            addKeyResult: (objectiveId, keyResult) => set((state) => {
                const newKR = { ...keyResult, id: crypto.randomUUID() };
                const updatedObjectives = state.objectives.map(o => {
                    if (o.id === objectiveId) {
                        const newKRs = [...o.keyResults, newKR];
                        return {
                            ...o,
                            keyResults: newKRs,
                            progress: calculateObjectiveProgress(newKRs)
                        };
                    }
                    return o;
                });
                return { objectives: updatedObjectives };
            }),

            updateKeyResult: (objectiveId, keyResultId, updates) => set((state) => {
                const updatedObjectives = state.objectives.map(o => {
                    if (o.id === objectiveId) {
                        const newKRs = o.keyResults.map(kr =>
                            kr.id === keyResultId ? { ...kr, ...updates } : kr
                        );
                        return {
                            ...o,
                            keyResults: newKRs,
                            progress: calculateObjectiveProgress(newKRs)
                        };
                    }
                    return o;
                });
                return { objectives: updatedObjectives };
            }),

            deleteKeyResult: (objectiveId, keyResultId) => set((state) => {
                const updatedObjectives = state.objectives.map(o => {
                    if (o.id === objectiveId) {
                        const newKRs = o.keyResults.filter(kr => kr.id !== keyResultId);
                        return {
                            ...o,
                            keyResults: newKRs,
                            progress: calculateObjectiveProgress(newKRs)
                        };
                    }
                    return o;
                });
                return { objectives: updatedObjectives };
            }),

            // Content Pipeline Actions
            addContentIdea: (idea) => set((state) => ({
                contentIdeas: [
                    ...state.contentIdeas,
                    {
                        ...idea,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                ]
            })),

            updateContentIdea: (id, updates) => set((state) => ({
                contentIdeas: state.contentIdeas.map(i =>
                    i.id === id
                        ? { ...i, ...updates, updatedAt: new Date().toISOString() }
                        : i
                )
            })),

            deleteContentIdea: (id) => set((state) => ({
                contentIdeas: state.contentIdeas.filter(i => i.id !== id)
            })),


            // Competitive Watch Actions
            addCompetitor: (competitor) => set((state) => ({
                competitors: [
                    ...state.competitors,
                    {
                        ...competitor,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
            })),

            updateCompetitor: (id, updates) => set((state) => ({
                competitors: state.competitors.map((c) =>
                    c.id === id
                        ? { ...c, ...updates, updatedAt: new Date().toISOString() }
                        : c
                ),
            })),

            deleteCompetitor: (id) => set((state) => ({
                competitors: state.competitors.filter((c) => c.id !== id),
            })),

            addMarketSignal: (signal) => set((state) => ({
                marketSignals: [
                    ...state.marketSignals,
                    {
                        ...signal,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                    },
                ],
            })),

            deleteMarketSignal: (id) => set((state) => ({
                marketSignals: state.marketSignals.filter((s) => s.id !== id),
            })),

            updateMySolution: (updates) => set((state) => ({
                mySolution: { ...state.mySolution, ...updates },
            })),

            addComparisonCriterion: (feature) => set((state) => {
                const currentCriteria = state.mySolution.comparisonCriteria || [];
                if (currentCriteria.includes(feature)) return state;
                return {
                    mySolution: {
                        ...state.mySolution,
                        comparisonCriteria: [...currentCriteria, feature]
                    }
                };
            }),

            deleteComparisonCriterion: (feature) => set((state) => ({
                mySolution: {
                    ...state.mySolution,
                    comparisonCriteria: (state.mySolution.comparisonCriteria || []).filter(f => f !== feature)
                }
            })),

            updateMarketSignal: (id, updates) => set((state) => ({
                marketSignals: state.marketSignals.map((s) =>
                    s.id === id ? { ...s, ...updates } : s
                ),
            })),

            // Competitive Intelligence Actions
            setCompetitiveIntelligence: (intelligence) => set({ competitiveIntelligence: intelligence }),

            addCompetitiveSnapshot: (snapshot) => set((state) => ({
                competitiveSnapshots: [
                    ...state.competitiveSnapshots,
                    { ...snapshot, id: crypto.randomUUID() },
                ],
            })),

            acknowledgeAlert: (alertId) => set((state) => {
                if (!state.competitiveIntelligence) return state;
                return {
                    competitiveIntelligence: {
                        ...state.competitiveIntelligence,
                        alerts: state.competitiveIntelligence.alerts.map((a) =>
                            a.id === alertId
                                ? { ...a, acknowledgedAt: new Date().toISOString() }
                                : a
                        ),
                    },
                };
            }),

            addScenarioAnalysis: (scenario) => set((state) => ({
                scenarioAnalyses: [
                    ...state.scenarioAnalyses,
                    {
                        ...scenario,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                    },
                ],
            })),

            updateScenarioAnalysis: (id, updates) => set((state) => ({
                scenarioAnalyses: state.scenarioAnalyses.map((s) =>
                    s.id === id ? { ...s, ...updates } : s
                ),
            })),

            deleteScenarioAnalysis: (id) => set((state) => ({
                scenarioAnalyses: state.scenarioAnalyses.filter((s) => s.id !== id),
            })),

            updateCanvasSection: (sectionId, content) => set((state) => ({
                leanCanvas: {
                    ...state.leanCanvas,
                    [sectionId]: content,
                },
            })),

            // Roadmap Actions
            addRoadmapItem: (item) => set((state) => ({
                roadmap: [
                    ...state.roadmap,
                    {
                        ...item,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                ]
            })),

            updateRoadmapItem: (id, updates) => set((state) => ({
                roadmap: state.roadmap.map(item =>
                    item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
                )
            })),

            deleteRoadmapItem: (id) => set((state) => ({
                roadmap: state.roadmap.filter(item => item.id !== id)
            })),

            // CRM Actions
            addContact: (contact) => set((state) => ({
                contacts: [
                    ...state.contacts,
                    {
                        ...contact,
                        id: crypto.randomUUID(),
                        lastContactDate: contact.lastContactDate || new Date().toISOString(),
                    }
                ]
            })),

            updateContact: (id, updates) => set((state) => ({
                contacts: state.contacts.map(c =>
                    c.id === id ? { ...c, ...updates } : c
                )
            })),

            deleteContact: (id) => set((state) => ({
                contacts: state.contacts.filter(c => c.id !== id)
            })),

            // Routine Actions
            toggleRoutineTask: (dayId, taskId) => set((state) => {
                const newRoutine = state.routine.map(day =>
                    day.id === dayId ? {
                        ...day,
                        tasks: day.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
                    } : day
                );

                // Calculate progress
                const totalTasks = newRoutine.reduce((acc, day) => acc + day.tasks.length, 0);
                const completedTasks = newRoutine.reduce((acc, day) => acc + day.tasks.filter(t => t.done).length, 0);
                const rate = totalTasks > 0 ? completedTasks / totalTasks : 0;

                // Update History for Today
                const today = new Date().toISOString().split('T')[0];
                const existingHistoryIndex = state.routineHistory.findIndex(h => h.date === today);
                let newHistory = [...state.routineHistory];

                if (existingHistoryIndex >= 0) {
                    newHistory[existingHistoryIndex] = {
                        ...newHistory[existingHistoryIndex],
                        completionRate: rate,
                        completedItemIds: [] // We could track specific IDs here if needed
                    };
                } else {
                    newHistory.push({
                        date: today,
                        completionRate: rate,
                        completedItemIds: []
                    });
                }

                // Keep history sorted or limited? Maybe just last 90 days.
                if (newHistory.length > 365) newHistory = newHistory.slice(-365);

                return {
                    routine: newRoutine,
                    routineHistory: newHistory
                };
            }),

            addRoutineTask: (dayId, text) => set((state) => ({
                routine: state.routine.map(day =>
                    day.id === dayId ? {
                        ...day,
                        tasks: [...day.tasks, { id: crypto.randomUUID(), text, done: false }]
                    } : day
                )
            })),

            updateRoutineTask: (dayId, taskId, text) => set((state) => ({
                routine: state.routine.map(day =>
                    day.id === dayId ? {
                        ...day,
                        tasks: day.tasks.map(t => t.id === taskId ? { ...t, text } : t)
                    } : day
                )
            })),

            deleteRoutineTask: (dayId, taskId) => set((state) => ({
                routine: state.routine.map(day =>
                    day.id === dayId ? {
                        ...day,
                        tasks: day.tasks.filter(t => t.id !== taskId)
                    } : day
                )
            })),

            resetRoutineWeek: () => set((state) => ({
                routine: state.routine.map(day => ({
                    ...day,
                    tasks: day.tasks.map(t => ({ ...t, done: false }))
                }))
            })),

            setWeeklyReport: (report) => set({ weeklyReport: report }),

            // AI Actions
            setStrategicRecommendations: (recommendations) => set({ strategicRecommendations: recommendations }),
            toggleStrategicRecommendations: () => set((state) => ({ showStrategicRecommendations: !state.showStrategicRecommendations })),


        }),
        {
            name: 'founder-os-store', // name of the item in the storage (must be unique)
        }
    )
);
