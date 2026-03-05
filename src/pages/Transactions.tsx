import { useState, useEffect, useCallback } from 'react';
import { Search, ArrowUpDown, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { apiFetch } from '../lib/api';
import { EditTransactionModal } from '../components/transactions/EditTransactionModal';

interface Transaction {
    id: number;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
}


export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortKey, setSortKey] = useState<'date' | 'amount'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch('/transactions');
            setTransactions(data);
        } catch { /* network error */ } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        window.addEventListener('transaction-added', fetchData);
        return () => window.removeEventListener('transaction-added', fetchData);
    }, [fetchData]);

    const filtered = transactions.filter(tx => {
        const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
        const aVal = sortKey === 'date' ? new Date(a.date).getTime() : a.amount;
        const bVal = sortKey === 'date' ? new Date(b.date).getTime() : b.amount;
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    const toggleSort = (key: 'date' | 'amount') => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const categories = [...new Set(transactions.map(t => t.category))].sort();
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground">
                        View and manage your transaction history.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors border border-border"
                >
                    <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                </button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-foreground/5 p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
                    <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5 p-4">
                    <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-xs text-muted-foreground">Income</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-xl border border-red-500/30 dark:border-red-500/20 bg-red-500/10 dark:bg-red-500/5 p-4">
                    <div className="flex items-center gap-1 mb-1">
                        <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                        <p className="text-xs text-muted-foreground">Expenses</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-foreground/5 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-foreground/5 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : (
                <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-foreground/5">
                                <th className="text-left px-4 py-3">
                                    <button onClick={() => toggleSort('date')} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                                        Date
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Description</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Category</th>
                                <th className="text-right px-4 py-3">
                                    <button onClick={() => toggleSort('amount')} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto">
                                        Amount
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="px-4 py-3 w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map(tx => (
                                <tr key={tx.id} className="border-b border-border/50 hover:bg-foreground/5 transition-colors">
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {format(new Date(`${tx.date}T12:00:00`), 'd MMM yy')}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-foreground">{tx.description}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/10 text-muted-foreground font-medium">
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className={cn(
                                        "px-4 py-3 text-sm font-semibold text-right",
                                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                                    )}>
                                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <EditTransactionModal transaction={tx} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {sorted.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-sm text-muted-foreground">No transactions found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
