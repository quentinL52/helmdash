'use client';

import { useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFounderStore } from '@/store/founder-store';
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfQuarter,
    endOfQuarter,
    startOfYear,
    endOfYear,
    eachWeekOfInterval,
    eachMonthOfInterval,
    eachQuarterOfInterval,
    eachYearOfInterval,
    isSameWeek,
    isSameMonth,
    isSameQuarter,
    isSameYear,
    addMonths,
    subMonths,
} from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { translations } from '@/lib/translations';

export type Timeframe = 'week' | 'month' | 'quarter' | 'year';

interface RunwayChartProps {
    timeframe: Timeframe;
    setTimeframe: (timeframe: Timeframe) => void;
}

export function RunwayChart({ timeframe, setTimeframe }: RunwayChartProps) {
    const { finance, language } = useFounderStore();
    const t = translations[language]?.finance;
    const formT = translations[language]?.finance?.form;
    // const [timeframe, setTimeframe] = useState<Timeframe>('month'); // Removed internal state

    const data = useMemo(() => {
        // 1. Flatten all transactions with dates
        const transactions = finance.monthlyEntries.flatMap(month => {
            const expenses = (month.expenses || []).map(e => ({
                date: new Date(e.date || `${month.month}-01`),
                amount: e.amount,
                type: 'expense'
            }));
            const incomes = (month.incomes || []).map(i => ({
                date: new Date(i.date || `${month.month}-01`),
                amount: i.amount,
                type: 'income'
            }));
            return [...expenses, ...incomes];
        });

        // 2. Define Time Range (e.g., Past 6 months to Future 12 months)
        // Or dynamically based on data? Let's do dynamic but ensure at least +/- 6 months context
        const today = new Date();
        const start = subMonths(today, 6);
        const end = addMonths(today, 12);

        // 3. Generate Intervals
        let intervals: Date[];
        switch (timeframe) {
            case 'week':
                intervals = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
                break;
            case 'month':
                intervals = eachMonthOfInterval({ start, end });
                break;
            case 'quarter':
                intervals = eachQuarterOfInterval({ start, end });
                break;
            case 'year':
                intervals = eachYearOfInterval({ start, end });
                break;
        }

        // 4. Aggregate Data per Interval
        const aggregated = intervals.map(intervalStart => {
            let label = '';
            let isSameFn: (dateLeft: Date, dateRight: Date) => boolean;

            switch (timeframe) {
                case 'week':
                    label = format(intervalStart, 'd MMM');
                    isSameFn = (d1, d2) => isSameWeek(d1, d2, { weekStartsOn: 1 });
                    break;
                case 'month':
                    label = format(intervalStart, 'MMM yy');
                    isSameFn = isSameMonth;
                    break;
                case 'quarter':
                    label = `Q${Math.floor((intervalStart.getMonth() + 3) / 3)} ${format(intervalStart, 'yy')}`;
                    isSameFn = isSameQuarter;
                    break;
                case 'year':
                    label = format(intervalStart, 'yyyy');
                    isSameFn = isSameYear;
                    break;
            }

            // Sum transactions for this interval
            const intervalTransactions = transactions.filter(t => isSameFn(t.date, intervalStart));
            const expenseSum = intervalTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            const incomeSum = intervalTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                date: intervalStart,
                label,
                expense: expenseSum,
                income: incomeSum,
                netFlow: incomeSum - expenseSum,
            };
        });

        // 5. Calculate Cash Balance (Backwards and Forwards from Today)
        // Find interval containing today
        let currentBalance = finance.cashAvailable;

        // We need to distribute this balance.
        // Actually, it's easier to sort chronologically (already sorted by intervals)
        // and find the index of "now".

        // But wait, "cashAvailable" is the CURRENT balance. 
        // So for past intervals, Balance[prev] = Balance[curr] - NetFlow[curr] (reverse logic?)
        // No, Balance[End of T] = Balance[Start of T] + NetFlow[T]

        // Let's assume finance.cashAvailable is the balance at the START of 'today's' interval?
        // Or roughly now.

        // Let's create a running balance array.
        // We'll walk forward from the earliest date, but we need an initial anchor.
        // Anchor: The Balance at the moment of 'today' is finance.cashAvailable.

        // Let's identify the interval closest to Today.
        const now = new Date();
        // Just use a simple accumulation and offset.

        // Calculate cumulative Net Flow relative to start of array
        let cumulativeFlow = 0;
        const withCumulative = aggregated.map(item => {
            cumulativeFlow += item.netFlow;
            return { ...item, cumulativeRelative: cumulativeFlow };
        });

        // Find the "cumulativeRelative" value for Today's interval
        // We probably want the balance at the END of today's interval to match cashAvailable?
        // Or start? Let's say end.

        const todayIntervalIndex = aggregated.findIndex(item =>
            timeframe === 'week' ? isSameWeek(item.date, now, { weekStartsOn: 1 }) :
                timeframe === 'month' ? isSameMonth(item.date, now) :
                    timeframe === 'quarter' ? isSameQuarter(item.date, now) :
                        isSameYear(item.date, now)
        );

        let offset = 0;
        if (todayIntervalIndex >= 0) {
            const todayItem = withCumulative[todayIntervalIndex];
            // We want: todayItem.cumulativeRelative + offset = finance.cashAvailable
            offset = finance.cashAvailable - todayItem.cumulativeRelative;
        } else {
            // Fallback if today is out of range (unlikely with +/- logic)
            offset = finance.cashAvailable;
        }

        return withCumulative.map(item => ({
            ...item,
            balance: item.cumulativeRelative + offset
        }));

    }, [finance, timeframe]);

    // Calculate Runway (Months) based on recent burn
    const runwayMonths = useMemo(() => {
        // Simple logic: Look at last 3 months average burn
        // Or just use the global store logic if we had one.
        // Let's use the 'month' aggregation from data if possible, or re-calculate

        // Let's grab last month's data specifically
        const today = new Date();
        const lastMonthDate = subMonths(today, 1);
        // We can reuse the flattened transactions logic broadly
        const transactions = finance.monthlyEntries.flatMap(month => {
            const expenses = (month.expenses || []).map(e => ({ amount: e.amount, date: new Date(e.date || `${month.month}-01`), type: 'expense' }));
            const incomes = (month.incomes || []).map(i => ({ amount: i.amount, date: new Date(i.date || `${month.month}-01`), type: 'income' }));
            return [...expenses, ...incomes];
        });

        const lastMonthTrans = transactions.filter(t => isSameMonth(t.date, lastMonthDate));
        const expenses = lastMonthTrans.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
        const incomes = lastMonthTrans.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);

        const burn = expenses - incomes;
        if (burn <= 0) return '∞';
        return (finance.cashAvailable / burn).toFixed(1);

    }, [finance]);

    // Calculate Today's Label for ReferenceLine
    const todayLabel = useMemo(() => {
        const now = new Date();
        switch (timeframe) {
            case 'week':
                const start = startOfWeek(now, { weekStartsOn: 1 });
                return format(start, 'd MMM');
            case 'month':
                return format(now, 'MMM yy');
            case 'quarter':
                return `Q${Math.floor((now.getMonth() + 3) / 3)} ${format(now, 'yy')}`;
            case 'year':
                return format(now, 'yyyy');
        }
    }, [timeframe]);

    return (
        <Card className="col-span-4 bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="flex justify-between items-center text-white">
                    <span>{t.chart.title}</span>
                    <div className="flex items-center gap-4">
                        <Select value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
                            <SelectTrigger className="w-[120px] bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder={t.chart.timeframe.month} />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="week">{t.chart.timeframe.week}</SelectItem>
                                <SelectItem value="month">{t.chart.timeframe.month}</SelectItem>
                                <SelectItem value="quarter">{t.chart.timeframe.quarter}</SelectItem>
                                <SelectItem value="year">{t.chart.timeframe.year}</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className={`text-2xl font-bold ${Number(runwayMonths) < 3 && runwayMonths !== '∞' ? 'text-red-500' : 'text-green-500'}`}>
                            {runwayMonths} {t.chart.months}
                        </span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis
                                dataKey="label"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                formatter={(value: number) => [`${value.toFixed(0)} €`, '']}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="income" name={formT.income} fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            <Bar yAxisId="left" dataKey="expense" name={formT.expense} fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="balance"
                                name={t.chart.cash}
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#3b82f6' }}
                                activeDot={{ r: 6 }}
                            />
                            <ReferenceLine yAxisId="left" x={todayLabel} stroke="#fbbf24" strokeDasharray="3 3" label={{ position: 'top', value: t.chart.today, fill: '#fbbf24', fontSize: 12 }} />
                            <ReferenceLine yAxisId="right" y={0} stroke="#ef4444" strokeDasharray="3 3" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
