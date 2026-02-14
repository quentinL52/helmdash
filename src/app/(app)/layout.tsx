import { TopNav } from '@/components/top-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <TopNav />
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-8">
        {children}
      </main>
    </div>
  );
}
