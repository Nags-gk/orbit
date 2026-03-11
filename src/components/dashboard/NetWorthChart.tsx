import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNetWorth } from '../../hooks/useNetWorth';

export function NetWorthChart() {
    const { data, isLoading } = useNetWorth();

    if (isLoading) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
                <div className="h-4 w-32 bg-secondary rounded mb-4" />
                <div className="h-48 bg-secondary/50 rounded" />
            </div>
        );
    }

    if (!data) return null;

    const { current, history } = data;
    const chartData = history.map(h => ({
        date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        netWorth: h.netWorth,
        assets: h.totalAssets,
        liabilities: h.totalLiabilities,
    }));

    // If only one data point, add a "start" point for visual
    if (chartData.length === 1) {
        chartData.unshift({ date: 'Start', netWorth: 0, assets: 0, liabilities: 0 });
    }

    const isPositive = current.netWorth > 0;
    const isNegative = current.netWorth < 0;

    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Net Worth</p>
                    <div className="flex items-center gap-2 mt-1">
                        <h3 className="text-3xl font-bold tracking-tight">
                            ${Math.abs(current.netWorth).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                        {isPositive ? (
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        ) : isNegative ? (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                        ) : (
                            <Minus className="w-5 h-5 text-muted-foreground" />
                        )}
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Assets</span>
                        <span className="font-semibold text-emerald-500">${current.totalAssets.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Liabilities</span>
                        <span className="font-semibold text-red-400">${current.totalLiabilities.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '12px',
                                fontSize: '12px',
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
                        />
                        <Area
                            type="monotone"
                            dataKey="netWorth"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2.5}
                            fill="url(#netWorthGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
