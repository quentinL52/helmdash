'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  LineChart, 
  Map as MapIcon, 
  Users, 
  LogOut,
  BrainCircuit,
  Plus
} from 'lucide-react';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'finances' | 'roadmap' | 'crm'>('dashboard');

  return (
    <div className="flex h-screen bg-[#F5F1E8] text-[#0E1B2E] font-mono overflow-hidden">
      {/* DEMO BANNER */}
      <div className="absolute top-0 left-0 w-full bg-[#F0522E] text-white text-center py-2 text-sm font-bold z-50 shadow-md">
        🚀 MODE DÉMO - Ceci est un aperçu interactif. Aucune donnée n'est sauvegardée. 
        <Link href="/" className="ml-4 underline hover:text-[#0E1B2E]">Retour à l'accueil</Link>
      </div>

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0E1B2E] text-[#EAE6DC] pt-16 pb-6 px-4 flex flex-col border-r border-[#0E1B2E]/10">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 bg-[#F0522E] rounded-md flex items-center justify-center">
            <span className="font-bold text-[#0E1B2E]">H</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Helmdash</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            active={activeTab === 'dashboard'} 
            icon={<LayoutDashboard size={18} />} 
            label="Vue d'ensemble" 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            active={activeTab === 'finances'} 
            icon={<LineChart size={18} />} 
            label="Finances" 
            onClick={() => setActiveTab('finances')} 
          />
          <SidebarItem 
            active={activeTab === 'roadmap'} 
            icon={<MapIcon size={18} />} 
            label="Roadmap" 
            onClick={() => setActiveTab('roadmap')} 
          />
          <SidebarItem 
            active={activeTab === 'crm'} 
            icon={<Users size={18} />} 
            label="CRM" 
            onClick={() => setActiveTab('crm')} 
          />
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-white/60">
            <BrainCircuit size={18} />
            <span>Agent Barreur : Actif</span>
          </div>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
            <LogOut size={18} />
            <span>Quitter la démo</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto pt-14 p-8 relative">
        {activeTab === 'dashboard' && <DashboardMock />}
        {activeTab === 'finances' && <FinancesMock />}
        {activeTab === 'roadmap' && <RoadmapMock />}
        {activeTab === 'crm' && <CRMMock />}
      </main>
    </div>
  );
}

function SidebarItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active ? 'bg-[#F0522E] text-[#0E1B2E] font-bold' : 'text-[#a9b2c0] hover:bg-white/5 hover:text-white'}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

// ==========================================
// MOCK COMPONENTS
// ==========================================

function DashboardMock() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Bonjour, Solo Founder 👋</h1>
          <p className="text-[#6e7b90]">Voici un résumé de l'état de votre startup aujourd'hui.</p>
        </div>
        <button className="bg-[#0E1B2E] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0E1B2E]/90 flex items-center gap-2">
          <BrainCircuit size={16} /> Demander à l'agent
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <MetricCard title="MRR Actuel" value="4 280 €" trend="+12% ce mois" trendType="up" />
        <MetricCard title="Runway Estimé" value="8.2 mois" trend="-0.4 mois vs avril" trendType="down" />
        <MetricCard title="Burn Rate" value="3 100 € /m" trend="Stable" trendType="neutral" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#0E1B2E]/10 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2"><MapIcon size={18} /> Roadmap (Cette semaine)</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm"><span className="w-2 h-2 rounded-full bg-[#F0522E]"></span> Lancer la page de démo</li>
            <li className="flex items-center gap-3 text-sm line-through text-[#6e7b90]"><span className="w-2 h-2 rounded-full bg-green-500"></span> Configurer Stripe</li>
            <li className="flex items-center gap-3 text-sm"><span className="w-2 h-2 rounded-full bg-[#F0522E]"></span> Finaliser les CGV</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#0E1B2E]/10 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Users size={18} /> Dernières intéractions</h3>
          <ul className="space-y-3">
            <li className="text-sm">📞 Appel avec <strong>Sarah J.</strong> (Prospect qualifié)</li>
            <li className="text-sm">📧 Email envoyé à <strong>Marc D.</strong> (Relance investisseur)</li>
            <li className="text-sm text-[#6e7b90] italic">Pas d'autres intéractions récentes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FinancesMock() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tighter">Finances & Trésorerie</h1>
      
      <div className="bg-white p-6 rounded-xl border border-[#0E1B2E]/10 shadow-sm flex items-center justify-center h-64 bg-stripes">
        <p className="text-[#6e7b90] font-medium flex flex-col items-center gap-2">
          <LineChart size={32} className="text-[#F0522E]" />
          Graphique d'évolution du MRR et de la trésorerie
        </p>
      </div>

      <h3 className="font-bold text-xl mt-8">Dernières transactions</h3>
      <div className="bg-white rounded-xl border border-[#0E1B2E]/10 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0E1B2E]/5 border-b border-[#0E1B2E]/10">
            <tr>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Label</th>
              <th className="p-4 font-semibold">Catégorie</th>
              <th className="p-4 font-semibold text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#0E1B2E]/5">
              <td className="p-4">12 Sept 2026</td>
              <td className="p-4 font-medium">Abonnement Vercel</td>
              <td className="p-4"><span className="bg-[#0E1B2E]/10 px-2 py-1 rounded text-xs">Infrastructure</span></td>
              <td className="p-4 text-right text-red-600">-20.00 €</td>
            </tr>
            <tr className="border-b border-[#0E1B2E]/5">
              <td className="p-4">10 Sept 2026</td>
              <td className="p-4 font-medium">Stripe Payout</td>
              <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Revenu</span></td>
              <td className="p-4 text-right text-green-600">+1,240.00 €</td>
            </tr>
            <tr>
              <td className="p-4">01 Sept 2026</td>
              <td className="p-4 font-medium">OpenAI API</td>
              <td className="p-4"><span className="bg-[#0E1B2E]/10 px-2 py-1 rounded text-xs">API_IA</span></td>
              <td className="p-4 text-right text-red-600">-45.20 €</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoadmapMock() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tighter">Roadmap Produit</h1>
        <button className="bg-[#F0522E] text-[#0E1B2E] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <Plus size={16} /> Nouvelle tâche
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <Column title="À faire (Todo)" count={3}>
          <TaskCard title="Intégration Resend" tag="Backend" priority="High" />
          <TaskCard title="Mode Sombre" tag="UI" priority="Medium" />
          <TaskCard title="Landing Page v2" tag="Marketing" priority="Low" />
        </Column>
        <Column title="En cours (Doing)" count={2}>
          <TaskCard title="Dashboard IA" tag="Feature" priority="High" />
          <TaskCard title="Sécurisation des routes Admin" tag="Securité" priority="High" />
        </Column>
        <Column title="Terminé (Done)" count={1}>
          <TaskCard title="Configuration Base de données" tag="Infra" priority="High" done />
        </Column>
      </div>
    </div>
  );
}

