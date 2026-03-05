import { useState, useEffect, useCallback } from 'react';
import {
    AlertTriangle, TrendingUp, Shield, RefreshCw, Brain,
    Calendar, Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { apiFetch } from '../lib/api';
import { PredictionChart } from '../components/ai/PredictionChart';
import type { ForecastData } from '../hooks/useInsights';

// ── Types ────────────────────────────────────────────────

interface Anomaly {
    id: number;
    description: string;
    amount: number;
    category: string;
    date: string;
    reason: string;
    severity: 'high' | 'medium';
    zScore: number;
}

interface SubRecommendation {
    subscription: string;
    cost: number;
    type: string;
    icon: string;
    message: string;
    priority: number;
}

interface AnomalyData {
    anomalies: Anomaly[];
    count: number;
}

interface SubOptData {
    recommendations: SubRecommendation[];
    totalMonthly: number;
    totalAnnual: number;
    subscriptionCount: number;
}


// ── Intelligence Page ────────────────────────────────────

export default function Intelligence() {
    const [anomalies, setAnomalies] = useState<AnomalyData | null>(null);
    const [subOpt, setSubOpt] = useState<SubOptData | null>(null);
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [anomData, subData, forecastData] = await Promise.all([
                apiFetch('/analytics/anomalies'),
                apiFetch('/analytics/subscriptions/optimization'),
                apiFetch('/analytics/forecast'),
            ]);
            setAnomalies(anomData);
            setSubOpt(subData);
            setForecast(forecastData);
        } catch {
            // Silently handle — sections will show empty states
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
                            <Brain className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Intelligence</h1>
                            <p className="text-muted-foreground">
                                AI-powered insights into your spending behavior
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors border border-border"
                    title="Refresh data"
                >
                    <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                </button>
            </div>

            {/* Summary Stats */}
            {subOpt && (
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        label="Active Subscriptions"
                        value={subOpt.subscriptionCount.toString()}
                        subtext={`$${subOpt.totalMonthly.toFixed(2)}/month`}
                        icon={<Zap className="w-4 h-4" />}
                        color="violet"
                    />
                    <StatCard
                        label="Annual Cost"
                        value={`$${subOpt.totalAnnual.toLocaleString()}`}
                        subtext="Projected yearly spending"
                        icon={<Calendar className="w-4 h-4" />}
                        color="blue"
                    />
                    <StatCard
                        label="Anomalies Detected"
                        value={anomalies?.count.toString() || '0'}
                        subtext="Unusual transactions found"
                        icon={<AlertTriangle className="w-4 h-4" />}
                        color={anomalies && anomalies.count > 0 ? 'amber' : 'emerald'}
                    />
                </div>
            )}

            {/* Spending Forecast */}
            {forecast && !isLoading && (
                <div className="mb-6">
                    <PredictionChart data={forecast} />
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Anomaly Detection */}
                <div className="rounded-xl border border-border bg-foreground/5 overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        <h2 className="text-sm font-semibold text-foreground">Anomaly Detection</h2>
                        {anomalies && anomalies.count > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                                {anomalies.count} flagged
                            </span>
                        )}
                    </div>

                    <div className="p-4">
                        {isLoading ? (
                            <LoadingState />
                        ) : anomalies && anomalies.anomalies.length > 0 ? (
                            <div className="space-y-3">
                                {anomalies.anomalies.map((a, i) => (
                                    <AnomalyCard key={i} anomaly={a} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
                                title="All Clear!"
                                message="No unusual transactions detected in the past 60 days."
                            />
                        )}
                    </div>
                </div>

                {/* Subscription Optimization */}
                <div className="rounded-xl border border-border bg-foreground/5 overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <h2 className="text-sm font-semibold text-foreground">Subscription Optimizer</h2>
                    </div>

                    <div className="p-4">
                        {isLoading ? (
                            <LoadingState />
                        ) : subOpt && subOpt.recommendations.length > 0 ? (
                            <div className="space-y-3">
                                {subOpt.recommendations.map((r, i) => (
                                    <RecommendationCard key={i} rec={r} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
                                title="Optimized!"
                                message="Your subscriptions look well-managed. No recommendations at this time."
                            />
                        )}

                        {/* Cost summary */}
                        {subOpt && (
                            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-foreground/5 px-3 py-2">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly</p>
                                    <p className="text-lg font-bold text-foreground">${subOpt.totalMonthly.toFixed(2)}</p>
                                </div>
                                <div className="rounded-lg bg-foreground/5 px-3 py-2">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Annual</p>
                                    <p className="text-lg font-bold text-foreground">${subOpt.totalAnnual.toLocaleString()}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Sub-components ───────────────────────────────────────

function StatCard({ label, value, subtext, icon, color }: {
    label: string; value: string; subtext: string;
    icon: React.ReactNode; color: string;
}) {
    const colors: Record<string, string> = {
        violet: 'from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400',
        blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400',
        amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
        emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    };
    const c = colors[color] || colors.violet;

    return (
        <div className={cn("rounded-xl border bg-gradient-to-br p-4", c)}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                {icon}
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
        </div>
    );
}

function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
    return (
        <div className="rounded-lg border border-border bg-foreground/5 p-3 hover:bg-foreground/[0.07] transition-colors">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider",
                            anomaly.severity === 'high'
                                ? "bg-red-500/20 text-red-600 dark:text-red-400"
                                : "bg-amber-500/20 text-amber-400"
                        )}>
                            {anomaly.severity}
                        </span>
                        <span className="text-xs text-muted-foreground">{anomaly.category}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{anomaly.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{anomaly.reason}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">${anomaly.amount.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">{anomaly.date}</p>
                </div>
            </div>
        </div>
    );
}

function RecommendationCard({ rec }: { rec: SubRecommendation }) {
    const typeColors: Record<string, string> = {
        renewal_alert: 'bg-amber-500/20 text-amber-400',
        high_cost: 'bg-blue-500/20 text-blue-400',
        unused: 'bg-red-500/20 text-red-600 dark:text-red-400',
    };

    return (
        <div className="rounded-lg border border-border bg-foreground/5 p-3 hover:bg-foreground/[0.07] transition-colors">
            <div className="flex items-center gap-3">
                <span className="text-xl">{rec.icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-foreground">{rec.subscription}</p>
                        <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-medium",
                            typeColors[rec.type] || 'bg-foreground/10 text-muted-foreground'
                        )}>
                            {rec.type.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.message}</p>
                </div>
                <p className="text-sm font-bold text-foreground flex-shrink-0">${rec.cost.toFixed(2)}/mo</p>
            </div>
        </div>
    );
}

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            {icon}
            <h3 className="text-sm font-semibold text-foreground mt-3">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">{message}</p>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground mt-3">Analyzing your data...</p>
        </div>
    );
}
