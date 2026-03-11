import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Calendar, Loader2, BarChart3, DollarSign, TrendingUp, PiggyBank } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { exportTransactionsCSV, exportAccountsCSV } from '../lib/exportCsv';
import { exportReportPDF } from '../lib/exportPdf';
import { AnimatedPage, FadeInView, StaggerContainer, StaggerItem } from '../components/ui/AnimatedComponents';
import type { ReportData } from '../lib/exportCsv';

export default function Reports() {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [dateFrom, setDateFrom] = useState(firstOfMonth.toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(today.toISOString().split('T')[0]);
    const [reportType, setReportType] = useState('full');
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiFetch(
                `/api/reports/export?report_type=${reportType}&date_from=${dateFrom}&date_to=${dateTo}`
            );
            setReportData(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (reportData) exportReportPDF(reportData);
    };

    const handleDownloadCSV = () => {
        if (reportData) exportTransactionsCSV(reportData);
    };

    const handleDownloadAccountsCSV = () => {
        if (reportData) exportAccountsCSV(reportData);
    };

    const reportTypes = [
        { value: 'full', label: 'Full Report', icon: BarChart3, desc: 'Income, expenses, accounts, net worth' },
        { value: 'monthly', label: 'Monthly Spending', icon: DollarSign, desc: 'Spending breakdown by category' },
        { value: 'tax', label: 'Tax Summary', icon: FileText, desc: 'Tax-ready categorized expenses' },
        { value: 'investment', label: 'Investment Report', icon: TrendingUp, desc: 'Portfolio & investment summary' },
    ];

    return (
        <AnimatedPage>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Download className="w-8 h-8 text-primary" />
                        Export Reports
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Generate and download beautifully formatted PDF or CSV reports
                    </p>
                </div>

                {/* Report Type Selection */}
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportTypes.map((rt) => (
                        <StaggerItem key={rt.value}>
                            <button
                                onClick={() => setReportType(rt.value)}
                                className={`
                                    w-full text-left p-4 rounded-xl border transition-all duration-300
                                    ${reportType === rt.value
                                        ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.15)]'
                                        : 'border-border bg-card hover:border-primary/50 hover:bg-foreground/5'
                                    }
                                `}
                            >
                                <rt.icon className={`w-5 h-5 mb-2 ${reportType === rt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                                <p className="font-medium text-sm">{rt.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{rt.desc}</p>
                            </button>
                        </StaggerItem>
                    ))}
                </StaggerContainer>

                {/* Date Range + Generate */}
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">From</label>
                        <div className="relative">
                            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="pl-10 pr-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">To</label>
                        <div className="relative">
                            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="pl-10 pr-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <button
                        onClick={fetchReport}
                        disabled={isLoading}
                        className="px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                        ) : (
                            <><BarChart3 className="w-4 h-4" /> Generate Report</>
                        )}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4">
                        <p className="font-medium">Error</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}

                {/* Report Preview + Download */}
                {reportData && (
                    <FadeInView>
                        <div className="space-y-6">
                            {/* Download Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleDownloadPDF}
                                    className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <FileText className="w-4 h-4" /> Download PDF
                                </button>
                                <button
                                    onClick={handleDownloadCSV}
                                    className="px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <FileSpreadsheet className="w-4 h-4" /> Transactions CSV
                                </button>
                                <button
                                    onClick={handleDownloadAccountsCSV}
                                    className="px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <PiggyBank className="w-4 h-4" /> Accounts CSV
                                </button>
                            </div>

                            {/* Summary Cards */}
                            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StaggerItem>
                                    <div className="p-4 rounded-xl border border-border bg-card">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Income</p>
                                        <p className="text-xl font-bold text-green-400 mt-1">
                                            ${reportData.summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </StaggerItem>
                                <StaggerItem>
                                    <div className="p-4 rounded-xl border border-border bg-card">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Expenses</p>
                                        <p className="text-xl font-bold text-red-400 mt-1">
                                            ${reportData.summary.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </StaggerItem>
                                <StaggerItem>
                                    <div className="p-4 rounded-xl border border-border bg-card">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Net Balance</p>
                                        <p className={`text-xl font-bold mt-1 ${reportData.summary.netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {reportData.summary.netBalance >= 0 ? '+' : '-'}${Math.abs(reportData.summary.netBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </StaggerItem>
                                <StaggerItem>
                                    <div className="p-4 rounded-xl border border-border bg-card">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Transactions</p>
                                        <p className="text-xl font-bold text-foreground mt-1">{reportData.summary.totalTransactions}</p>
                                    </div>
                                </StaggerItem>
                            </StaggerContainer>

                            {/* Category Breakdown */}
                            {reportData.categoryBreakdown.length > 0 && (
                                <div className="rounded-xl border border-border bg-card p-5">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-primary" /> Category Breakdown
                                    </h3>
                                    <div className="space-y-3">
                                        {reportData.categoryBreakdown.map((cat) => (
                                            <div key={cat.category} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">{cat.category}</span>
                                                    <span className="font-medium">${cat.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({cat.percent}%)</span>
                                                </div>
                                                <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                                                        style={{ width: `${cat.percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Transactions Preview */}
                            {reportData.transactions.length > 0 && (
                                <div className="rounded-xl border border-border bg-card p-5">
                                    <h3 className="font-semibold mb-4">
                                        📋 Transactions ({reportData.transactions.length})
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                                                    <th className="pb-2 pr-4">Date</th>
                                                    <th className="pb-2 pr-4">Description</th>
                                                    <th className="pb-2 pr-4 text-right">Amount</th>
                                                    <th className="pb-2">Category</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.transactions.slice(0, 20).map((tx, i) => (
                                                    <tr key={i} className="border-b border-border/50 last:border-0">
                                                        <td className="py-2 pr-4 text-muted-foreground">{tx.date}</td>
                                                        <td className="py-2 pr-4">{tx.description}</td>
                                                        <td className={`py-2 pr-4 text-right font-medium ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                                            {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="py-2 text-muted-foreground">{tx.category}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {reportData.transactions.length > 20 && (
                                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                                Showing 20 of {reportData.transactions.length} — download PDF or CSV for full list
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </FadeInView>
                )}
            </div>
        </AnimatedPage>
    );
}
