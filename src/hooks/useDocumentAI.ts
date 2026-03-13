import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

interface ExtractedTransaction {
    date: string;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
}

interface UploadResult {
    filename: string;
    pageCount: number;
    textLength: number;
    transactions: ExtractedTransaction[];
    transactionCount: number;
    message: string;
}

interface UseDocumentAIReturn {
    isUploading: boolean;
    isConfirming: boolean;
    uploadResult: UploadResult | null;
    error: string | null;
    uploadDocument: (file: File) => Promise<void>;
    confirmTransactions: (transactions: ExtractedTransaction[]) => Promise<any>;
    clearResult: () => void;
}


export function useDocumentAI(): UseDocumentAIReturn {
    const [isUploading, setIsUploading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const uploadDocument = useCallback(async (file: File) => {
        setIsUploading(true);
        setError(null);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await apiFetch('/documents/upload', {
                method: 'POST',
                body: formData,
            });
            setUploadResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    }, []);

    const confirmTransactions = useCallback(async (transactions: ExtractedTransaction[]) => {
        setIsConfirming(true);
        setError(null);

        try {
            const result = await apiFetch('/documents/confirm', {
                method: 'POST',
                body: JSON.stringify(transactions),
            });

            // Dispatch event so Dashboard or other components can refresh
            window.dispatchEvent(new CustomEvent('transaction-added', { detail: result }));
            
            // Clear result after successful save
            setUploadResult(null);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setIsConfirming(false);
        }
    }, []);

    const clearResult = useCallback(() => {
        setUploadResult(null);
        setError(null);
    }, []);

    return {
        isUploading,
        isConfirming,
        uploadResult,
        error,
        uploadDocument,
        confirmTransactions,
        clearResult,
    };
}
