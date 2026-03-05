import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ForecastData } from '../../hooks/useInsights';

interface PredictionChartProps {
    data: ForecastData;
    className?: string;
}

export function PredictionChart({ data, className }: PredictionChartProps) {
    // Combine historical + forecast into a single dataset
    const chartData = [
        ...data.historical.map(p => ({
            date: formatDate(p.date),
            actual: p.amount,
            predicted: null as number | null,
        })),
        // Bridge point — last historical connects to first forecast
        ...(data.historical.length > 0 && data.forecast.length > 0 ? [{
            date: formatDate(data.forecast[0].date),
            actual: null as number | null,
            predicted: data.forecast[0].amount,
        }] : []),
        ...data.forecast.slice(1).map(p => ({
            date: formatDate(p.date),
            actual: null as number | null,
            predicted: p.amount,
        })),
    ];

    const trendIcon = data.trend === 'increasing'
        ? <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
        : data.trend === 'decreasing'
            ? <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            : <Minus className="w-4 h-4 text-muted-foreground" />;

    const trendColor = data.trend === 'increasing'
        ? 'text-red-600 dark:text-red-400'
        : data.trend === 'decreasing'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-muted-foreground';

    return (
        <div className={cn("rounded-xl border border-border bg-foreground/5 p-5 flex flex-col", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Spending Forecast</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">30-day projection based on recent trends</p>
                </div>
                <div className="flex items-center gap-2">
                    {trendIcon}
                    <span className={cn("text-xs font-medium capitalize", trendColor)}>
                        {data.trend}
                    </span>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-lg bg-foreground/5 border border-border px-3 py-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Daily Avg</p>
                    <p className="text-lg font-bold text-foreground">${data.dailyAverage.toFixed(0)}</p>
                </div>
                <div className="rounded-lg bg-foreground/5 border border-border px-3 py-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Projected/Mo</p>
                    <p className="text-lg font-bold text-foreground">${data.predictedMonthlyTotal.toLocaleString()}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[250px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.2} vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#888888' }}
                            axisLine={{ stroke: '#888888', strokeOpacity: 0.2 }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#888888' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                color: 'hsl(var(--foreground))',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                            formatter={(value: any, name: any) => [
                                typeof value === 'number' ? `$${value.toFixed(2)}` : '—',
                                name === 'actual' ? 'Actual' : 'Predicted'
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="actual"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fill="url(#actualGradient)"
                            connectNulls={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="predicted"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            fill="url(#predictedGradient)"
                            connectNulls={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded-full bg-primary" /> Actual
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded-full bg-amber-500 border-dashed" /> Predicted
                </span>
            </div>
        </div>
    );
}

function formatDate(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
