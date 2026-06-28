import { performance } from 'node:perf_hooks';

// Mock data
const today = new Date();
const end = new Date(today);
end.setMonth(today.getMonth() + 24); // 24 months

const futureMonths = [];
for (let i = 1; i <= 24; i++) {
    const d = new Date(today);
    d.setMonth(today.getMonth() + i);
    futureMonths.push(d);
}

const latestEntry = {
    month: '2024-01',
    expenses: Array.from({ length: 1000 }).map((_, i) => ({
        id: `e${i}`,
        date: `2024-01-${(i % 28) + 1}`,
        amount: Math.random() * 1000,
        frequency: i % 3 === 0 ? 'monthly' : i % 3 === 1 ? 'annual' : 'one-time',
        isRecurring: i % 3 !== 2
    })),
    incomes: Array.from({ length: 100 }).map((_, i) => ({
        id: `i${i}`,
        date: `2024-01-${(i % 28) + 1}`,
        amount: Math.random() * 5000,
        frequency: i % 2 === 0 ? 'monthly' : 'one-time',
        isRecurring: i % 2 === 0
    }))
};

function runOld() {
    const projectedTransactions: any[] = [];
    const latestExpenses = latestEntry.expenses;
    const latestIncomes = latestEntry.incomes;

    futureMonths.forEach(fm => {
        latestExpenses.forEach(e => {
            const isMonthly = e.frequency === 'monthly' || (e.isRecurring && !e.frequency);
            const isAnnual = e.frequency === 'annual';
            if (isMonthly || isAnnual) {
                const projectedDate = new Date(e.date || `${latestEntry.month}-01`);
                projectedDate.setFullYear(fm.getFullYear(), fm.getMonth());
                projectedTransactions.push({ date: projectedDate, amount: isAnnual ? e.amount / 12 : e.amount, type: 'expense' });
            }
        });
        latestIncomes.forEach(i => {
            const isMonthly = i.frequency === 'monthly' || (i.isRecurring && !i.frequency);
            const isAnnual = i.frequency === 'annual';
            if (isMonthly || isAnnual) {
                const projectedDate = new Date(i.date || `${latestEntry.month}-01`);
                projectedDate.setFullYear(fm.getFullYear(), fm.getMonth());
                projectedTransactions.push({ date: projectedDate, amount: isAnnual ? i.amount / 12 : i.amount, type: 'income' });
            }
        });
    });
    return projectedTransactions.length;
}

function runNew() {
    const projectedTransactions: any[] = [];
    const latestExpenses = latestEntry.expenses;
    const latestIncomes = latestEntry.incomes;

    const recurringExpenses = latestExpenses
        .filter(e => e.frequency === 'monthly' || (e.isRecurring && !e.frequency) || e.frequency === 'annual')
        .map(e => ({
            baseDate: new Date(e.date || `${latestEntry.month}-01`),
            amount: e.frequency === 'annual' ? e.amount / 12 : e.amount,
            type: 'expense' as const
        }));

    const recurringIncomes = latestIncomes
        .filter(i => i.frequency === 'monthly' || (i.isRecurring && !i.frequency) || i.frequency === 'annual')
        .map(i => ({
            baseDate: new Date(i.date || `${latestEntry.month}-01`),
            amount: i.frequency === 'annual' ? i.amount / 12 : i.amount,
            type: 'income' as const
        }));

    const allRecurring = [...recurringExpenses, ...recurringIncomes];

    futureMonths.forEach(fm => {
        const year = fm.getFullYear();
        const month = fm.getMonth();
        allRecurring.forEach(item => {
            const projectedDate = new Date(item.baseDate);
            projectedDate.setFullYear(year, month);
            projectedTransactions.push({
                date: projectedDate,
                amount: item.amount,
                type: item.type
            });
        });
    });
    return projectedTransactions.length;
}

// Warmup
for (let i = 0; i < 100; i++) {
    runOld();
    runNew();
}

let start = performance.now();
for (let i = 0; i < 1000; i++) {
    runOld();
}
const oldTime = performance.now() - start;

start = performance.now();
for (let i = 0; i < 1000; i++) {
    runNew();
}
const newTime = performance.now() - start;

console.log(`Old Time: ${oldTime.toFixed(2)}ms`);
console.log(`New Time: ${newTime.toFixed(2)}ms`);
console.log(`Improvement: ${((oldTime - newTime) / oldTime * 100).toFixed(2)}%`);
