import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { useDocumentAI } from '../../hooks/useDocumentAI';
import { cn } from '../../lib/utils';

export function DocumentUploader() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [successData, setSuccessData] = useState<{ saved: number; skipped: number } | null>(null);
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

    const clearResult = useCallback(() => {
        setSuccessData(null);
        baseClearResult();
    }, [baseClearResult]);

    const handleConfirm = async () => {
        if (!uploadResult) return;
        const result = await confirmTransactions(uploadResult.transactions);
        if (result) {
            setSuccessData({ saved: result.saved, skipped: result.skipped });
        }
    };

    const handleFile = useCallback((file: File) => {
        setSuccessData(null);
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
                <div className="flex justify-center mb-2">
                    <div className="p-2 bg-emerald-500/20 rounded-full">
                        <Check className="w-5 h-5 text-emerald-500" />
                    </div>
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Import Complete</h4>
                <p className="text-xs text-muted-foreground">
                    Imported <span className="text-emerald-500 font-medium">{successData.saved}</span> transactions.
                    {successData.skipped > 0 && (
                        <> Skipped <span className="text-amber-500 font-medium">{successData.skipped}</span> duplicates.</>
                    )}
                </p>
                <button
                    onClick={clearResult}
                    className="mt-3 text-xs font-medium text-primary hover:underline"
                >
                    Upload another
                </button>
            </div>
        );
    }

    // Upload result view
    if (uploadResult) {
        return (
            <div className="rounded-xl border border-border bg-foreground/5 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">{uploadResult.filename}</h4>
                    </div>
                    <button onClick={clearResult} className="p-1 rounded-lg hover:bg-foreground/10 text-muted-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                    Found <span className="font-semibold text-primary">{uploadResult.transactionCount}</span> transactions
                </p>

                {uploadResult.transactions.length > 0 ? (
                    <>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 mb-3">
                            {uploadResult.transactions.map((tx, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-foreground/5 text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-muted-foreground">{tx.date}</span>
                                        <span className="text-foreground truncate">{tx.description}</span>
                                    </div>
                                    <span className={cn(
                                        "font-medium flex-shrink-0 ml-2",
                                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                                    )}>
                                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleConfirm}
                            disabled={isConfirming}
                            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            {isConfirming ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Check className="w-4 h-4" /> Import {uploadResult.transactionCount} transactions</>
                            )}
                        </button>
                    </>
                ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                        No transactions could be extracted from this document.
                    </p>
                )}
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
