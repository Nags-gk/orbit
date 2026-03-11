import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string | null;
    icon: string;
    progress: number;
    projectedDate?: string | null;
    monthsRemaining?: number | null;
    monthlySavingsRate?: number;
}

export function useGoals() {
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchGoals = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch('/goals');
            setGoals(data);
        } catch { /* empty */ } finally {
            setIsLoading(false);
        }
    }, []);

    const createGoal = useCallback(async (goal: Partial<SavingsGoal>) => {
        await apiFetch('/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goal),
        });
        await fetchGoals();
    }, [fetchGoals]);

    const updateGoal = useCallback(async (id: string, updates: Record<string, unknown>) => {
        await apiFetch(`/goals/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        await fetchGoals();
    }, [fetchGoals]);

    const deleteGoal = useCallback(async (id: string) => {
        await apiFetch(`/goals/${id}`, { method: 'DELETE' });
        await fetchGoals();
    }, [fetchGoals]);

    useEffect(() => { fetchGoals(); }, [fetchGoals]);

    return { goals, isLoading, createGoal, updateGoal, deleteGoal, refresh: fetchGoals };
}
