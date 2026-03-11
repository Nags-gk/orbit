import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const TYPE_STYLES = {
    warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
    info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-500' },
    success: { icon: CheckCircle, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    danger: { icon: XCircle, bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-500' },
};

export function NotificationCenter() {
    const { notifications, unreadCount, markAllRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) markAllRead();
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                title="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white min-w-[18px] px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 w-96 max-h-[480px] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl z-50">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-foreground/10 text-muted-foreground">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                            <p className="text-sm text-muted-foreground">No notifications right now</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map(notif => {
                                const style = TYPE_STYLES[notif.type];
                                const Icon = style.icon;
                                return (
                                    <div key={notif.id} className={`p-4 flex gap-3 ${style.bg} hover:brightness-110 transition-all`}>
                                        <div className={`p-1.5 rounded-lg ${style.border} border flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 ${style.text}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium">{notif.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
