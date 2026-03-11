import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface NetWorthData {
    current: {
        totalAssets: number;
        totalLiabilities: number;
        netWorth: number;
    };
    history: Array<{
        date: string;
        totalAssets: number;
        totalLiabilities: number;
        netWorth: number;
    }>;
}

export function useNetWorth() {
    const [data, setData] = useState<NetWorthData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await apiFetch('/accounts/net-worth');
            setData(result);
        } catch { /* empty */ } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, isLoading, refresh: fetch };
}
