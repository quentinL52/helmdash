'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    Languages,
    LogOut,
    Radar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClerk } from '@clerk/nextjs';

export function AppSidebar() {
    const pathname = usePathname();
    const language = useFounderStore(s => s.language);
    const setLanguage = useFounderStore(s => s.setLanguage);
    const { signOut, openUserProfile } = useClerk();
    const t = translations[language].nav;
    const common = translations[language].common;

    const [isVisible, setIsVisible] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const navItems = [
        { href: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
        { href: '/hypotheses', label: t.hypotheses, icon: FlaskConical },
        { href: '/finances', label: t.finance, icon: PieChart },
        { href: '/lean-canvas', label: t.leanCanvas, icon: LayoutGrid },
        { href: '/roadmap', label: t.roadmap, icon: KanbanSquare },
        { href: '/routine', label: t.routine, icon: Repeat },
        { href: '/competitive-watch', label: (translations[language] as any).competitiveWatch?.nav || 'Veille Stratégique', icon: Radar },
        { href: '/whiteboard', label: t.whiteboard, icon: PenSquare },
        { href: '/brainstorm', label: t.brainstorm, icon: Sparkles },
        { href: '/okr', label: t.okr, icon: Target },
        { href: '/content', label: t.content, icon: Megaphone },
        { href: '/crm', label: t.crm, icon: Users },
        { href: '/journal', label: t.journal, icon: BookOpen },
    ];

    const showSidebar = useCallback(() => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
        setIsVisible(true);
    }, []);

    const hideSidebar = useCallback(() => {
        hideTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 200);
    }, []);

    const toggleLanguage = () => {
        setLanguage(language === 'fr' ? 'en' : 'fr');
    };

    return (
        <>
            {/* Zone de détection invisible côté gauche */}
            <div
                ref={triggerRef}
                className="fixed left-0 top-0 h-full w-[20px] z-[60]"
                onMouseEnter={showSidebar}
            />

            {/* Overlay sombre quand sidebar visible */}
            {isVisible && (
                <div
                    className="fixed inset-0 bg-black/20 z-[59] transition-opacity duration-200"
                    onClick={() => setIsVisible(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={cn(
                    "fixed left-0 top-0 h-full w-[240px] z-[61] flex flex-col",
                    "bg-[#181a24] border-r border-[#282c3a]",
                    "transition-transform duration-200 ease-out",
                    isVisible ? "translate-x-0" : "-translate-x-full"
                )}
                onMouseEnter={showSidebar}
                onMouseLeave={hideSidebar}
            >
                {/* Logo */}
                <div className="p-4 border-b border-[#282c3a]">
                    <div className="flex items-center gap-3 px-2">
                        <div className="relative w-8 h-8 shrink-0">
                            <Image
                                src="/Gemini_Generated_Image_8puxnv8puxnv8pux.png"
                                alt="FounderOS Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            FounderOS
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-2">
                    <div className="flex flex-col gap-0.5">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsVisible(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                                        isActive
                                            ? "bg-[#6c5ce7]/15 text-[#6c5ce7]"
                                            : "text-[#8b8fa3] hover:bg-[#1f212e] hover:text-[#e8e9ed]"
                                    )}
                                >
                                    <item.icon className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer: Language + Account + Sign Out */}
                <div className="p-3 border-t border-[#282c3a] flex flex-col gap-0.5">
                    <Button
                        variant="ghost"
                        onClick={toggleLanguage}
                        className="w-full flex items-center gap-2 justify-start px-3 py-2 h-auto text-[#8b8fa3] hover:text-[#e8e9ed] hover:bg-[#1f212e]"
                    >
                        <Languages className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {language === 'fr' ? 'Français' : 'English'}
                        </span>
                        <span className="ml-auto text-[11px] bg-[#282c3a] px-2 py-0.5 rounded text-[#8b8fa3]">
                            {language.toUpperCase()}
                        </span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => openUserProfile()}
                        className="w-full flex items-center gap-2 justify-start px-3 py-2 h-auto text-[#8b8fa3] hover:text-[#e8e9ed] hover:bg-[#1f212e]"
                    >
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {language === 'fr' ? 'Mon compte' : 'My account'}
                        </span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => signOut({ redirectUrl: '/' })}
                        className="w-full flex items-center gap-2 justify-start px-3 py-2 h-auto text-red-400 hover:text-red-300 hover:bg-[#1f212e]"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {language === 'fr' ? 'Se déconnecter' : 'Sign out'}
                        </span>
                    </Button>
                </div>
            </aside>
        </>
    );
}
