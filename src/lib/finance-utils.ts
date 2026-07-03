import { ExpenseItem } from '@/store/founder-store';

export interface MonthlyFinance {
    id: string;
    month: string; // "YYYY-MM"
    revenue: number;
    expenses: ExpenseItem[];
    incomes: ExpenseItem[];
    notes?: string;
}

export function getMonthlyEntries(entries: ExpenseItem[]): MonthlyFinance[] {
    const monthlyMap: Record<string, MonthlyFinance> = {};

    entries.forEach(entry => {
        if (!entry.date) return;
        // Parse date and extract YYYY-MM
        const date = new Date(entry.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = {
                id: crypto.randomUUID(), // Transient ID
                month: monthKey,
                revenue: 0,
                expenses: [],
                incomes: [],
            };
        }

        if (entry.type === 'expense') {
            monthlyMap[monthKey].expenses.push(entry);
        } else if (entry.type === 'income') {
            monthlyMap[monthKey].incomes.push(entry);
            monthlyMap[monthKey].revenue += entry.amount;
        }
    });

    return Object.values(monthlyMap).sort((a, b) => b.month.localeCompare(a.month));
}
