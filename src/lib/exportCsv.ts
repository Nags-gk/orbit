/**
 * CSV Export Utility for Orbit Financial Reports.
 * 
 * Generates downloadable CSV files from report data.
 */

interface ReportData {
    reportType: string;
    generatedAt: string;
    dateRange: { from: string; to: string };
    userName?: string;
    summary: {
        totalTransactions: number;
        totalIncome: number;
        totalExpenses: number;
        netBalance: number;
        totalAssets: number;
        totalLiabilities: number;
        netWorth: number;
    };
    categoryBreakdown: Array<{ category: string; amount: number; percent: number }>;
    transactions: Array<{
        date: string;
        description: string;
        amount: number;
        category: string;
        type: string;
    }>;
    accounts: Array<{
        name: string;
        type: string;
        subtype: string;
        balance: number;
    }>;
}

function escapeCSV(value: string | number): string {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export function exportTransactionsCSV(data: ReportData): void {
    const rows: string[] = [];

    // Header
    rows.push('Date,Description,Amount,Category,Type');

    // Transactions
    for (const tx of data.transactions) {
        rows.push([
            escapeCSV(tx.date),
            escapeCSV(tx.description),
            escapeCSV(tx.amount.toFixed(2)),
            escapeCSV(tx.category),
            escapeCSV(tx.type),
        ].join(','));
    }

    // Summary section
    rows.push('');
    rows.push('--- Summary ---');
    rows.push(`Total Income,${data.summary.totalIncome.toFixed(2)}`);
    rows.push(`Total Expenses,${data.summary.totalExpenses.toFixed(2)}`);
    rows.push(`Net Balance,${data.summary.netBalance.toFixed(2)}`);

    // Category breakdown
    rows.push('');
    rows.push('--- Category Breakdown ---');
    rows.push('Category,Amount,Percent');
    for (const cat of data.categoryBreakdown) {
        rows.push(`${escapeCSV(cat.category)},${cat.amount.toFixed(2)},${cat.percent}%`);
    }

    const csv = rows.join('\n');
    downloadFile(csv, `orbit-report-${data.dateRange.from}-to-${data.dateRange.to}.csv`, 'text/csv');
}

export function exportAccountsCSV(data: ReportData): void {
    const rows: string[] = [];

    rows.push('Account Name,Type,Subtype,Balance');
    for (const acct of data.accounts) {
        rows.push([
            escapeCSV(acct.name),
            escapeCSV(acct.type),
            escapeCSV(acct.subtype),
            escapeCSV(acct.balance.toFixed(2)),
        ].join(','));
    }

    rows.push('');
    rows.push(`Total Assets,${data.summary.totalAssets.toFixed(2)}`);
    rows.push(`Total Liabilities,${data.summary.totalLiabilities.toFixed(2)}`);
    rows.push(`Net Worth,${data.summary.netWorth.toFixed(2)}`);

    const csv = rows.join('\n');
    downloadFile(csv, `orbit-accounts-${data.dateRange.from}.csv`, 'text/csv');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export type { ReportData };
