/**
 * Beautiful empty state component with illustrated placeholders and CTAs.
 * Used across all pages to provide a premium first-use experience.
 */
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, Target, Repeat, TrendingUp,
    PlusCircle, Upload, CalendarDays, PiggyBank
} from 'lucide-react';

interface EmptyStateProps {
    icon: 'transactions' | 'budgets' | 'subscriptions' | 'documents' | 'bills' | 'goals' | 'insights';
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
    children?: ReactNode;
}

const ICON_CONFIGS = {
    transactions: { Component: CreditCard, gradient: 'from-violet-500 to-purple-600', bg: 'from-violet-500/20 to-purple-600/20' },
    budgets: { Component: Target, gradient: 'from-emerald-500 to-teal-600', bg: 'from-emerald-500/20 to-teal-600/20' },
    subscriptions: { Component: Repeat, gradient: 'from-blue-500 to-cyan-600', bg: 'from-blue-500/20 to-cyan-600/20' },
    documents: { Component: Upload, gradient: 'from-amber-500 to-orange-600', bg: 'from-amber-500/20 to-orange-600/20' },
    bills: { Component: CalendarDays, gradient: 'from-pink-500 to-rose-600', bg: 'from-pink-500/20 to-rose-600/20' },
    goals: { Component: PiggyBank, gradient: 'from-cyan-500 to-blue-600', bg: 'from-cyan-500/20 to-blue-600/20' },
    insights: { Component: TrendingUp, gradient: 'from-fuchsia-500 to-pink-600', bg: 'from-fuchsia-500/20 to-pink-600/20' },
};

export function EmptyState({ icon, title, description, actionLabel, onAction, secondaryLabel, onSecondary, children }: EmptyStateProps) {
    const { Component: IconComponent, gradient, bg } = ICON_CONFIGS[icon];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
        >
            {/* Animated illustrated icon with glowing rings */}
            <div className="relative mb-6">
                {/* Outer glow ring */}
                <motion.div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${bg} blur-xl`}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: 96, height: 96, top: -8, left: -8 }}
                />
                {/* Inner circle */}
                <motion.div
                    className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <IconComponent className="w-9 h-9 text-white" />
                </motion.div>
                {/* Floating decorative dots */}
                <motion.div
                    className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-primary/60"
                    animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute -bottom-1 -left-3 w-2 h-2 rounded-full bg-accent/60"
                    animate={{ y: [0, 6, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
            </div>

            {/* Text */}
            <motion.h3
                className="text-xl font-bold text-foreground mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {title}
            </motion.h3>
            <motion.p
                className="text-sm text-muted-foreground max-w-sm leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                {description}
            </motion.p>

            {/* CTA Buttons */}
            {(actionLabel || secondaryLabel) && (
                <motion.div
                    className="flex items-center gap-3 mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {actionLabel && (
                        <button
                            onClick={onAction}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
                        >
                            <PlusCircle className="w-4 h-4" />
                            {actionLabel}
                        </button>
                    )}
                    {secondaryLabel && (
                        <button
                            onClick={onSecondary}
                            className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                        >
                            {secondaryLabel}
                        </button>
                    )}
                </motion.div>
            )}

            {children}

            {/* Decorative bottom pattern */}
            <div className="flex items-center gap-1 mt-8 opacity-20">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                    />
                ))}
            </div>
        </motion.div>
    );
}
