'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from '@/components/mode-toggle';

export function TopNav() {
    const pathname = usePathname();
    const router = useRouter();
    const language = useFounderStore(s => s.language);
    const setLanguage = useFounderStore(s => s.setLanguage);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();
    const t = translations[language].nav;

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth');
    };

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
                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                    <AvatarFallback className="bg-primary text-foreground text-xs">
                                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-semibold hidden md:block">
                                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "FoundersOS"}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-card border-border text-foreground">
                            <DropdownMenuLabel className="text-muted-foreground">Mon compte</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem
                                className="cursor-pointer hover:bg-muted focus:bg-muted"
                                onClick={() => router.push('/settings')}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                <span>Gérer mon compte</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem
                                className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-muted focus:bg-muted"
                                onClick={handleSignOut}
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
                <ModeToggle />
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
