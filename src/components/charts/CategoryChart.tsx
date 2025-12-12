import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const data = [
    { name: 'Food', value: 400 },
    { name: 'Transport', value: 300 },
    { name: 'Utilities', value: 300 },
    { name: 'Entertainment', value: 200 },
];

const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--accent))',
    '#3b82f6', // Blue
    '#8b5cf6'  // Violet
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 rounded-lg border border-white/10 shadow-xl">
                <p className="text-sm font-medium text-muted-foreground mb-1">{payload[0].name}</p>
                <p className="text-lg font-bold" style={{ color: payload[0].payload.fill }}>
                    ${payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

export function CategoryChart() {
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

