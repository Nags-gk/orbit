import { useState } from 'react';
import { PiggyBank, Target, Plane, Home, GraduationCap, Plus, DollarSign, Trash2 } from 'lucide-react';
import { useGoals } from '../../hooks/useGoals';
import type { SavingsGoal } from '../../hooks/useGoals';

const ICON_MAP: Record<string, React.ElementType> = {
    'piggy-bank': PiggyBank,
    'target': Target,
    'plane': Plane,
    'home': Home,
    'graduation': GraduationCap,
};

export function SavingsGoals() {
    const { goals, isLoading, createGoal, updateGoal, deleteGoal } = useGoals();
    const [showAddModal, setShowAddModal] = useState(false);
    const [addFundsId, setAddFundsId] = useState<string | null>(null);
    const [fundsAmount, setFundsAmount] = useState('');
    const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', icon: 'piggy-bank', deadline: '' });

    const handleCreate = async () => {
        if (newGoal.name && newGoal.targetAmount) {
            await createGoal({
                name: newGoal.name,
                targetAmount: parseFloat(newGoal.targetAmount),
                icon: newGoal.icon,
                deadline: newGoal.deadline || undefined,
            } as Partial<SavingsGoal>);
            setShowAddModal(false);
            setNewGoal({ name: '', targetAmount: '', icon: 'piggy-bank', deadline: '' });
        }
    };

    const handleAddFunds = async (id: string) => {
        if (fundsAmount) {
            await updateGoal(id, { addFunds: parseFloat(fundsAmount) });
            setAddFundsId(null);
            setFundsAmount('');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Savings Goals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                    {[1, 2].map(i => <div key={i} className="h-40 bg-card rounded-xl border border-border" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Savings Goals</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" /> New Goal
                </button>
            </div>

            {goals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                    <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">No savings goals yet. Create one to start tracking!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {goals.map(goal => {
                        const IconComponent = ICON_MAP[goal.icon] || Target;
                        const circumference = 2 * Math.PI * 36;
                        const offset = circumference - (goal.progress / 100) * circumference;
                        const progressColor = goal.progress >= 100 ? '#10b981' : goal.progress >= 50 ? 'hsl(var(--primary))' : '#f59e0b';

                        return (
                            <div key={goal.id} className="relative rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all group">
                                <button
                                    onClick={() => deleteGoal(goal.id)}
                                    className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                <div className="flex items-start gap-4">
                                    {/* Animated Progress Ring */}
                                    <div className="relative w-20 h-20 flex-shrink-0">
                                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                            <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
                                            <circle
                                                cx="40" cy="40" r="36" fill="none"
                                                stroke={progressColor}
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={offset}
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <IconComponent className="w-5 h-5 text-primary" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold truncate">{goal.name}</h4>
                                        <p className="text-2xl font-bold mt-0.5">
                                            ${goal.currentAmount.toLocaleString()}
                                            <span className="text-sm font-normal text-muted-foreground"> / ${goal.targetAmount.toLocaleString()}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {goal.progress >= 100 ? (
                                                <span className="text-emerald-500 font-medium">🎉 Goal reached!</span>
                                            ) : goal.projectedDate ? (
                                                <>Projected: {new Date(goal.projectedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} ({goal.monthsRemaining}mo)</>
                                            ) : (
                                                'Add income transactions to see projections'
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Add Funds Section */}
                                <div className="mt-3 pt-3 border-t border-border/50">
                                    {addFundsId === goal.id ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={fundsAmount}
                                                onChange={e => setFundsAmount(e.target.value)}
                                                placeholder="Amount"
                                                className="flex-1 px-2 py-1 text-sm rounded-lg bg-background border border-border outline-none focus:border-primary"
                                                autoFocus
                                                onKeyDown={e => e.key === 'Enter' && handleAddFunds(goal.id)}
                                            />
                                            <button onClick={() => handleAddFunds(goal.id)} className="px-3 py-1 text-xs rounded-lg bg-primary text-primary-foreground font-medium">Save</button>
                                            <button onClick={() => setAddFundsId(null)} className="px-3 py-1 text-xs rounded-lg border border-border hover:bg-foreground/5">Cancel</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setAddFundsId(goal.id)}
                                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                                        >
                                            <DollarSign className="w-3 h-3" /> Add Funds
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Goal Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Create Savings Goal</h3>
                        <div className="space-y-3">
                            <input
                                placeholder="Goal name (e.g., Vacation Fund)"
                                value={newGoal.name}
                                onChange={e => setNewGoal(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary"
                            />
                            <input
                                placeholder="Target amount"
                                type="number"
                                value={newGoal.targetAmount}
                                onChange={e => setNewGoal(p => ({ ...p, targetAmount: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary"
                            />
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Choose Icon</p>
                                <div className="flex gap-2">
                                    {Object.entries(ICON_MAP).map(([key, Icon]) => (
                                        <button
                                            key={key}
                                            onClick={() => setNewGoal(p => ({ ...p, icon: key }))}
                                            className={`p-2.5 rounded-lg border transition-colors ${newGoal.icon === key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <input
                                type="date"
                                value={newGoal.deadline}
                                onChange={e => setNewGoal(p => ({ ...p, deadline: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary"
                            />
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-foreground/5 text-sm">Cancel</button>
                            <button onClick={handleCreate} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Create Goal</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
