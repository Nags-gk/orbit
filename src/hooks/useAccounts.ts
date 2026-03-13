import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface Account {
    id: string;
    name: string;
    type: 'depository' | 'credit' | 'investment' | 'loan';
    subtype: string;
    balance: number;
    currency: string;
    updatedAt: string;
}

interface UseAccountsReturn {
    accounts: Account[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
    updateAccount: (id: string, updates: Partial<Pick<Account, 'name' | 'balance'>>) => Promise<void>;
}

export function useAccounts(): UseAccountsReturn {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await apiFetch('/accounts');
            setAccounts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateAccount = useCallback(async (id: string, updates: Partial<Pick<Account, 'name' | 'balance'>>) => {
        try {
            const updated = await apiFetch(`/accounts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            setAccounts(prev => prev.map(a => a.id === id ? updated : a));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Update failed';
            setError(errorMessage);
            throw err; // Re-throw so caller knows it failed
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        accounts,
        isLoading,
        error,
        refresh: fetchData,
        updateAccount,
    };
}

