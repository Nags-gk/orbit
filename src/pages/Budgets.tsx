import { useState, useEffect, useCallback } from 'react';
import { Target, Plus, Trash2, RefreshCw, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiFetch } from '../lib/api';

interface Budget {
    id: string;
    category: string;
    monthlyLimit: number;
    spent: number;
    remaining: number;
    percentage: number;
}


const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Subscription'];

export default function Budgets() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newLimit, setNewLimit] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch('/budgets');
            setBudgets(data);
        } catch { /* network error */ } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAdd = async () => {
        if (!newCategory || !newLimit) return;
        try {
            await apiFetch('/budgets', {
                method: 'POST',
                body: JSON.stringify({ category: newCategory, monthlyLimit: parseFloat(newLimit) }),
            });
            setShowAdd(false);
            setNewCategory('');
            setNewLimit('');
            setNewLimit('');
            fetchData();
        } catch { /* */ }
    };

    const handleDelete = async (id: string) => {
        try {
            await apiFetch(`/budgets/${id}`, { method: 'DELETE' });
            fetchData();
        } catch { /* */ }
    };

    const usedCategories = new Set(budgets.map(b => b.category));
    const availableCategories = CATEGORIES.filter(c => !usedCategories.has(c));

    const totalLimit = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const overallPct = totalLimit > 0 ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                        <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Budget Goals</h1>
                        <p className="text-muted-foreground">
                            Set spending limits and track your progress
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Goal
                    </button>
                    <button
                        onClick={fetchData}
                        disabled={isLoading}
                        className="p-2.5 rounded-xl hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors border border-border"
                    >
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Overall Progress */}
            {budgets.length > 0 && (
                <div className="rounded-xl border border-border bg-foreground/5 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Overall Budget Usage</p>
                            <p className="text-2xl font-bold text-foreground">
                                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                    of ${totalLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </p>
                        </div>
                        <span className={cn(
                            "text-2xl font-bold",
                            overallPct < 60 ? 'text-emerald-600 dark:text-emerald-400' : overallPct < 85 ? 'text-amber-400' : 'text-red-600 dark:text-red-400'
                        )}>
                            {overallPct}%
                        </span>
                    </div>
                    <div className="h-3 rounded-full bg-foreground/10 overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-700",
                                overallPct < 60 ? 'bg-emerald-500' : overallPct < 85 ? 'bg-amber-500' : 'bg-red-500'
                            )}
                            style={{ width: `${overallPct}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Add Budget Form */}
            {showAdd && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">New Budget Goal</h3>
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                            <select
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-foreground/5 border border-border text-sm text-foreground"
                            >
                                <option value="">Select category</option>
                                {availableCategories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1 block">Monthly Limit ($)</label>
                            <input
                                type="number"
                                value={newLimit}
                                onChange={e => setNewLimit(e.target.value)}
                                placeholder="500"
                                className="w-full px-3 py-2 rounded-lg bg-foreground/5 border border-border text-sm text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                        <button
                            onClick={handleAdd}
                            disabled={!newCategory || !newLimit}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            Create
                        </button>
                    </div>
                </div>
            )}

            {/* Budget Cards */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : budgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">No budget goals yet</h3>
                    <p className="text-sm text-muted-foreground max-w-[300px]">
                        Set spending limits for your categories to track how you're doing each month.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {budgets.map(b => (
                        <BudgetCard key={b.id} budget={b} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}

function BudgetCard({ budget, onDelete }: { budget: Budget; onDelete: (id: string) => void }) {
    const pct = budget.percentage;
    const isOver = pct >= 100;
    const isWarning = pct >= 80 && pct < 100;

    const barColor = isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';
    const textColor = isOver ? 'text-red-600 dark:text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-600 dark:text-emerald-400';

    return (
        <div className={cn(
            "rounded-xl border bg-foreground/5 p-5 transition-all",
            isOver ? 'border-red-500/30' : 'border-border'
        )}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-base font-semibold text-foreground">{budget.category}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Monthly budget</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn("text-lg font-bold", textColor)}>{pct}%</span>
                    <button
                        onClick={() => onDelete(budget.id)}
                        className="p-1 rounded hover:bg-foreground/10 text-muted-foreground hover:text-red-600 dark:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 rounded-full bg-foreground/10 overflow-hidden mb-3">
                <div
                    className={cn("h-full rounded-full transition-all duration-700", barColor)}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                />
            </div>

            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                    Spent: <span className="text-foreground font-medium">${budget.spent.toFixed(2)}</span>
                </span>
                <span className="text-muted-foreground">
                    Limit: <span className="text-foreground font-medium">${budget.monthlyLimit.toFixed(2)}</span>
                </span>
            </div>

            {isOver && (
                <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 dark:border-red-500/20">
                    <TrendingUp className="w-3 h-3 text-red-600 dark:text-red-400" />
                    <p className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                        Over budget by ${(budget.spent - budget.monthlyLimit).toFixed(2)}
                    </p>
                </div>
            )}
        </div>
    );
}
