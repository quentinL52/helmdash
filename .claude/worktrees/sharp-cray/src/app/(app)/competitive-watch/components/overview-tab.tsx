'use client';

import { useState, useMemo } from 'react';
import { useFounderStore, Competitor } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Globe } from 'lucide-react';
import { CompetitorDialog } from './competitor-dialog';

export function OverviewTab() {
    const competitors = useFounderStore(s => s.competitors);
    const deleteCompetitor = useFounderStore(s => s.deleteCompetitor);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);

    const filteredCompetitors = useMemo(
        () =>
            competitors.filter(
                (c) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.positioning?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.pricing?.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [competitors, searchTerm]
    );

    const handleEdit = (competitor: Competitor) => {
        setSelectedCompetitor(competitor);
        setIsDialogOpen(true);
    };

    const handleNew = () => {
        setSelectedCompetitor(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">{t.title}</h2>
                    <p className="text-muted-foreground text-sm">{t.subtitle}</p>
                </div>
                <Button onClick={handleNew} className="bg-primary hover:bg-primary/90 text-foreground">
                    <Plus className="mr-2 h-4 w-4" /> {t.addCompetitor}
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-card border-border text-foreground focus:ring-primary"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-card">
                        <TableRow className="border-border hover:bg-card">
                            <TableHead className="text-muted-foreground">{t.competitor.name}</TableHead>
                            <TableHead className="text-muted-foreground">{t.competitor.website}</TableHead>
                            <TableHead className="text-muted-foreground">{t.competitor.pricing}</TableHead>
                            <TableHead className="text-muted-foreground">{t.competitor.positioning}</TableHead>
                            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCompetitors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    {t.noCompetitors}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCompetitors.map((competitor) => (
                                <TableRow key={competitor.id} className="border-border hover:bg-muted/50 group">
                                    <TableCell className="font-medium text-foreground">
                                        <div className="flex flex-col">
                                            <span>{competitor.name}</span>
                                            {competitor.description && (
                                                <span className="text-xs text-muted-foreground line-clamp-1">
                                                    {competitor.description}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-foreground">
                                        {competitor.website ? (
                                            <a
                                                href={competitor.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-primary hover:underline text-sm"
                                            >
                                                <Globe className="h-3 w-3" />
                                                {competitor.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-foreground text-sm">
                                        {competitor.pricing || <span className="text-muted-foreground">-</span>}
                                    </TableCell>
                                    <TableCell className="text-foreground text-sm max-w-[200px]">
                                        <span className="line-clamp-1">
                                            {competitor.positioning || <span className="text-muted-foreground">-</span>}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={() => handleEdit(competitor)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(competitor)}
                                                        className="hover:bg-muted"
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        {language === 'fr' ? 'Modifier' : 'Edit'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => deleteCompetitor(competitor.id)}
                                                        className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        {language === 'fr' ? 'Supprimer' : 'Delete'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CompetitorDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                competitorToEdit={selectedCompetitor}
            />
        </div>
    );
}
