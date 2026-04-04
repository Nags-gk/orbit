import { useState, useEffect, useCallback } from 'react';
import { Search, ArrowUpDown, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { apiFetch } from '../lib/api';
import { EditTransactionModal } from '../components/transactions/EditTransactionModal';
import { AnimatedPage, StaggerContainer, StaggerItem } from '../components/ui/AnimatedComponents';
import { EmptyState } from '../components/ui/EmptyState';

interface Transaction {
    id: number;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
    accountName: string;
    accountType: string;
}


export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'all' | 'depository' | 'credit' | 'other'>('all');
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

    const filteredByTab = transactions.filter(tx => {
        if (activeTab === 'all') return true;
        if (activeTab === 'depository') return tx.accountType === 'depository';
        if (activeTab === 'credit') return tx.accountType === 'credit';
        return tx.accountType !== 'depository' && tx.accountType !== 'credit';
    });

    const filtered = filteredByTab.filter(tx => {
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
    
    // Logic: Income on a credit card (like paying a bill or a statement credit) 
    // reduces debt but is not "Real Income" (like a salary). We exclude it from the widget summary so it acts as a Transfer.
    const isCreditPayment = (t: Transaction) => t.type === 'income' && t.accountType === 'credit';
    
    const totalIncome = filteredByTab.filter(t => t.type === 'income' && !isCreditPayment(t)).reduce((s, t) => s + t.amount, 0);
    const totalExpenses = filteredByTab.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);


    const tabs = [
        { id: 'all', label: 'All Activity' },
        { id: 'depository', label: 'Debit / Cash' },
        { id: 'credit', label: 'Credit Cards' },
        { id: 'other', label: 'Others' }
    ] as const;

    return (
        <AnimatedPage>
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

                {/* Tabs */}
                <div className="flex items-center p-1 rounded-xl bg-foreground/5 border border-border w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === tab.id 
                                    ? "bg-primary text-white shadow-lg"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Summary */}
                <StaggerContainer className="grid gap-4 md:grid-cols-3">
                    <StaggerItem>
                        <div className="rounded-xl border border-border bg-foreground/5 p-4">
                            <p className="text-xs text-muted-foreground mb-1">
                                {activeTab === 'all' ? 'Total Transactions' : `${tabs.find(t => t.id === activeTab)?.label} Count`}
                            </p>
                            <p className="text-2xl font-bold text-foreground">{filteredByTab.length}</p>
                        </div>
                    </StaggerItem>
                    <StaggerItem>
                        <div className="rounded-xl border border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5 p-4">
                            <div className="flex items-center gap-1 mb-1">
                                <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <p className="text-xs text-muted-foreground">Inflow</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                    </StaggerItem>
                    <StaggerItem>
                        <div className="rounded-xl border border-red-500/30 dark:border-red-500/20 bg-red-500/10 dark:bg-red-500/5 p-4">
                            <div className="flex items-center gap-1 mb-1">
                                <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                                <p className="text-xs text-muted-foreground">Outflow</p>
                            </div>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                    </StaggerItem>
                </StaggerContainer>

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
                ) : sorted.length === 0 ? (
                    <EmptyState
                        icon="transactions"
                        title="No transactions found"
                        description={activeTab === 'all' 
                            ? "Start by adding your first transaction." 
                            : `No transactions match the ${activeTab} filter.`}
                        actionLabel="Add Transaction"
                    />
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
                                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Account</th>
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
                                {sorted.map((tx, index) => (
                                    <motion.tr
                                        key={tx.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.3 }}
                                        className="border-b border-border/50 hover:bg-foreground/5 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {format(new Date(`${tx.date}T12:00:00`), 'd MMM yy')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground">{tx.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                                                tx.accountType === 'credit' ? "bg-orange-500/10 text-orange-600 border-orange-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                            )}>
                                                {tx.accountName}
                                            </span>
                                        </td>
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
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
}


