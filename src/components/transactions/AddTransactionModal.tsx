import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { apiFetch } from '../../lib/api';
import { cn } from '../../lib/utils';

export function AddTransactionModal() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Food');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !description) return;
        setIsLoading(true);

        try {
            await apiFetch('/transactions', {
                method: 'POST',
                body: JSON.stringify({
                    date,
                    description,
                    amount: parseFloat(amount),
                    category: type === 'income' ? 'Income' : category,
                    type
                })
            });

            // Reset form
            setAmount('');
            setDescription('');
            setCategory('Food');
            setType('expense');
            setDate(format(new Date(), 'yyyy-MM-dd'));
            setOpen(false);

            // Trigger a soft-reload for other components
            window.dispatchEvent(new Event('transaction-added'));
        } catch (error) {
            console.error('Failed to add transaction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-primary/30 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all group">
                    <Plus
                        className="w-4 h-4 text-primary transition-all duration-300"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(var(--primary), 0.8))' }}
                    />
                    <span
                        className="inline font-semibold text-primary transition-all duration-300"
                        style={{ textShadow: '0 0 10px rgba(var(--primary), 0.8), 0 0 20px rgba(var(--primary), 0.4)' }}
                    >
                        Add Transaction
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Transaction Type</label>
                        <div className="flex p-1 bg-foreground/5 rounded-xl border border-border/50">
                            <button
                                type="button"
                                onClick={() => setType('expense')}
                                className={cn(
                                    "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2",
                                    type === 'expense' 
                                        ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                                )}
                            >
                                <span className={cn("w-2 h-2 rounded-full", type === 'expense' ? "bg-white" : "bg-red-500/50")} />
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('income')}
                                className={cn(
                                    "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2",
                                    type === 'income' 
                                        ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                                )}
                            >
                                <span className={cn("w-2 h-2 rounded-full", type === 'income' ? "bg-white" : "bg-emerald-500/50")} />
                                Income
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="date" className="text-sm font-medium">Date</label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="description" className="text-sm font-medium">Description</label>
                        <Input
                            id="description"
                            placeholder="e.g. Grocery Shopping"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    {type === 'expense' && (
                        <div className="grid gap-2">
                            <label htmlFor="category" className="text-sm font-medium">Category</label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Transport">Transport</SelectItem>
                                    <SelectItem value="Utilities">Utilities</SelectItem>
                                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                                    <SelectItem value="Shopping">Shopping</SelectItem>
                                    <SelectItem value="Subscription">Subscription</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Button type="submit" className="mt-4" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Add Transaction
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
