
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, className }: StatsCardProps) {
    return (
        <Card className={cn(
            "hover:shadow-[0_0_30px_rgba(var(--primary),0.1)] transition-all duration-500 relative overflow-hidden group",
            className
        )}>
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4 text-primary glow-icon" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <p className={cn("text-xs mt-1 font-medium", trendUp ? "text-green-400" : trendUp === false ? "text-red-400" : "text-primary/70")}>
                        {trend}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

