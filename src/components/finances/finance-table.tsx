'use client';

import { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2 } from 'lucide-react';
import { useFounderStore, ExpenseItem, ExpenseCategory } from '@/store/founder-store';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    format,
    isSameWeek,
    isSameMonth,
    isSameQuarter,
    isSameYear,
    startOfWeek,
    endOfWeek,
} from 'date-fns';
import { Timeframe } from './runway-chart';
import { translations } from '@/lib/translations';

interface FlatEntry extends ExpenseItem {
    monthId: string;
    monthLabel: string;
    type: 'expense' | 'revenue';
    isHeader?: boolean;
    headerLabel?: string;
}

interface FinanceTableProps {
    timeframe: Timeframe;
}

export function FinanceTable({ timeframe }: FinanceTableProps) {
    const finance = useFounderStore(s => s.finance);
    const deleteFinancialEntry = useFounderStore(s => s.deleteFinancialEntry);
    const updateFinancialEntry = useFounderStore(s => s.updateFinancialEntry);
    const language = useFounderStore(s => s.language);
    const t = translations[language].finance.table;
    const common = translations[language].common;
    const formT = translations[language].finance.form;

    const [deleteId, setDeleteId] = useState<{ monthId: string; entryId: string; type: 'expense' | 'revenue' } | null>(null);
    const [editingEntry, setEditingEntry] = useState<FlatEntry | null>(null);

    // Flatten entries and group by timeframe
    const entries: FlatEntry[] = useMemo(() => {
        // 1. Flatten all
        const allEntries = finance.monthlyEntries.flatMap(month => {
            const expenses = (month.expenses || []).map(e => ({
                ...e,
                monthId: month.id,
                monthLabel: month.month,
                type: 'expense' as const,
                date: e.date || `${month.month}-01`,
            }));
            const incomes = (month.incomes || []).map(i => ({
                ...i,
                monthId: month.id,
                monthLabel: month.month,
                type: 'revenue' as const,
                date: i.date || `${month.month}-01`,
            }));
            return [...expenses, ...incomes];
        }).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

        // 2. Group
        const grouped: FlatEntry[] = [];
        let lastHeaderValue = '';

        allEntries.forEach(entry => {
            const date = new Date(entry.date!);
            let headerValue = '';
            let headerLabel = '';

            switch (timeframe) {
                case 'week':
                    const start = startOfWeek(date, { weekStartsOn: 1 });
                    const end = endOfWeek(date, { weekStartsOn: 1 });
                    headerValue = format(start, 'yyyy-ww');
                    headerLabel = `Week of ${format(start, 'd MMM')} - ${format(end, 'd MMM')}`;
                    break;
                case 'month':
                    headerValue = format(date, 'yyyy-MM');
                    headerLabel = format(date, 'MMMM yyyy');
                    break;
                case 'quarter':
                    const q = Math.floor((date.getMonth() + 3) / 3);
                    headerValue = `${date.getFullYear()}-Q${q}`;
                    headerLabel = `Q${q} ${date.getFullYear()}`;
                    break;
                case 'year':
                    headerValue = format(date, 'yyyy');
                    headerLabel = format(date, 'yyyy');
                    break;
            }

            if (headerValue !== lastHeaderValue) {
                grouped.push({
                    id: `header-${headerValue}`,
                    label: '',
                    amount: 0,
                    category: 'other',
                    isRecurring: false,
                    monthId: '',
                    monthLabel: '',
                    type: 'expense',
                    isHeader: true,
                    headerLabel
                });
                lastHeaderValue = headerValue;
            }
            grouped.push(entry);
        });

        return grouped;
    }, [finance, timeframe]);

    const handleDelete = () => {
        if (deleteId) {
            deleteFinancialEntry(deleteId.monthId, deleteId.entryId, deleteId.type);
            setDeleteId(null);
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEntry) {
            updateFinancialEntry(editingEntry.monthId, editingEntry.id, editingEntry.type, {
                label: editingEntry.label,
                amount: editingEntry.amount,
                category: editingEntry.category,
                date: editingEntry.date,
            });
            setEditingEntry(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-slate-800">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-900/50">
                            <TableHead className="text-gray-400">{t.date}</TableHead>
                            <TableHead className="text-gray-400">{t.description}</TableHead>
                            <TableHead className="text-gray-400">{formT.type}</TableHead>
                            <TableHead className="text-gray-400">{t.category}</TableHead>
                            <TableHead className="text-right text-gray-400">{t.amount}</TableHead>
                            <TableHead className="text-right text-gray-400">{t.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.length === 0 ? (
                            <TableRow className="border-slate-800">
                                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                    No entries found.
                                </TableCell>
                            </TableRow>

                        ) : (
                            entries.map((entry) => {
                                if (entry.isHeader) {
                                    return (
                                        <TableRow key={entry.id} className="bg-slate-900/80 hover:bg-slate-900/80 border-slate-700">
                                            <TableCell colSpan={6} className="text-foreground font-bold py-3 pl-4">
                                                {entry.headerLabel}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }

                                return (
                                    <TableRow key={entry.id} className="border-slate-800 hover:bg-slate-900/50">
                                        <TableCell className="text-gray-300">{entry.date}</TableCell>
                                        <TableCell className="text-gray-300">{entry.label}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${entry.type === 'revenue'
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : 'bg-red-500/10 text-red-400'
                                                    }`}>
                                                    {entry.type === 'revenue' ? formT.income : formT.expense}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                                    {entry.isRecurring ? (language === 'fr' ? 'Récurrent' : 'Recurring') : (language === 'fr' ? 'Ponctuel' : 'One-time')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize text-gray-300">{entry.category}</TableCell>
                                        <TableCell className="text-right font-mono text-gray-300">
                                            {entry.amount.toFixed(2)} €
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-foreground hover:bg-slate-800"
                                                    onClick={() => setEditingEntry(entry)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                    onClick={() => setDeleteId({
                                                        monthId: entry.monthId,
                                                        entryId: entry.id,
                                                        type: entry.type
                                                    })}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-slate-900 border-slate-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">{translations.en.common.error}</AlertDialogTitle> {/* Using common error/confirmation title would be better if added, sticking to EN for generic title or add 'Confirmation' key */}
                        <AlertDialogDescription className="text-gray-300">
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="text-black bg-white hover:bg-gray-200">{common.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-foreground hover:bg-red-700">
                            {common.delete || "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
                <DialogContent className="bg-slate-900 border-slate-800 text-foreground sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Edit Entry</DialogTitle>
                        <DialogDescription className="text-gray-300">
                            Make changes to your financial entry here.
                        </DialogDescription>
                    </DialogHeader>
                    {editingEntry && (
                        <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right text-gray-300">
                                    {t.date}
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={editingEntry.date}
                                    onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                                    className="col-span-3 bg-slate-800 border-slate-700 text-foreground"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="label" className="text-right text-gray-300">
                                    {t.description}
                                </Label>
                                <Input
                                    id="label"
                                    value={editingEntry.label}
                                    onChange={(e) => setEditingEntry({ ...editingEntry, label: e.target.value })}
                                    className="col-span-3 bg-slate-800 border-slate-700 text-foreground"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right text-gray-300">
                                    {t.amount}
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={editingEntry.amount}
                                    onChange={(e) => setEditingEntry({ ...editingEntry, amount: parseFloat(e.target.value) || 0 })}
                                    className="col-span-3 bg-slate-800 border-slate-700 text-foreground"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right text-gray-300">
                                    {t.category}
                                </Label>
                                <div className="col-span-3">
                                    <Select
                                        value={editingEntry.category}
                                        onValueChange={(val) => setEditingEntry({ ...editingEntry, category: val as ExpenseCategory })}
                                        disabled={editingEntry.type === 'revenue'}
                                    >
                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-foreground">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-foreground">
                                            <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                            <SelectItem value="API IA">API IA</SelectItem>
                                            <SelectItem value="Auth & Data">Auth & Data</SelectItem>
                                            <SelectItem value="Observabilité">Observabilité</SelectItem>
                                            <SelectItem value="Email">Email</SelectItem>
                                            <SelectItem value="Outils SaaS">Outils SaaS</SelectItem>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                            <SelectItem value="Divers">Divers</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-white text-black hover:bg-gray-200">{formT.submit}</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
