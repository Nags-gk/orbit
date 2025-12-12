
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Repeat, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const links = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/transactions', icon: CreditCard, label: 'Transactions' },
        { to: '/subscriptions', icon: Repeat, label: 'Subscriptions' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 left-0 z-50 h-screen w-64 transition-transform duration-300 md:translate-x-0",
                "md:top-4 md:left-4 md:h-[calc(100vh-2rem)] md:rounded-2xl md:border md:border-white/10",
                "glass bg-black/20",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h1 className="text-3xl font-light tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient bg-[length:200%_auto]">
                        Orbit
                    </h1>
                    <button onClick={onClose} className="md:hidden p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => onClose()}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "text-primary bg-white/5 shadow-[0_0_20px_rgba(var(--primary),0.2)] border border-primary/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            <link.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", ({ isActive }: { isActive: boolean }) => isActive && "text-primary")} />
                            <span className="font-medium">{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/5">
                        <p className="text-xs text-muted-foreground mb-1">Pro Plan</p>
                        <p className="text-sm font-semibold text-foreground">Upgrade to unlock more features</p>
                    </div>
                </div>
            </aside>
        </>
    );
}

