import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface RecurringBill {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    nextDueDate: string;
    category: string;
    autoDetected: boolean;
}

export interface CalendarBill extends RecurringBill {
    dueDate: string;
}

export interface CalendarData {
    year: number;
    month: number;
    bills: CalendarBill[];
    totalDue: number;
}

export function useBills() {
    const [bills, setBills] = useState<RecurringBill[]>([]);
    const [calendar, setCalendar] = useState<CalendarData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBills = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch('/bills');
            setBills(data);
        } catch { /* empty */ } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchCalendar = useCallback(async (month = 0) => {
        try {
            const data = await apiFetch(`/bills/calendar?month=${month}`);
            setCalendar(data);
        } catch { /* empty */ }
    }, []);

    const detectBills = useCallback(async () => {
        try {
            const result = await apiFetch('/bills/detect', { method: 'POST' });
            await fetchBills();
            return result;
        } catch { return null; }
    }, [fetchBills]);

    const createBill = useCallback(async (bill: Partial<RecurringBill>) => {
        await apiFetch('/bills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bill),
        });
        await fetchBills();
    }, [fetchBills]);

    const deleteBill = useCallback(async (id: string) => {
        await apiFetch(`/bills/${id}`, { method: 'DELETE' });
        await fetchBills();
    }, [fetchBills]);

    useEffect(() => {
        fetchBills();
        fetchCalendar(0);
    }, [fetchBills, fetchCalendar]);

    return { bills, calendar, isLoading, fetchCalendar, detectBills, createBill, deleteBill, refresh: fetchBills };
}
