import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiFetch } from '../lib/api';
import { Lock, Mail, User as UserIcon, Loader2, ArrowRight, Sparkles, Shield, Zap, BarChart3 } from 'lucide-react';

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

    const features = [
        { icon: Sparkles, label: 'AI-Powered Insights', desc: 'Smart spending analysis' },
        { icon: Shield, label: 'Bank-Level Security', desc: '256-bit encryption' },
        { icon: Zap, label: 'Real-Time Tracking', desc: 'Instant transaction alerts' },
        { icon: BarChart3, label: 'Visual Analytics', desc: 'Beautiful financial charts' },
    ];

    return (
        <div className="flex min-h-screen overflow-hidden relative">

            {/* ── Full-screen animated background ── */}
            <div className="absolute inset-0 bg-[#030712]">
                {/* Animated gradient orbs */}
                <div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#6366f1]/20 blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#06b6d4]/15 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-[#a855f7]/15 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#ec4899]/10 blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)]" />
            </div>

            {/* ── Left Side: Brand & Features ── */}
            <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-14 z-10">

                {/* Animated orbital rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                    <div className="w-[500px] h-[500px] rounded-full border border-[#6366f1]/30 animate-[spin_30s_linear_infinite]" />
                    <div className="absolute inset-0 w-[400px] h-[400px] m-auto rounded-full border border-[#06b6d4]/20 animate-[spin_20s_linear_infinite_reverse]" />
                    <div className="absolute inset-0 w-[300px] h-[300px] m-auto rounded-full border border-[#a855f7]/20 animate-[spin_25s_linear_infinite]" />
                    {/* Glowing dot on ring */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#06b6d4] shadow-[0_0_20px_#06b6d4,0_0_40px_#06b6d4] animate-[spin_30s_linear_infinite]" style={{ transformOrigin: '50% 250px' }} />
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">Orbit</span>
                </div>

                {/* Hero text */}
                <div className="relative z-10 max-w-lg mt-auto mb-12">
                    <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                        Your finances,{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#ec4899]">
                            powered by AI.
                        </span>
                    </h1>
                    <p className="text-lg text-[#94a3b8] mb-10 leading-relaxed">
                        The intelligent dashboard that predicts spending, tracks investments, and gives you actionable financial insights — all in real time.
                    </p>

                    {/* Feature grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.07] hover:border-white/[0.1] transition-all duration-300"
                            >
                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#6366f1]/20 to-[#06b6d4]/20">
                                    <f.icon className="w-4 h-4 text-[#06b6d4]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{f.label}</p>
                                    <p className="text-xs text-[#64748b]">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Social proof */}
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex -space-x-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] border-2 border-[#030712] ring-1 ring-white/10" />
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#22d3ee] border-2 border-[#030712] ring-1 ring-white/10" />
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ec4899] to-[#f43f5e] border-2 border-[#030712] ring-1 ring-white/10" />
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ef4444] border-2 border-[#030712] ring-1 ring-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                            +5K
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Trusted by 10,000+ users</p>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-3.5 h-3.5 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            <span className="text-xs text-[#64748b] ml-1">4.9/5 rating</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Side: Auth Form ── */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-6 relative z-10">

                {/* Glassmorphic form container */}
                <div className="w-full max-w-[420px] relative">

                    {/* Glow behind form */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#6366f1]/20 via-[#06b6d4]/20 to-[#a855f7]/20 rounded-[2rem] blur-xl opacity-60" />

                    <div className="relative rounded-[2rem] p-8 sm:p-10 bg-[#0f172a]/80 backdrop-blur-2xl border border-white/[0.08] shadow-2xl">

                        {/* Mobile logo */}
                        <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#06b6d4]">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">Orbit</span>
                        </div>

                        {/* Header */}
                        <div className="mb-8 text-center lg:text-left">
                            <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5">
                                {isLogin ? 'Welcome back' : 'Get started'}
                            </h2>
                            <p className="text-[#64748b] text-sm">
                                {isLogin
                                    ? 'Sign in to your financial command center.'
                                    : 'Create your account to get started.'}
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-5 p-3.5 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#f87171] text-sm flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-[#94a3b8] ml-0.5">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#475569] group-focus-within:text-[#06b6d4] transition-colors">
                                            <UserIcon className="h-4.5 w-4.5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1]/50 outline-none transition-all placeholder:text-[#334155] text-white text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[#94a3b8] ml-0.5">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#475569] group-focus-within:text-[#06b6d4] transition-colors">
                                        <Mail className="h-4.5 w-4.5" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1]/50 outline-none transition-all placeholder:text-[#334155] text-white text-sm"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-0.5">
                                    <label className="text-sm font-medium text-[#94a3b8]">Password</label>
                                    {isLogin && (
                                        <a href="#" className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors">
                                            Forgot password?
                                        </a>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#475569] group-focus-within:text-[#06b6d4] transition-colors">
                                        <Lock className="h-4.5 w-4.5" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1]/50 outline-none transition-all placeholder:text-[#334155] text-white text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Submit button with gradient */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 mt-6 rounded-xl font-semibold text-white text-sm
                                    bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]
                                    hover:from-[#818cf8] hover:via-[#a78bfa] hover:to-[#22d3ee]
                                    focus:outline-none focus:ring-4 focus:ring-[#6366f1]/30
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    transition-all duration-300
                                    shadow-[0_4px_20px_rgba(99,102,241,0.35)]
                                    hover:shadow-[0_6px_30px_rgba(99,102,241,0.45)]
                                    hover:-translate-y-0.5
                                    active:translate-y-0"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>{isLogin ? 'Sign In to Dashboard' : 'Create Account'}</span>
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="mt-7 pt-7 border-t border-white/[0.06] text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="text-sm text-[#64748b] hover:text-white font-medium transition-colors"
                            >
                                {isLogin
                                    ? "Don't have an account? "
                                    : 'Already have an account? '}
                                <span className="text-[#06b6d4] hover:text-[#22d3ee]">
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </span>
                            </button>
                        </div>

                        {/* Security badge */}
                        <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-[#334155] uppercase tracking-widest">
                            <Shield className="w-3 h-3" />
                            <span>Secured with 256-bit encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
