import { cn } from '../../lib/utils';
import { Lightbulb, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import type { Insight } from '../../hooks/useInsights';

const TYPE_CONFIG = {
    warning: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        icon: AlertTriangle,
        iconColor: 'text-amber-600 dark:text-amber-400',
        actionBg: 'bg-amber-500 text-white hover:bg-amber-600',
    },
    success: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30 dark:border-emerald-500/20',
        icon: CheckCircle,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        actionBg: 'bg-emerald-500 text-white hover:bg-emerald-600',
    },
    tip: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        icon: Lightbulb,
        iconColor: 'text-blue-600 dark:text-blue-400',
        actionBg: 'bg-blue-500 text-white hover:bg-blue-600',
    },
    info: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        icon: Info,
        iconColor: 'text-purple-600 dark:text-purple-400',
        actionBg: 'bg-purple-500 text-white hover:bg-purple-600',
    },
};

interface InsightCardProps {
    insight: Insight;
    onDismiss?: () => void;
    className?: string;
}

export function InsightCard({ insight, onDismiss, className }: InsightCardProps) {
    const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.info;

    return (
        <div
            className={cn(
                "relative rounded-xl border p-4 transition-all duration-300",
                "hover:shadow-lg hover:shadow-black/10",
                "animate-in fade-in slide-in-from-bottom-2 duration-500",
                config.bg,
                config.border,
                className
            )}
        >
            {/* Dismiss button */}
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute top-3 right-3 p-1 rounded-lg hover:bg-foreground/10 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}

            <div className="flex gap-3">
                {/* Icon */}
                <div className={cn(
                    "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                    config.bg
                )}>
                    <span className="text-lg">{insight.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground mb-0.5">
                        {insight.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {insight.description}
                    </p>

                    {/* Action button */}
                    {insight.action && (
                        <button className={cn(
                            "mt-2.5 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors",
                            config.actionBg
                        )}>
                            {insight.action}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Multi-insight display
interface InsightsPanelProps {
    insights: Insight[];
    className?: string;
}

export function InsightsPanel({ insights, className }: InsightsPanelProps) {
    if (insights.length === 0) return null;

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                    {insights.length}
                </span>
            </div>
            {insights.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
            ))}
        </div>
    );
}
