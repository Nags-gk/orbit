import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Pencil } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export function EditTransactionModal({ transaction }: { transaction: any }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState(transaction.amount.toString());
    const [description, setDescription] = useState(transaction.description);
    const [category, setCategory] = useState(transaction.category);
    const [type, setType] = useState<'income' | 'expense'>(transaction.type);
    const [date, setDate] = useState(transaction.date);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !description) return;
        setIsLoading(true);

        try {
            await apiFetch(`/transactions/${transaction.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    date,
                    description,
                    amount: parseFloat(amount),
                    category: type === 'income' ? 'Income' : category,
                    type
                })
            });

            setOpen(false);
            window.dispatchEvent(new Event('transaction-added'));
        } catch (error) {
            console.error('Failed to update transaction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (isOpen) {
                setAmount(transaction.amount.toString());
                setDescription(transaction.description);
                setCategory(transaction.category);
                setType(transaction.type);
                setDate(transaction.date);
            }
            setOpen(isOpen);
        }}>
            <DialogTrigger asChild>
                <button title="Edit Transaction" className="p-2 hover:bg-foreground/10 rounded-lg text-muted-foreground transition-colors ml-2">
                    <Pencil className="w-4 h-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="edit-type" className="text-sm font-medium">Type</label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={type === 'expense' ? 'default' : 'outline'}
                                onClick={() => setType('expense')}
                                className="flex-1"
                            >
                                Expense
                            </Button>
                            <Button
                                type="button"
                                variant={type === 'income' ? 'default' : 'outline'}
                                onClick={() => setType('income')}
                                className="flex-1"
                            >
                                Income
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="edit-date" className="text-sm font-medium">Date</label>
                        <Input
                            id="edit-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="edit-amount" className="text-sm font-medium">Amount</label>
                        <Input
                            id="edit-amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
                        <Input
                            id="edit-description"
                            placeholder="e.g. Grocery Shopping"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    {type === 'expense' && (
                        <div className="grid gap-2">
                            <label htmlFor="edit-category" className="text-sm font-medium">Category</label>
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
                        Save Changes
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
