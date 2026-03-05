import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiFetch } from '../lib/api';
import { LayoutDashboard, Lock, Mail, User as UserIcon, Loader2 } from 'lucide-react';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // OAuth2 Password Request Form format for FastAPI
                const formData = new URLSearchParams();
                formData.append('username', email);
                formData.append('password', password);

                const response = await apiFetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                login(response.access_token, response.user);
                navigate('/');
            } else {
                const response = await apiFetch('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ email, password, fullName }),
                });

                login(response.access_token, response.user);
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10 glass-card rounded-2xl p-8 border border-gray-200/50 dark:border-border/50 shadow-xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-500/20">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h1>
                    <p className="text-gray-500 hover:text-gray-400 mt-2 text-sm font-medium">
                        Enter your details to access Orbit
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 dark:border-red-500/20 text-red-600 dark:text-red-600 dark:text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-foreground/50 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-foreground/50 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-foreground/50 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isLogin ? (
                            'Sign in'
                        ) : (
                            'Create account'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
}
