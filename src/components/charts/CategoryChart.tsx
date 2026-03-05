import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { apiFetch } from '../../lib/api';

interface CategoryData {
    name: string;
    value: number;
    [key: string]: string | number;
}

const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--accent))',
    '#3b82f6',
    '#8b5cf6',
    '#f59e0b',
    '#ef4444',
    '#10b981',
    '#ec4899',
];


const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 rounded-lg border border-border shadow-xl">
                <p className="text-sm font-medium text-muted-foreground mb-1">{payload[0].name}</p>
                <p className="text-lg font-bold" style={{ color: payload[0].payload.fill }}>
                    ${payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function CategoryChart() {
    const [data, setData] = useState<CategoryData[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const txns: Array<{ category: string; amount: number; type: string }> = await apiFetch('/transactions');

                // Aggregate expenses by category
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
            } catch {
                // leave empty
            }
        }
        load();
    }, []);

    return (
        <Card className="col-span-3 border-none bg-card/40 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
