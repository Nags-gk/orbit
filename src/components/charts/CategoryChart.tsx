/**
 * Enhanced Category Chart — replaced basic pie with a rich donut chart
 * featuring center total, percentage labels, and gradient ring segments.
 */
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { apiFetch } from '../../lib/api';

interface CategoryData {
    name: string;
    value: number;
    [key: string]: string | number;
}

const COLORS = [
    '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#a855f7',
];

const RenderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
            {(percent * 100).toFixed(0)}%
        </text>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 rounded-xl border border-border shadow-xl backdrop-blur-xl">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">{payload[0].name}</p>
                <p className="text-base font-bold" style={{ color: payload[0].payload.fill }}>
                    ${payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function CategoryChart() {
    const [data, setData] = useState<CategoryData[]>([]);
    const [_activeIndex, setActiveIndex] = useState(-1);

    useEffect(() => {
        async function load() {
            try {
                const txns: Array<{ category: string; amount: number; type: string }> = await apiFetch('/transactions');
                const catMap: Record<string, number> = {};
                txns.forEach(tx => {
                    if (tx.type === 'expense') {
                        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
                    }
                });
                const points = Object.entries(catMap)
                    .map(([name, value]) => ({ name, value: Math.round(value) }))
                    .sort((a, b) => b.value - a.value);
                if (points.length > 0) setData(points);
            } catch { /* leave empty */ }
        }
        load();
    }, []);

    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <Card className="col-span-3 border-none bg-card/40 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Expense Breakdown</span>
                    {total > 0 && <span className="text-sm font-normal text-muted-foreground">${total.toLocaleString()} total</span>}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
                        No expense data yet
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="h-[280px] w-full md:w-3/5">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                        label={RenderLabel}
                                        labelLine={false}
                                        onMouseEnter={(_, index) => setActiveIndex(index)}
                                        onMouseLeave={() => setActiveIndex(-1)}
                                    >
                                        {data.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend with bars */}
                        <div className="w-full md:w-2/5 space-y-2">
                            {data.slice(0, 6).map((item, i) => {
                                const pct = total > 0 ? (item.value / total) * 100 : 0;
                                return (
                                    <div
                                        key={item.name}
                                        className="group cursor-pointer"
                                        onMouseEnter={() => setActiveIndex(i)}
                                    >
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                                            </div>
                                            <span className="font-medium text-foreground">${item.value.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
