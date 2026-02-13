import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="md:flex h-screen">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col has-[.whiteboard-page]:p-0">
            <div className="md:hidden mb-4">
              <SidebarTrigger />
            </div>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
