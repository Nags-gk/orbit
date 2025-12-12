
import React from 'react';
import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { AddTransactionModal } from '../transactions/AddTransactionModal';

interface TopbarProps {
    onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
    const { theme, toggleTheme } = useStore();

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-background/0 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="hidden md:block">
                    <p className="text-sm text-muted-foreground">Welcome back,</p>
                    <p className="font-semibold text-foreground">Nagaraj GK</p>
                </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
                <AddTransactionModal />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors relative outline-none">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 glass-card border-white/10 p-0">
                        <div className="p-4 border-b border-white/10">
                            <h4 className="font-semibold">Notifications</h4>
                        </div>
                        <div className="p-2 space-y-1">
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-white/5 rounded-lg focus:bg-white/5">
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-medium text-sm">New Subscription Added</span>
                                    <span className="text-[10px] text-muted-foreground">2m ago</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Netflix Premium was successfully added.</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-white/5 rounded-lg focus:bg-white/5">
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-medium text-sm">Payment Successful</span>
                                    <span className="text-[10px] text-muted-foreground">1h ago</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Spotify payment of $14.99 processed.</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-white/5 rounded-lg focus:bg-white/5">
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-medium text-sm">Budget Alert</span>
                                    <span className="text-[10px] text-muted-foreground">5h ago</span>
                                </div>
                                <p className="text-xs text-muted-foreground">You've reached 80% of your entertainment budget.</p>
                            </DropdownMenuItem>
                        </div>
                        <div className="p-2 border-t border-white/10">
                            <button className="w-full text-xs text-center py-2 text-primary hover:text-primary/80 transition-colors">
                                Mark all as read
                            </button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>

                <Link to="/profile" className="w-10 h-10 rounded-full p-[2px] cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-primary via-accent to-primary animate-gradient bg-[length:200%_auto]">
                    <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent">NG</span>
                    </div>
                </Link>
            </div>
        </header>
    );
}