function CRMMock() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tighter">CRM & Contacts</h1>
        <input type="text" placeholder="Rechercher un prospect..." className="border border-[#0E1B2E]/20 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#F0522E]" />
      </div>

      <div className="bg-white rounded-xl border border-[#0E1B2E]/10 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0E1B2E]/5 border-b border-[#0E1B2E]/10">
            <tr>
              <th className="p-4 font-semibold">Nom</th>
              <th className="p-4 font-semibold">Entreprise</th>
              <th className="p-4 font-semibold">Statut</th>
              <th className="p-4 font-semibold">Prochaine action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#0E1B2E]/5 hover:bg-[#F5F1E8]/50 cursor-pointer">
              <td className="p-4 font-medium flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">SJ</div>
                Sarah J.
              </td>
              <td className="p-4">TechFlow Inc.</td>
              <td className="p-4"><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">En discussion</span></td>
              <td className="p-4 text-[#6e7b90]">Envoyer le contrat (Demain)</td>
            </tr>
            <tr className="border-b border-[#0E1B2E]/5 hover:bg-[#F5F1E8]/50 cursor-pointer">
              <td className="p-4 font-medium flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">MD</div>
                Marc Dubois
              </td>
              <td className="p-4">Capital Ventures</td>
              <td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">À contacter</span></td>
              <td className="p-4 text-[#6e7b90]">Relance email (15 Sept)</td>
            </tr>
            <tr className="hover:bg-[#F5F1E8]/50 cursor-pointer">
              <td className="p-4 font-medium flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">AL</div>
                Alice Leroy
              </td>
              <td className="p-4">Freelance</td>
              <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Client</span></td>
              <td className="p-4 text-[#6e7b90]">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// HELPER COMPONENTS
// ==========================================

function MetricCard({ title, value, trend, trendType }: { title: string, value: string, trend: string, trendType: 'up' | 'down' | 'neutral' }) {
  const trendColor = trendType === 'up' ? 'text-green-600' : trendType === 'down' ? 'text-red-600' : 'text-[#6e7b90]';
  return (
    <div className="bg-white p-6 rounded-xl border border-[#0E1B2E]/10 shadow-sm">
      <h3 className="text-sm font-semibold text-[#6e7b90] mb-2 uppercase tracking-wide">{title}</h3>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className={`text-sm font-medium ${trendColor}`}>{trend}</div>
    </div>
  );
}

function Column({ title, count, children }: { title: string, count: number, children: React.ReactNode }) {
  return (
    <div className="bg-[#0E1B2E]/5 p-4 rounded-xl border border-[#0E1B2E]/10">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-sm text-[#0E1B2E]">{title}</h3>
        <span className="bg-[#0E1B2E]/10 text-[#0E1B2E] text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function TaskCard({ title, tag, priority, done }: { title: string, tag: string, priority: string, done?: boolean }) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-[#0E1B2E]/10 ${done ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className={`font-semibold text-sm ${done ? 'line-through text-[#6e7b90]' : ''}`}>{title}</h4>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className="bg-[#F5F1E8] text-[#0E1B2E] text-xs px-2 py-1 rounded font-medium">{tag}</span>
        <span className={`text-[10px] uppercase font-bold tracking-wider ${
          priority === 'High' ? 'text-red-600' : priority === 'Medium' ? 'text-orange-500' : 'text-blue-500'
        }`}>{priority}</span>
      </div>
    </div>
  );
}
