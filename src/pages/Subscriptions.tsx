import { useState, useEffect, useCallback } from 'react';
import { DollarSign, RefreshCw, TrendingUp, Calendar, Zap, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiFetch } from '../lib/api';

interface Subscription {
    id: number;
    name: string;
    cost: number;
    category: string;
    renewalDate: string;
    active: boolean;
}

interface SubOptData {
    recommendations: Array<{
        subscription: string;
        cost: number;
        type: string;
        icon: string;
        message: string;
    }>;
    totalMonthly: number;
    totalAnnual: number;
    subscriptionCount: number;
}


export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [optimization, setOptimization] = useState<SubOptData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [subData, optData] = await Promise.all([
                apiFetch('/subscriptions'),
                apiFetch('/analytics/subscriptions/optimization'),
            ]);
            setSubscriptions(subData);
            setOptimization(optData);
        } catch {
            // Network error — show empty state
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const totalMonthlyCost = subscriptions.reduce((acc, sub) => acc + sub.cost, 0);
    const totalAnnualCost = totalMonthlyCost * 12;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
                    <p className="text-muted-foreground">
                        Manage your recurring subscriptions and expenses.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors border border-border"
                    title="Refresh"
                >
                    <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Monthly Cost</span>
                        <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-primary">${totalMonthlyCost.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Across {subscriptions.filter(s => s.active).length} active subscriptions
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-foreground/5 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Annual Projection</span>
                        <Calendar className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">${totalAnnualCost.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Projected yearly cost</p>
                </div>
                <div className="rounded-xl border border-border bg-foreground/5 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">AI Recommendations</span>
                        <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{optimization?.recommendations.length || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Optimization suggestions</p>
                </div>
            </div>

            {/* AI Optimization Alerts */}
            {optimization && optimization.recommendations.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
                    </div>
                    <div className="space-y-2">
                        {optimization.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-foreground/5">
                                <span className="text-lg">{rec.icon}</span>
                                <p className="text-sm text-foreground flex-1">{rec.message}</p>
                                <span className="text-sm font-semibold text-amber-400">${rec.cost.toFixed(2)}/mo</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Subscription Cards */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {subscriptions.map((sub) => (
                        <div
                            key={sub.id}
                            className="rounded-xl border border-border bg-foreground/5 p-5 hover:bg-foreground/[0.07] hover:border-border/80 transition-all duration-200"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">{sub.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">{sub.category}</p>
                                </div>
                                <span className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                                    sub.active
                                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                        : "bg-red-500/20 text-red-600 dark:text-red-400"
                                )}>
                                    {sub.active ? 'Active' : 'Cancelled'}
                                </span>
                            </div>

                            <div className="mt-4 flex items-end justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-foreground">${sub.cost.toFixed(2)}</p>
                                    <p className="text-[10px] text-muted-foreground">per month</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Renews {sub.renewalDate}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    ${(sub.cost * 12).toFixed(2)}/year
                                </p>
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground">
                                        {((sub.cost / totalMonthlyCost) * 100).toFixed(0)}% of total
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
