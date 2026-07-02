import { ChatUI } from '@/components/agent/ChatUI';
import { AgentTaskHistory } from '@/components/agent/AgentTaskHistory';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Barreur — Helmdash',
  description: "L'agent central de Helmdash. Apprend, challenge, motive, orchestre.",
};

export default async function AgentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 bg-muted/20 h-full">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-mono">Barreur</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Orchestrateur & Mémoire Active — posez vos questions, déléguer des tâches.
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-0">
          {/* Chat principal */}
          <div className="xl:col-span-3 min-h-0">
            <ChatUI userId={user.id} />
          </div>

          {/* Panneau latéral : historique des tâches */}
          <div className="xl:col-span-1 min-h-0">
            <AgentTaskHistory userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}