"use client";

import {
  Briefcase,
  LayoutGrid,
  PenSquare,
  Repeat,
  KanbanSquare,
  Sparkles,
  LayoutDashboard,
  FlaskConical,
  PieChart,
  Archive,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from './ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hypotheses', label: 'Hypothèses', icon: FlaskConical },
  { href: '/finances', label: 'Finance', icon: PieChart },
  { href: '/lean-canvas', label: 'Lean Canvas', icon: LayoutGrid },
  { href: '/roadmap', label: 'Roadmap', icon: KanbanSquare },
  { href: '/routine', label: 'Routine', icon: Repeat },
  { href: '/whiteboard', label: 'Whiteboard', icon: PenSquare },
  { href: '/brainstorm', label: 'AI Brainstorm', icon: Sparkles },
  { href: '/legacy-dashboard', label: 'Legacy V0', icon: Archive },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Button variant="ghost" className="h-auto p-0" asChild>
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Briefcase className="w-7 h-7 text-primary" />
            <span className="text-primary-foreground group-data-[collapsible=icon]:hidden">
              Entreprenarial Manager
            </span>
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
