import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Check, X, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { useDocumentAI } from '../../hooks/useDocumentAI';
import { useAccounts } from '../../hooks/useAccounts';
import { cn } from '../../lib/utils';
import { StaggerContainer, StaggerItem } from '../../components/ui/AnimatedComponents';

export function DocumentUploader() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [successData, setSuccessData] = useState<{ saved: number; skipped: number } | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        isUploading,
        isConfirming,
        uploadResult,
        error,
        uploadDocument,
        confirmTransactions,
        clearResult: baseClearResult,
    } = useDocumentAI();

    const { accounts } = useAccounts();

    const clearResult = useCallback(() => {
        setSuccessData(null);
        setSelectedAccountId('');
        baseClearResult();
    }, [baseClearResult]);

    const handleConfirm = async () => {
        if (!uploadResult) return;
        const result = await confirmTransactions(uploadResult.transactions, selectedAccountId);
        if (result) {
            setSuccessData({ saved: result.saved, skipped: result.skipped });
        }
    };

    const handleFile = useCallback((file: File) => {
        setSuccessData(null);
        setSelectedAccountId('');
        // Accept PDFs, Images (PNG/JPG), and CSV/Excel
        if (!file.type.match(/(pdf|image\/|text\/csv|spreadsheetml)/)) {
            return;
        }
        uploadDocument(file);
    }, [uploadDocument]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    // Success View
    if (successData) {
        return (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <StaggerContainer>
                    <StaggerItem>
                        <div className="flex justify-center mb-2">
                            <div className="p-2 bg-emerald-500/20 rounded-full">
                                <Check className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                    </StaggerItem>
                    <StaggerItem>
                        <h4 className="text-sm font-semibold text-foreground mb-1">Import Complete</h4>
                        <p className="text-xs text-muted-foreground">
                            Imported <span className="text-emerald-500 font-medium">{successData.saved}</span> transactions.
                            {successData.skipped > 0 && (
                                <> Skipped <span className="text-amber-500 font-medium">{successData.skipped}</span> duplicates.</>
                            )}
                        </p>
                    </StaggerItem>
                    <StaggerItem>
                        <button
                            onClick={clearResult}
                            className="mt-3 text-xs font-medium text-primary hover:underline"
                        >
                            Upload another
                        </button>
                    </StaggerItem>
                </StaggerContainer>
            </div>
        );
    }

    // Upload result view
    if (uploadResult) {
        return (
            <div className="rounded-xl border border-border bg-foreground/5 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">{uploadResult.filename}</h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">AI Analysis Ready</p>
                        </div>
                    </div>
                    <button onClick={clearResult} className="p-1 rounded-lg hover:bg-foreground/10 text-muted-foreground transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-3">
                    {/* Account Selection */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-muted-foreground uppercase flex items-center gap-1.5 px-1">
                            Link to Account
                        </label>
                        <div className="relative">
                            <select
                                value={selectedAccountId}
                                onChange={(e) => setSelectedAccountId(e.target.value)}
                                className="w-full h-9 pl-9 pr-4 rounded-lg bg-foreground/5 border-none text-xs text-foreground appearance-none hover:bg-foreground/10 focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer shadow-inner"
                            >
                                <option value="">Select an account (optional)</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name} (${acc.balance.toLocaleString()})
                                    </option>
                                ))}
                            </select>
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-foreground/5 space-y-2 max-h-56 overflow-y-auto custom-scrollbar border border-foreground/5">
                        <div className="flex items-center justify-between mb-1 px-1">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">Extracted Transactions</span>
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">{uploadResult.transactionCount}</span>
                        </div>
                        {uploadResult.transactions.length > 0 ? (
                            <div className="space-y-1">
                                {uploadResult.transactions.map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-background/40 border border-foreground/[0.03] text-[11px] group hover:border-primary/20 transition-colors">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-muted-foreground font-mono">{tx.date.split('-').slice(1).join('/')}</span>
                                            <span className="text-foreground truncate font-medium">{tx.description}</span>
                                        </div>
                                        <span className={cn(
                                            "font-bold flex-shrink-0 ml-2 px-1.5 py-0.5 rounded",
                                            tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'text-foreground'
                                        )}>
                                            {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[11px] text-muted-foreground text-center py-4">
                                No transactions found.
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={isConfirming || uploadResult.transactions.length === 0}
                        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isConfirming ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving to Database...</>
                        ) : (
                            <><Check className="w-3.5 h-3.5" /> Confirm Import</>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="rounded-xl border border-red-500/30 dark:border-red-500/20 bg-red-500/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Upload Error</span>
                </div>
                <p className="text-xs text-red-300/80">{error}</p>
                <button
                    onClick={clearResult}
                    className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-300 transition-colors"
                >
                    Try again
                </button>
            </div>
        );
    }

    // Upload zone
    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
                "rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200",
                isDragOver
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-foreground/5 hover:border-primary/30 hover:bg-foreground/[0.07]"
            )}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
                className="hidden"
            />

            {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading for AI Analysis...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <Upload className={cn(
                        "w-8 h-8 transition-colors",
                        isDragOver ? "text-primary" : "text-muted-foreground/50"
                    )} />
                    <div>
                        <p className="text-sm font-medium text-foreground">Upload Document</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            PDF, Image, Excel, or CSV • Max 20MB
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
