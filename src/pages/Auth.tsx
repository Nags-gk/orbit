import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiFetch } from '../lib/api';
import { Lock, Mail, User as UserIcon, Loader2, Cpu, ArrowRight } from 'lucide-react';

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
        <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
            {/* Left Side: Immersive Brand Presentation */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-black overflow-hidden border-r border-border/50">
                {/* Ambient Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-pulse duration-1000" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-accent/20 blur-[120px] mix-blend-screen" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
                </div>

                {/* Logo & Top */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
                        <Cpu className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">Orbit</span>
                </div>

                {/* Hero Copy */}
                <div className="relative z-10 max-w-lg mb-12 mt-auto">
                    <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                        Command your wealth with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">artificial intelligence.</span>
                    </h1>
                    <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                        Experience the ultimate financial dashboard. Predict spending, track budgets natively, and organize your subscriptions seamlessly in one beautiful interface.
                    </p>

                    {/* Testimonial / Credibility Block */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 border-2 border-black" />
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-black" />
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 border-2 border-black" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">Join 10,000+ pioneers</span>
                            <span className="text-xs text-gray-400">Transforming personal finance</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Authentication Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                {/* Mobile Background Blob (Hidden on Desktop) */}
                <div className="absolute inset-0 lg:hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[100px] translate-y-1/3 -translate-x-1/3" />
                </div>

                {/* Glassmorphic Form Container */}
                <div className="w-full max-w-[440px] relative z-10 glass-card rounded-[2rem] p-8 sm:p-12 border border-border shadow-2xl bg-card/60 backdrop-blur-2xl">

                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                            <Cpu className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Orbit</span>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight mb-2">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {isLogin
                                ? 'Enter your credentials to access your terminal.'
                                : 'Enter your details to initialize your workspace.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
                            <div className="min-w-1 h-full rounded-full bg-destructive" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground shadow-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground shadow-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-medium text-foreground">Password</label>
                                {isLogin && (
                                    <a href="#" className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors">
                                        Forgot password?
                                    </a>
                                )}
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 mt-8 rounded-xl font-semibold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_14px_0_hsl(var(--primary)/0.39)] hover:shadow-[0_6px_20px_rgba(var(--primary)/0.23)] hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Sign In to Dashboard' : 'Initialize Account'}</span>
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-border text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                        >
                            {isLogin
                                ? "Don't have an account? "
                                : 'Already have an account? '}
                            <span className="text-primary hover:underline">
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

