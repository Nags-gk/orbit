
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AddTransactionModal } from '../transactions/AddTransactionModal';
import { NotificationCenter } from '../ui/NotificationCenter';
import { useAuthStore } from '../../store/authStore';

interface TopbarProps {
    onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
    const user = useAuthStore((state) => state.user);

    const displayName = user?.fullName || "User";
    const initials = displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-background/0 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 hover:bg-foreground/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="hidden md:block">
                    <p className="text-sm text-muted-foreground">Welcome back,</p>
                    <p className="font-semibold text-foreground">{displayName}</p>
                </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
                <AddTransactionModal />
                <NotificationCenter />
                <Link to="/profile" className="w-10 h-10 rounded-full p-[2px] cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-primary via-accent to-primary animate-gradient bg-[length:200%_auto]">
                    <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-border overflow-hidden">
                        {user?.profilePictureUrl ? (
                            <img
                                src={user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${window.location.protocol}//${window.location.hostname}:5173${user.profilePictureUrl}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="font-bold text-white text-sm">{initials}</span>
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
}

