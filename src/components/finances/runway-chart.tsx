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
    const finance = useFounderStore(s => s.finance);
    const language = useFounderStore(s => s.language);
    const t = translations[language]?.finance;
    const formT = translations[language]?.finance?.form;

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
                date: intervalStart.getTime(), // Use timestamp for XAxis
                label,
                expense: expenseSum,
                income: incomeSum,
                netFlow: incomeSum - expenseSum,
            };
        });

        // 5. Calculate Cash Balance
        // Use cumulative flow and adjust so that the interval containing "now" matches cashAvailable
        const now = new Date();
        let cumulativeFlow = 0;
        const withCumulative = aggregated.map(item => {
            cumulativeFlow += item.netFlow;
            return { ...item, cumulativeRelative: cumulativeFlow };
        });

        const todayIntervalIndex = aggregated.findIndex(item => {
            const itemDate = new Date(item.date);
            return timeframe === 'week' ? isSameWeek(itemDate, now, { weekStartsOn: 1 }) :
                timeframe === 'month' ? isSameMonth(itemDate, now) :
                    timeframe === 'quarter' ? isSameQuarter(itemDate, now) :
                        isSameYear(itemDate, now);
        });

        let offset = 0;
        if (todayIntervalIndex >= 0) {
            const todayItem = withCumulative[todayIntervalIndex];
            offset = finance.cashAvailable - todayItem.cumulativeRelative;
        } else {
            offset = finance.cashAvailable;
        }

        return withCumulative.map(item => ({
            ...item,
            balance: item.cumulativeRelative + offset
        }));

    }, [finance, timeframe]);

    // Calculate Runway (Months)
    const runwayMonths = useMemo(() => {
        const today = new Date();
        const lastMonthDate = subMonths(today, 1);
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

    // Format X axis tick based on timeframe
    const formatXAxis = (tickItem: number) => {
        const date = new Date(tickItem);
        switch (timeframe) {
            case 'week': return format(date, 'd MMM');
            case 'month': return format(date, 'MMM yy');
            case 'quarter': return `Q${Math.floor((date.getMonth() + 3) / 3)} ${format(date, 'yy')}`;
            case 'year': return format(date, 'yyyy');
        }
    };

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
                                dataKey="date"
                                type="number"
                                scale="time"
                                domain={['auto', 'auto']}
                                tickFormatter={formatXAxis}
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
                                labelFormatter={(label) => formatXAxis(label)}
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
                            <ReferenceLine
                                yAxisId="left"
                                x={new Date().getTime()}
                                stroke="#fbbf24"
                                strokeDasharray="3 3"
                                label={{ position: 'top', value: t.chart.today, fill: '#fbbf24', fontSize: 12 }}
                            />
                            <ReferenceLine yAxisId="right" y={0} stroke="#ef4444" strokeDasharray="3 3" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
