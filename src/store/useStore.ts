import { create } from 'zustand';
import { MOCK_TRANSACTIONS, MOCK_SUBSCRIPTIONS, type Transaction, type Subscription } from '../lib/mockData';

interface AppState {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    transactions: Transaction[];
    subscriptions: Subscription[];
    addTransaction: (transaction: Transaction) => void;
    removeSubscription: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
    theme: 'dark',
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(newTheme);
        }
        return { theme: newTheme };
    }),
    transactions: MOCK_TRANSACTIONS,
    subscriptions: MOCK_SUBSCRIPTIONS,
    addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
    removeSubscription: (id) => set((state) => ({
        subscriptions: state.subscriptions.filter(sub => sub.id !== id)
    })),
}));
