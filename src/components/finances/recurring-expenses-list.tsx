'use client';
import { getMonthlyEntries } from '@/lib/finance-utils';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFounderStore, ExpenseItem } from '@/store/founder-store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function RecurringExpensesList() {
    const finance = useFounderStore(s => s.finance);
    const deleteEntry = useFounderStore(s => s.deleteEntry);

    const { recurringExpenses, latestMonthId } = useMemo(() => {
        const today = new Date();
        const currentMonthStr = format(today, 'yyyy-MM');
        
        const sortedEntries = [...getMonthlyEntries(finance.entries)].sort((a, b) => b.month.localeCompare(a.month));
        const latestEntry = sortedEntries.find(e => e.month === currentMonthStr) || sortedEntries[0];

        if (!latestEntry) return { recurringExpenses: [], latestMonthId: null };

        const activeRecurring = (latestEntry.expenses || []).filter(e => {
            const isMonthly = e.frequency === 'monthly' ;
            const isAnnual = e.frequency === 'annual';
            return isMonthly || isAnnual;
        });

        return { recurringExpenses: activeRecurring, latestMonthId: latestEntry.id };
    }, [finance]);

    if (recurringExpenses.length === 0) {
        return null; // Don't show if empty
    }

    const handleDelete = (id: string) => {
        deleteEntry(id);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-foreground">Dépenses Récurrentes Actives</CardTitle>
                <CardDescription className="text-gray-300">
                    Abonnements et charges fixes du mois courant
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-slate-400">Description</TableHead>
                            <TableHead className="text-slate-400">Catégorie</TableHead>
                            <TableHead className="text-slate-400">Fréquence</TableHead>
                            <TableHead className="text-right text-slate-400">Montant</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recurringExpenses.map((expense) => {
                            const isAnnual = expense.frequency === 'annual';
                            const freqLabel = isAnnual ? 'Annuel' : 'Mensuel';
                            const badgeColor = isAnnual ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-blue-500/20 text-blue-400 border-blue-500/50';

                            return (
                                <TableRow key={expense.id}>
                                    <TableCell className="font-medium text-slate-200">
                                        {expense.label}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-slate-300 border-slate-700">
                                            {expense.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={badgeColor}>
                                            {freqLabel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-slate-200">
                                        <div className="font-medium">{expense.amount} €</div>
                                        {isAnnual && (
                                            <div className="text-xs text-slate-500">
                                                soit {(expense.amount / 12).toFixed(1)} € / mois
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                                            onClick={() => handleDelete(expense.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
