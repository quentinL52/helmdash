import { ChatUI } from '@/components/agent/ChatUI';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Agent Central - AirH Founder OS',
  description: 'Interface de l\'Agent Central',
};

export default async function AgentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-muted/20">
      <div className="w-full h-full flex flex-col max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Agent Central</h1>
        </div>
        <div className="flex-1">
          {/* @ts-ignore : server component passing string */}
          <ChatUI userId={user.id} />
        </div>
      </div>
    </div>
  );
}
