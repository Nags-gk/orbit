import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Zap, Trash2 } from 'lucide-react';
import { useBills } from '../hooks/useBills';
import { AnimatedPage } from '../components/ui/AnimatedComponents';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BillCalendar() {
    const { bills, calendar, isLoading, fetchCalendar, detectBills, createBill, deleteBill } = useBills();
    const [monthOffset, setMonthOffset] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBill, setNewBill] = useState({ name: '', amount: '', frequency: 'monthly', nextDueDate: '', category: 'Subscription' });

    const handlePrevMonth = () => {
        const next = monthOffset - 1;
        setMonthOffset(next);
        fetchCalendar(next);
    };

    const handleNextMonth = () => {
        const next = monthOffset + 1;
        setMonthOffset(next);
        fetchCalendar(next);
    };

    const handleDetect = async () => {
        await detectBills();
        fetchCalendar(monthOffset);
    };

    const handleAdd = async () => {
        if (newBill.name && newBill.amount) {
            await createBill({
                name: newBill.name,
                amount: parseFloat(newBill.amount),
                frequency: newBill.frequency,
                nextDueDate: newBill.nextDueDate || new Date().toISOString().split('T')[0],
                category: newBill.category,
            });
            fetchCalendar(monthOffset);
            setShowAddModal(false);
            setNewBill({ name: '', amount: '', frequency: 'monthly', nextDueDate: '', category: 'Subscription' });
        }
    };

    // Build calendar grid
    const year = calendar?.year || new Date().getFullYear();
    const month = calendar?.month || (new Date().getMonth() + 1);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

    // Group bills by day
    const billsByDay: Record<number, typeof bills> = {};
    (calendar?.bills || []).forEach(bill => {
        const day = parseInt(bill.dueDate.split('-')[2]);
        if (!billsByDay[day]) billsByDay[day] = [];
        billsByDay[day].push(bill);
    });

    const getCategoryColor = (cat: string) => {
        const colors: Record<string, string> = {
            'Subscription': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'Utilities': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            'Food': 'bg-green-500/20 text-green-400 border-green-500/30',
            'Entertainment': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
            'Transport': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
        return colors[cat] || 'bg-secondary text-secondary-foreground border-border';
    };

    return (
        <AnimatedPage>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-primary" />
                            Bill Calendar
                        </h1>
                        <p className="text-muted-foreground mt-1">Track and never miss a payment.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDetect}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors text-sm font-medium"
                        >
                            <Zap className="w-4 h-4" /> Auto-Detect
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" /> Add Bill
                        </button>
                    </div>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                    <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-semibold">{MONTH_NAMES[month - 1]} {year}</h2>
                    <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Due</p>
                        <p className="text-2xl font-bold text-primary mt-1">${(calendar?.totalDue || 0).toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Bills This Month</p>
                        <p className="text-2xl font-bold mt-1">{calendar?.bills.length || 0}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Tracked Bills</p>
                        <p className="text-2xl font-bold mt-1">{bills.length}</p>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-border">
                        {DAY_NAMES.map(day => (
                            <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {/* Empty cells before first day */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="p-2 min-h-[100px] border-b border-r border-border/50 bg-card/50" />
                        ))}
                        {/* Day cells */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isToday = isCurrentMonth && today.getDate() === day;
                            const dayBills = billsByDay[day] || [];
                            return (
                                <div
                                    key={day}
                                    className={`p-2 min-h-[100px] border-b border-r border-border/50 transition-colors ${isToday ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : 'hover:bg-foreground/5'
                                        }`}
                                >
                                    <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                                        }`}>
                                        {day}
                                    </span>
                                    <div className="mt-1 space-y-1">
                                        {dayBills.map((bill, idx) => (
                                            <div
                                                key={`${bill.id}-${idx}`}
                                                className={`text-[11px] px-1.5 py-0.5 rounded border truncate ${getCategoryColor(bill.category)}`}
                                                title={`${bill.name} - $${bill.amount}`}
                                            >
                                                ${bill.amount} {bill.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Bills List */}
                {bills.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">All Recurring Bills</h3>
                        <div className="space-y-2">
                            {bills.map(bill => (
                                <div key={bill.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(bill.category)}`}>
                                            {bill.category}
                                        </div>
                                        <div>
                                            <p className="font-medium">{bill.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Next: {new Date(bill.nextDueDate).toLocaleDateString()} · {bill.frequency}
                                                {bill.autoDetected && <span className="ml-2 text-primary">⚡ Auto-detected</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg">${bill.amount.toFixed(2)}</span>
                                        <button onClick={() => deleteBill(bill.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Bill Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                        <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-bold mb-4">Add Recurring Bill</h3>
                            <div className="space-y-3">
                                <input
                                    placeholder="Bill name (e.g., Netflix)"
                                    value={newBill.name}
                                    onChange={e => setNewBill(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary"
                                />
                                <input
                                    placeholder="Amount"
                                    type="number"
                                    value={newBill.amount}
                                    onChange={e => setNewBill(p => ({ ...p, amount: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary"
                                />
                                <select
                                    value={newBill.frequency}
                                    onChange={e => setNewBill(p => ({ ...p, frequency: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary"
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Biweekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                                <input
                                    type="date"
                                    value={newBill.nextDueDate}
                                    onChange={e => setNewBill(p => ({ ...p, nextDueDate: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary"
                                />
                                <select
                                    value={newBill.category}
                                    onChange={e => setNewBill(p => ({ ...p, category: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary"
                                >
                                    <option value="Subscription">Subscription</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Food">Food</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Entertainment">Entertainment</option>
                                </select>
                            </div>
                            <div className="flex gap-2 mt-5">
                                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-foreground/5 text-sm">Cancel</button>
                                <button onClick={handleAdd} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Add Bill</button>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
}
