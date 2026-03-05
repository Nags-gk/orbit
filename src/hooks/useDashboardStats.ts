import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface DashboardSummary {
    totalBalance: number;
    monthlySpending: number;
    activeSubscriptions: number;
    savingsGoal: number;
}

interface UseDashboardStatsReturn {
    summary: DashboardSummary | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useDashboardStats(): UseDashboardStatsReturn {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await apiFetch('/summary');
            setSummary(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        summary,
        isLoading,
        error,
        refresh: fetchData,
    };
}
