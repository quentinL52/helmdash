'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
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
    Users,
    Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TopNav() {
    const pathname = usePathname();
    const { language, setLanguage } = useFounderStore();
    const t = translations[language].nav;

    const navItems = [
        { href: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
        { href: '/hypotheses', label: t.hypotheses, icon: FlaskConical },
        { href: '/finances', label: t.finance, icon: PieChart },
        { href: '/lean-canvas', label: t.leanCanvas, icon: LayoutGrid },
        { href: '/roadmap', label: t.roadmap, icon: KanbanSquare },
        { href: '/routine', label: t.routine, icon: Repeat },
        { href: '/whiteboard', label: t.whiteboard, icon: PenSquare },
        { href: '/brainstorm', label: t.brainstorm, icon: Sparkles },
        { href: '/okr', label: t.okr, icon: Target },
        { href: '/content', label: t.content, icon: Megaphone },
        { href: '/crm', label: t.crm, icon: Users },
        { href: '/journal', label: t.journal, icon: BookOpen },
    ];

    const toggleLanguage = () => {
        setLanguage(language === 'fr' ? 'en' : 'fr');
    };

    return (
        <header className="h-[50px] border-b border-border flex items-center px-4 bg-background/80 backdrop-blur-md sticky top-0 z-50 justify-between">
            <div className="flex items-center flex-1 overflow-hidden">
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
            </div>

            <div className="flex items-center gap-2 ml-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLanguage}
                    className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                    <Languages className="w-3.5 h-3.5 mr-1.5" />
                    {language.toUpperCase()}
                </Button>
            </div>
        </header>
    );
}
