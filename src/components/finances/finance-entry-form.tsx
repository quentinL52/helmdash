'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useFounderStore, ExpenseCategory } from '@/store/founder-store';
import { format } from 'date-fns';
import { translations } from '@/lib/translations';

const expenseSchema = z.object({
    label: z.string().min(2, "Label must be at least 2 characters"),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    category: z.string(),
    type: z.enum(['expense', 'revenue']),
    date: z.string().min(1, "Date is required"), // Add date validation
});

export function FinanceEntryForm() {
    const finance = useFounderStore(s => s.finance);
    const updateCashAvailable = useFounderStore(s => s.updateCashAvailable);
    const addMonthlyEntry = useFounderStore(s => s.addMonthlyEntry);
    const updateMonthlyEntry = useFounderStore(s => s.updateMonthlyEntry);
    const language = useFounderStore(s => s.language);
    const t = translations[language].finance.form;
    const [cashInput, setCashInput] = useState(finance.cashAvailable.toString());

    const processCashUpdate = () => {
        const val = parseFloat(cashInput);
        if (!isNaN(val)) {
            updateCashAvailable(val);
        }
    };

    const form = useForm<z.infer<typeof expenseSchema>>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            label: '',
            amount: 0,
            category: 'Divers',
            type: 'expense',
            date: format(new Date(), 'yyyy-MM-dd'), // Default to today (local time)
        },
    });

    const onSubmit = (values: z.infer<typeof expenseSchema>) => {
        // Parse date string directly to avoid timezone issues
        const [year, monthStr] = values.date.split('-');
        const month = parseInt(monthStr, 10);
        const currentMonthKey = `${year}-${monthStr}`;

        // Check if entry exists for this month
        const existingEntry = finance.monthlyEntries.find(e => e.month === currentMonthKey);

        if (existingEntry) {
            // Update existing
            if (values.type === 'expense') {
                const newExpenses = [
                    ...(existingEntry.expenses || []),
                    {
                        id: crypto.randomUUID(),
                        label: values.label,
                        amount: values.amount,
                        category: values.category as ExpenseCategory,
                        isRecurring: true, // Default for this form
                        date: values.date
                    }
                ];
                updateMonthlyEntry(existingEntry.id, { expenses: newExpenses });
            } else {
                // Revenue
                const newIncomes = [
                    ...(existingEntry.incomes || []),
                    {
                        id: crypto.randomUUID(),
                        label: values.label,
                        amount: values.amount,
                        category: 'other' as ExpenseCategory, // Revenue category default
                        isRecurring: true, // Default for this form
                        date: values.date
                    }
                ];
                updateMonthlyEntry(existingEntry.id, {
                    revenue: existingEntry.revenue + values.amount,
                    incomes: newIncomes
                });
            }
        } else {
            // Create new
            const newEntry = {
                id: crypto.randomUUID(),
                month: currentMonthKey,
                revenue: values.type === 'revenue' ? values.amount : 0,
                expenses: values.type === 'expense' ? [
                    {
                        id: crypto.randomUUID(),
                        label: values.label,
                        amount: values.amount,
                        category: values.category as ExpenseCategory,
                        isRecurring: true,
                        date: values.date
                    }
                ] : [],
                incomes: values.type === 'revenue' ? [
                    {
                        id: crypto.randomUUID(),
                        label: values.label,
                        amount: values.amount,
                        category: 'other' as ExpenseCategory,
                        isRecurring: true,
                        date: values.date
                    }
                ] : []
            };
            addMonthlyEntry(newEntry);
        }

        form.reset({
            label: '',
            amount: 0,
            category: 'Divers',
            type: values.type, // Keep last type
            date: values.date // Keep last date
        });
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3 bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-foreground">{translations[language].finance.chart.cash}</CardTitle>
                    <CardDescription className="text-gray-300">
                        Update your current bank balance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="cash" className="text-foreground">{t.amount} (€)</Label>
                            <Input
                                id="cash"
                                type="number"
                                value={cashInput}
                                onChange={(e) => setCashInput(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-foreground"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={processCashUpdate} className="w-full bg-white text-black hover:bg-gray-200">Update Balance</Button>
                </CardFooter>
            </Card>

            <Card className="col-span-4 bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-foreground">{t.title}</CardTitle>
                    <CardDescription className="text-gray-300">Add a recurring expense or revenue for this month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground">{t.date}</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="bg-slate-800 border-slate-700 text-foreground" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground">{t.type}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-foreground">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-slate-800 border-slate-700 text-foreground">
                                                    <SelectItem value="expense">{t.expense}</SelectItem>
                                                    <SelectItem value="revenue">{t.income}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground">{t.amount} (€)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-slate-800 border-slate-700 text-foreground" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="label"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground">{t.description}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Hosting" {...field} className="bg-slate-800 border-slate-700 text-foreground" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground">{t.category}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.watch('type') === 'revenue'}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-foreground">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200">
                                <Plus className="mr-2 h-4 w-4" /> {t.submit}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
