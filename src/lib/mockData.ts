import { subDays, format } from 'date-fns';

export interface Transaction {
    id: string;
    date: string;
    description: string;
    category: 'Food' | 'Transport' | 'Utilities' | 'Entertainment' | 'Shopping' | 'Income' | 'Subscription';
    amount: number;
    type: 'income' | 'expense';
}

export interface Subscription {
    id: string;
    name: string;
    cost: number;
    renewalDate: string;
    category: string;
    active: boolean;
    logo?: string;
}

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping'] as const;

export const generateTransactions = (count: number): Transaction[] => {
    return Array.from({ length: count }).map((_, i) => {
        const isIncome = Math.random() > 0.8;
        const category = isIncome ? 'Income' : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

        return {
            id: `tx-${i}`,
            date: format(subDays(new Date(), Math.floor(Math.random() * 60)), 'yyyy-MM-dd'),
            description: isIncome ? 'Salary' : `Transaction ${i + 1}`,
            category: category as Transaction['category'],
            amount: isIncome ? Math.floor(Math.random() * 2000) + 1000 : Math.floor(Math.random() * 100) + 5,
            type: isIncome ? 'income' : 'expense',
        };
    });
};

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
    { id: 'sub-1', name: 'Netflix', cost: 15.99, renewalDate: '2023-12-15', category: 'Entertainment', active: true },
    { id: 'sub-2', name: 'Spotify', cost: 9.99, renewalDate: '2023-12-20', category: 'Entertainment', active: true },
    { id: 'sub-3', name: 'AWS', cost: 45.00, renewalDate: '2023-12-01', category: 'Utilities', active: true },
    { id: 'sub-4', name: 'Gym', cost: 50.00, renewalDate: '2023-12-05', category: 'Health', active: true },
    { id: 'sub-5', name: 'Internet', cost: 60.00, renewalDate: '2023-12-10', category: 'Utilities', active: true },
];

export const MOCK_TRANSACTIONS = generateTransactions(50);
