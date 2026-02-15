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
import { useUser, useClerk } from '@clerk/nextjs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from 'lucide-react';

export function TopNav() {
    const pathname = usePathname();
    const language = useFounderStore(s => s.language);
    const setLanguage = useFounderStore(s => s.setLanguage);
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();
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
                <div className="mr-4 shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-muted/50">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={user?.imageUrl} />
                                    <AvatarFallback className="bg-[#6c5ce7] text-white text-xs">
                                        {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-semibold hidden md:block">
                                    {user?.username || user?.firstName || "FoundersOS"}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-[#181a24] border-[#2a2d3d] text-white">
                            <DropdownMenuLabel className="text-[#8b8fa3]">Mon compte</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#2a2d3d]" />
                            <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#1f212e] focus:bg-[#1f212e]"
                                onClick={() => openUserProfile()}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                <span>Gérer mon compte</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#2a2d3d]" />
                            <DropdownMenuItem
                                className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-[#1f212e] focus:bg-[#1f212e]"
                                onClick={() => signOut({ redirectUrl: '/' })}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Se déconnecter</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
