import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';

export function AddTransactionModal() {
    const { addTransaction } = useStore();
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Food');
    const [type, setType] = useState<'income' | 'expense'>('expense');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !description) return;

        addTransaction({
            id: `tx-${Date.now()}`,
            date: format(new Date(), 'yyyy-MM-dd'),
            description,
            amount: parseFloat(amount),
            category: category as any,
            type
        });

        // Reset form
        setAmount('');
        setDescription('');
        setCategory('Food');
        setType('expense');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Transaction</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="type" className="text-sm font-medium">Type</label>
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
                                <SelectItem value="Income">Income</SelectItem>
                                <SelectItem value="Subscription">Subscription</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" className="mt-4">Add Transaction</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
