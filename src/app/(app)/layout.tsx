import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="md:flex">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <main className="flex-1 flex flex-col">
          <div className="p-4 sm:p-6 lg:p-8 flex-1">
            <div className="md:hidden mb-4">
              <SidebarTrigger />
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
