import { StoreReadyGate } from '@/components/store-ready-gate';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-hidden">
      <StoreReadyGate>
        {children}
      </StoreReadyGate>
    </div>
  );
}
