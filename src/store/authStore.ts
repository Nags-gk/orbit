import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    fullName: string | null;
    profilePictureUrl?: string | null;
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

const localUser: User = { 
    id: "local-user-id", 
    email: "local@orbit.ai", 
    fullName: "Local User" 
};

export const useAuthStore = create<AuthState>()(
    (set) => ({
        user: localUser,
        token: "local-bypass-token",
        isAuthenticated: true,
        login: (token, user) => set({ token, user, isAuthenticated: true }),
        logout: () => set({ token: "local-bypass-token", user: localUser, isAuthenticated: true }),
        updateUser: (user) => set({ user }),
        checkAuth: async () => {
            // Auto-login bypass
            set({ isAuthenticated: true, user: localUser, token: "local-bypass-token" });
        }
    })
);
