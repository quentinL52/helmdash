import { AppSidebar } from '@/components/app-sidebar';
import { StoreReadyGate } from '@/components/store-ready-gate';
import { GamificationBootstrapper } from '@/components/gamification-bootstrapper';
import { OnboardingGuide } from '@/components/onboarding-guide';

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
