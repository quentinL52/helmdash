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
import { useGamification } from '@/hooks/use-gamification';
import { toast } from '@/hooks/use-toast';

const expenseSchema = z.object({
    label: z.string().min(2, "Label must be at least 2 characters"),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    category: z.string(),
    type: z.enum(['expense', 'revenue']),
    date: z.string().min(1, "Date is required"),
    frequency: z.enum(['monthly', 'annual', 'one-time']).default('monthly')
});

export function FinanceEntryForm() {
    const finance = useFounderStore(s => s.finance);
    const updateCashAvailable = useFounderStore(s => s.updateCashAvailable);
    const addEntry = useFounderStore(s => s.addEntry);
    
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
            date: format(new Date(), 'yyyy-MM-dd'),
            frequency: 'monthly'
        },
    });

    const { awardXP } = useGamification();

    const onSubmit = (values: z.infer<typeof expenseSchema>) => {
        addEntry({
            label: values.label,
            amount: values.amount,
            category: values.type === 'expense' ? values.category : 'other',
            frequency: values.frequency as any,
            type: values.type === 'revenue' ? 'income' : 'expense',
            date: values.date
        });

        if (values.type === 'revenue' && values.amount > 0) {
            awardXP('first_revenue');
        }

        
        form.reset({
            label: '',
            amount: 0,
            category: 'Divers',
            type: 'expense',
            date: values.date,
            frequency: 'one-time'
        });
        toast({
            title: language === 'fr' ? 'Succès' : 'Success',
            description: language === 'fr' ? 'Opération ajoutée avec succès' : 'Entry added successfully',
        });
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
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
                                className=""
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={processCashUpdate} className="w-full bg-white text-black hover:bg-gray-200">Update Balance</Button>
                </CardFooter>
            </Card>

            <Card className="col-span-4">
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
                                                <Input type="date" {...field} className="" />
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
                                                    <SelectTrigger className="">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="">
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
                                                <Input type="number" {...field} className="" />
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
                                                <Input placeholder="e.g. Hosting" {...field} className="" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="frequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground">{language === 'fr' ? 'Fréquence' : 'Frequency'}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="">
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="">
                                                    <SelectItem value="monthly">{language === 'fr' ? 'Mensuel' : 'Monthly'}</SelectItem>
                                                    <SelectItem value="annual">{language === 'fr' ? 'Annuel' : 'Annual'}</SelectItem>
                                                    <SelectItem value="one-time">{language === 'fr' ? 'Ponctuel' : 'One-time'}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground">{t.category}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.watch('type') === 'revenue'}>
                                                <FormControl>
                                                    <SelectTrigger className="">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="">
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
