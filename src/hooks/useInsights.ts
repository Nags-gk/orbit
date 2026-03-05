import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface Insight {
    type: 'warning' | 'success' | 'tip' | 'info';
    icon: string;
    title: string;
    description: string;
    action?: string;
    priority: number;
}

export interface ForecastPoint {
    date: string;
    amount: number;
    type: 'actual' | 'predicted';
}

export interface InsightsData {
    insights: Insight[];
    count: number;
    generatedAt: string;
}

export interface ForecastData {
    historical: ForecastPoint[];
    forecast: ForecastPoint[];
    dailyAverage: number;
    predictedMonthlyTotal: number;
    trend: string;
    trendSlope: number;
}

interface UseInsightsReturn {
    insights: Insight[];
    forecast: ForecastData | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}


export function useInsights(): UseInsightsReturn {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [insightsData, forecastData] = await Promise.all([
                apiFetch('/analytics/insights'),
                apiFetch('/analytics/forecast'),
            ]);

            setInsights(insightsData.insights);
            setForecast(forecastData);
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
        insights,
        forecast,
        isLoading,
        error,
        refresh: fetchData,
    };
}
