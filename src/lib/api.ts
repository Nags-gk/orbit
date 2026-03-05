import { useAuthStore } from '../store/authStore';

const API_URL = '/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    // Determine the base path. Since we run Vite proxy, it handles /api
    const url = endpoint.startsWith('http') ? endpoint : endpoint.startsWith('/api') ? endpoint : `${API_URL}${endpoint}`;

    // Get token from Zustand managed localStorage
    let token = null;
    try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
            token = JSON.parse(stored).state?.token;
        }
    } catch (e) {
        // ignore
    }

    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    const isFormData = options.body instanceof URLSearchParams || options.body instanceof FormData;
    if (!headers.has('Content-Type') && !isFormData) {
        headers.set('Content-Type', 'application/json');
    }

    try {
        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            if (response.status === 401 && endpoint !== '/auth/login') {
                useAuthStore.getState().logout();
            }
            let errorData = null;
            try {
                errorData = await response.json();
            } catch { }
            throw new Error(errorData?.detail || errorData?.error || response.statusText);
        }

        return await response.json();
    } catch (error: any) {
        throw error;
    }
}
