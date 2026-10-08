import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { ChatAssistant } from '../../vendor/orbit-copilot';
import { useAuthStore } from '../../store/authStore';

// The copilot runs as its own service (github.com/Nags-gk/Orbit-Copilot) on port 8001.
// Default to the host this page was loaded from, so phones on the local network reach it too.
const COPILOT_WS_URL =
    import.meta.env.VITE_COPILOT_WS_URL ||
    `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8001/api/chat/ws`;

const getToken = () => useAuthStore.getState().token;

export function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="md:pl-[18rem] flex flex-col min-h-screen transition-all duration-300">
                <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-0 pb-20 md:pb-6">
                    <Outlet />
                </main>
            </div>

            <BottomNav />
            <ChatAssistant wsUrl={COPILOT_WS_URL} getToken={getToken} />
        </div>
    );
}
