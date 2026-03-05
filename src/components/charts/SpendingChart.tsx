import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { apiFetch } from '../../lib/api';

interface SpendingPoint {
    name: string;
    amount: number;
}


const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 rounded-lg border border-border shadow-xl">
                <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
                <p className="text-lg font-bold text-primary">
                    ${payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function SpendingChart() {
    const [data, setData] = useState<SpendingPoint[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const txns: Array<{ date: string; amount: number; type: string }> = await apiFetch('/transactions');

                // Group expenses by month
                const monthMap: Record<string, number> = {};
                txns.forEach(tx => {
                    if (tx.type === 'expense') {
                        const d = new Date(tx.date);
                        const key = d.toLocaleString('default', { month: 'short' });
                        monthMap[key] = (monthMap[key] || 0) + tx.amount;
                    }
                });

                // Sort by month order
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const points = months
                    .filter(m => m in monthMap)
                    .map(m => ({ name: m, amount: Math.round(monthMap[m]) }));

                if (points.length > 0) setData(points);
                else setData([{ name: 'This Month', amount: Math.round(Object.values(monthMap).reduce((a, b) => a + b, 0)) }]);
            } catch {
                // Fallback — leave empty
            }
        }
        load();
    }, []);

    return (
        <Card className="col-span-4 border-none bg-card/40 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Spending History</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorAmount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
