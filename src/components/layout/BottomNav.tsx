/**
 * Mobile bottom navigation bar — only visible on phones.
 * Provides thumb-friendly navigation with active indicators.
 */
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, CalendarDays, Target, Brain } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/transactions', icon: CreditCard, label: 'Txns' },
    { to: '/bills', icon: CalendarDays, label: 'Bills' },
    { to: '/budgets', icon: Target, label: 'Budget' },
    { to: '/intelligence', icon: Brain, label: 'AI' },
];

export function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/80 backdrop-blur-xl safe-area-bottom">
            <div className="flex items-center justify-around px-1 py-1">
                {NAV_ITEMS.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 min-w-[56px]",
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "p-1 rounded-lg transition-all duration-200",
                                    isActive && "bg-primary/10"
                                )}>
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-transform",
                                        isActive && "scale-110"
                                    )} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium",
                                    isActive && "font-semibold"
                                )}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
