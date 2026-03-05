import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch } from '../lib/api';

interface User {
    id: string;
    email: string;
    fullName: string | null;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
    updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (token, user) => set({ token, user, isAuthenticated: true }),
            logout: () => set({ token: null, user: null, isAuthenticated: false }),
            updateUser: (user) => set({ user }),
            checkAuth: async () => {
                const { token } = get();
                if (!token) {
                    set({ isAuthenticated: false, user: null });
                    return;
                }
                try {
                    const userData = await apiFetch('/auth/me');
                    set({ user: userData, isAuthenticated: true });
                } catch {
                    // Token expired or invalid
                    set({ token: null, user: null, isAuthenticated: false });
                }
            }
        }),
        {
            name: 'auth-storage', // saves to localStorage
        }
    )
);
