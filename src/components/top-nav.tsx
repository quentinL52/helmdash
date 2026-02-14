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
    Target
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
    { href: '/journal', label: 'Journal', icon: BookOpen },
];

export function TopNav() {
    const pathname = usePathname();

    return (
        <header className="h-[60px] border-b border-border flex items-center px-6 bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2.5 mr-8">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg text-white bg-gradient-to-br from-[#6c5ce7] to-[#4a3fb5]">
                    E
                </div>
                <h1 className="text-base font-bold tracking-tight text-foreground">
                    Entrepreneurial OS <span className="opacity-50 font-normal">v0.1</span>
                </h1>
            </div>

            <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap",
                                isActive
                                    ? "bg-accent/10 text-accent"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}
