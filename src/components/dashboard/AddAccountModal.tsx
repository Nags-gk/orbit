import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Loader2 } from 'lucide-react';

interface AddAccountModalProps {
    onAddAccount: (account: { name: string; type: 'depository' | 'credit' | 'investment' | 'loan'; subtype: string; balance: number }) => Promise<void>;
}

export function AddAccountModal({ onAddAccount }: AddAccountModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [type, setType] = useState('credit');
    const [subtype, setSubtype] = useState('Credit Card');
    const [balance, setBalance] = useState('0.00');

    // Mappings for subtypes based on type
    const subtypesByType: Record<string, string[]> = {
        'depository': ['Checking', 'Savings'],
        'credit': ['Credit Card'],
        'investment': ['Brokerage', '401k', 'IRA', 'Stock'],
        'loan': ['Mortgage', 'Auto Loan', 'Personal Loan']
    };

    const handleTypeChange = (newType: string) => {
        setType(newType);
        // Reset subtype to the first applicable option
        setSubtype(subtypesByType[newType][0]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isNaN(Number(balance))) return;
        
        setIsLoading(true);
        try {
            await onAddAccount({
                name: name.trim(),
                type: type as 'depository' | 'credit' | 'investment' | 'loan',
                subtype: subtype,
                balance: Number(balance)
            });
            // Reset and close
            setName('');
            setType('credit');
            setSubtype('Credit Card');
            setBalance('0.00');
            setOpen(false);
        } catch (error) {
            console.error('Failed to add account:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:bg-primary/10 transition-colors">
                    <Plus className="w-4 h-4 text-primary" />
                    <span>Add Account</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Account Name</label>
                        <Input
                            placeholder="e.g. Chase Sapphire, Ally Savings..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Account Type</label>
                        <Select value={type} onValueChange={handleTypeChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="credit">Credit (Credit Cards)</SelectItem>
                                <SelectItem value="depository">Depository (Checking/Savings)</SelectItem>
                                <SelectItem value="investment">Investment (Stocks/Retirement)</SelectItem>
                                <SelectItem value="loan">Loan (Mortgage/Auto)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Subtype</label>
                        <Select value={subtype} onValueChange={setSubtype}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select subtype" />
                            </SelectTrigger>
                            <SelectContent>
                                {subtypesByType[type].map(sub => (
                                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Current Balance</label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" onClick={handleSubmit} className="mt-4 w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Create Account
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
