import { AppSidebar } from '@/components/app-sidebar';
import { StoreReadyGate } from '@/components/store-ready-gate';
import { GamificationBootstrapper } from '@/components/gamification-bootstrapper';
import { OnboardingGuide } from '@/components/onboarding-guide';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verification onboarding - protection de la zone (app)
  const session = await prisma.onboardingSession.findUnique({
    where: { userId: user.id }
  });

  if (!session || (session.status !== 'completed' && session.status !== 'skipped')) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <AppSidebar />
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-8">
        <StoreReadyGate>
          <GamificationBootstrapper />
          <OnboardingGuide />
          {children}
        </StoreReadyGate>
      </main>
    </div>
  );
}
