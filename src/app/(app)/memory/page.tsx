import { GraphView } from '@/components/memory/GraphView';
import { QuickNoteForm } from '@/components/memory/QuickNoteForm';
import { MemoryPageAgent } from '@/components/memory/MemoryPageAgent';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Mémoire — Helmdash',
  description: "Mémoire vectorielle et graphe de connaissances de l'utilisateur.",
};

export default async function MemoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 bg-muted/20">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-mono">Mémoire</h1>
          <p className="text-muted-foreground mt-1">
            Notes persistantes et graphe de connaissances — le cerveau de votre assistant.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphe de connaissances */}
          <div className="lg:col-span-2">
            <GraphView userId={user.id} />
          </div>

          {/* Mini-createur de note */}
          <div className="space-y-4">
            <QuickNoteForm userId={user.id} />
          </div>
        </div>
      </div>
      <MemoryPageAgent userId={user.id} pageLabel="Mémoire" />
    </div>
  );
}