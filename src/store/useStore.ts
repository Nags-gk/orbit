import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_TRANSACTIONS, MOCK_SUBSCRIPTIONS, type Transaction, type Subscription } from '../lib/mockData';
import { type ThemeVariable, type ThemeTokens } from '../lib/themes';

interface AppState {
    themeId: string;
    customColors: Partial<ThemeTokens>;
    setTheme: (id: string) => void;
    setCustomColor: (variable: ThemeVariable, value: string) => void;
    resetCustomTheme: () => void;
    transactions: Transaction[];
    subscriptions: Subscription[];
    addTransaction: (transaction: Transaction) => void;
    removeSubscription: (id: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            themeId: 'dark',
            customColors: {},

            setTheme: (id) => set({ themeId: id }),

            setCustomColor: (variable, value) =>
                set((state) => ({
                    customColors: {
                        ...state.customColors,
                        [variable]: value
                    }
                })),

            resetCustomTheme: () => set({ customColors: {} }),

            transactions: MOCK_TRANSACTIONS,
            subscriptions: MOCK_SUBSCRIPTIONS,
            addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
            removeSubscription: (id) => set((state) => ({
                subscriptions: state.subscriptions.filter(sub => sub.id !== id)
            })),
        }),
        {
            name: 'orbit-store',
            partialize: (state) => ({
                themeId: state.themeId,
                customColors: state.customColors
            }), // Only persist theme data to avoid duplicating auth data
        }
    )
);
