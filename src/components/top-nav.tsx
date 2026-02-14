'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FlaskConical,
    PieChart,
    LayoutGrid,
    KanbanSquare,
    Repeat,
    PenSquare,
    Sparkles,
    BookOpen,
    Target,
    Megaphone,
    Users
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/hypotheses', label: 'Hypothèses', icon: FlaskConical },
    { href: '/finances', label: 'Finance', icon: PieChart },
    { href: '/lean-canvas', label: 'Lean Canvas', icon: LayoutGrid },
    { href: '/roadmap', label: 'Roadmap', icon: KanbanSquare },
    { href: '/routine', label: 'Routine', icon: Repeat },
    { href: '/whiteboard', label: 'Whiteboard', icon: PenSquare },
    { href: '/brainstorm', label: 'AI Brainstorm', icon: Sparkles },
    { href: '/okr', label: 'OKRs', icon: Target },
    { href: '/content', label: 'Content', icon: Megaphone },
    { href: '/crm', label: 'CRM', icon: Users },
    { href: '/journal', label: 'Journal', icon: BookOpen },
];

export function TopNav() {
    const pathname = usePathname();

    return (
        <header className="h-[50px] border-b border-border flex items-center px-4 bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2 mr-4 shrink-0">
                <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br from-[#6c5ce7] to-[#4a3fb5]">
                    E
                </div>
                <h1 className="text-sm font-bold tracking-tight text-foreground hidden md:block">
                    Entrepreneurial OS
                </h1>
            </div>

            <nav className="flex items-center gap-0.5 overflow-x-auto no-scrollbar mask-linear-fade">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all duration-200 whitespace-nowrap",
                                isActive
                                    ? "bg-accent/10 text-accent"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-3.5 h-3.5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}
