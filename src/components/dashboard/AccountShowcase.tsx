import { useState } from 'react';
import { CreditCard, Landmark, LineChart, Wallet, Pencil, Check, X, Loader2 } from 'lucide-react';
import type { Account } from '../../hooks/useAccounts';

interface AccountShowcaseProps {
    accounts: Account[];
    isLoading: boolean;
    onUpdateAccount?: (id: string, updates: Partial<Pick<Account, 'name' | 'balance'>>) => Promise<void>;
}

export function AccountShowcase({ accounts, isLoading, onUpdateAccount }: AccountShowcaseProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Accounts & Investments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-36 bg-card rounded-xl border border-border" />
                    ))}
                </div>
            </div>
        );
    }

    if (accounts.length === 0) {
        return null;
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'credit': return <CreditCard className="w-5 h-5 text-primary" />;
            case 'investment': return <LineChart className="w-5 h-5 text-emerald-500" />;
            case 'depository': return <Landmark className="w-5 h-5 text-blue-500" />;
            default: return <Wallet className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getGradient = (type: string) => {
        switch (type) {
            case 'credit': return 'from-primary/20 to-transparent';
            case 'investment': return 'from-emerald-500/20 to-transparent';
            case 'depository': return 'from-blue-500/20 to-transparent';
            default: return 'from-gray-500/20 to-transparent';
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const startEditing = (account: Account) => {
        setEditingId(account.id);
        setEditName(account.name);
        setError(null);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
    };

    const saveEdit = async (id: string) => {
        if (!onUpdateAccount || !editName.trim()) {
            cancelEditing();
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            await onUpdateAccount(id, { name: editName.trim() });
            setEditingId(null);
            setEditName('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
            // Keep editing mode open so they can try again or fix the name
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Accounts & Investments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {accounts.map((account) => (
                    <div
                        key={account.id}
                        className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50 group"
                    >
                        {/* Subtle background gradient glow based on account type */}
                        <div className={`absolute -inset-1 bg-gradient-to-br ${getGradient(account.type)} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-xl -z-10`} />

                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-background/50 rounded-lg border border-border/50 backdrop-blur-sm">
                                {getIcon(account.type)}
                            </div>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border/50">
                                {account.subtype}
                            </span>
                        </div>

                        <div className="space-y-1">
                            {editingId === account.id ? (
                                <>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveEdit(account.id);
                                                if (e.key === 'Escape') cancelEditing();
                                            }}
                                            disabled={isSaving}
                                            className={`text-sm font-medium bg-background/80 border rounded px-2 py-0.5 w-full text-foreground outline-none transition-colors ${error ? 'border-destructive' : 'border-border focus:border-primary'}`}
                                            autoFocus
                                            placeholder={account.subtype}
                                        />
                                        {isSaving ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => saveEdit(account.id)} 
                                                    className="p-1 hover:text-primary text-muted-foreground transition-colors"
                                                    title="Save"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={cancelEditing} 
                                                    className="p-1 hover:text-destructive text-muted-foreground transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    {error && (
                                        <p className="text-[10px] text-destructive mt-0.5 ml-1 animate-pulse">
                                            {error}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-medium text-muted-foreground truncate">
                                        {account.name}
                                    </p>
                                    {onUpdateAccount && (
                                        <button
                                            onClick={() => startEditing(account)}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-primary text-muted-foreground transition-all"
                                            title="Edit account name"
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            )}
                            <h3 className="text-2xl font-bold tracking-tight">
                                {formatCurrency(account.balance, account.currency)}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
