import { useState, useCallback } from 'react';
import { Upload, FileText, TrendingUp, TrendingDown, AlertTriangle, BarChart3, X, Loader2, Minus } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { AnimatedPage, FadeInView } from '../ui/AnimatedComponents';

// ── Types ──
interface CategoryTrend {
    category: string;
    values: number[];
    changePercent: number;
    trend: 'increasing' | 'decreasing' | 'stable' | 'new' | 'stopped';
}

interface Anomaly {
    type: string;
    description: string;
    amount?: number;
    average?: number;
    period?: string;
    category?: string;
}

interface Insight {
    icon: string;
    title: string;
    description: string;
}

interface PeriodSummary {
    filename: string;
    transactionCount: number;
    totalIncome: number;
    totalExpenses: number;
    netFlow: number;
    categoryBreakdown: Record<string, number>;
}

interface ComparisonResult {
    documentCount: number;
    periods: PeriodSummary[];
    categoryTrends: CategoryTrend[];
    anomalies: Anomaly[];
    insights: Insight[];
    narrative?: string;
    summary: {
        totalDocuments: number;
        totalTransactions: number;
        avgMonthlyExpenses: number;
        categories: string[];
    };
}

// ── Helpers ──
const trendIcon = (trend: string) => {
    switch (trend) {
        case 'increasing': return <TrendingUp className="w-4 h-4 text-red-400" />;
        case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-400" />;
        case 'new': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
        case 'stopped': return <Minus className="w-4 h-4 text-gray-400" />;
        default: return <BarChart3 className="w-4 h-4 text-blue-400" />;
    }
};

const trendColor = (trend: string) => {
    switch (trend) {
        case 'increasing': return 'text-red-400';
        case 'decreasing': return 'text-green-400';
        case 'new': return 'text-amber-400';
        case 'stopped': return 'text-gray-400';
        default: return 'text-blue-400';
    }
};

export default function DocumentCompare() {
    const [files, setFiles] = useState<File[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ComparisonResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const newFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles].slice(0, 5));
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const analyzeDocuments = async () => {
        if (files.length < 2) return;
        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            files.forEach(f => formData.append('files', f));

            const data = await apiFetch('/api/documents/compare', {
                method: 'POST',
                body: formData,
            });
            setResult(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="w-7 h-7 text-violet-400" />
                        Multi-Document Analysis
                    </h1>
                    <p className="text-gray-400 mt-1">Upload 2-5 bank statements to compare spending across periods</p>
                </div>

                {/* Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`
                        relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
                        ${dragOver
                            ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
                            : 'border-gray-700 bg-gray-900/50 hover:border-gray-500 hover:bg-gray-800/50'
                        }
                    `}
                    onClick={() => document.getElementById('file-input')?.click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.csv,.xlsx"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragOver ? 'text-violet-400' : 'text-gray-500'}`} />
                    <p className="text-white font-medium">Drop bank statements here or click to browse</p>
                    <p className="text-gray-500 text-sm mt-1">PDF, Images, CSV, Excel • Max 20MB each • 2-5 files</p>
                </div>

                {/* Selected Files */}
                {files.length > 0 && (
                    <FadeInView>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
                                {files.length >= 2 && (
                                    <button
                                        onClick={analyzeDocuments}
                                        disabled={isAnalyzing}
                                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                    >
                                        {isAnalyzing ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                                        ) : (
                                            <><BarChart3 className="w-4 h-4" /> Compare Documents</>
                                        )}
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 rounded-xl p-3">
                                        <FileText className="w-5 h-5 text-violet-400 flex-shrink-0" />
                                        <span className="text-white text-sm truncate flex-1">{file.name}</span>
                                        <span className="text-gray-500 text-xs">{(file.size / 1024).toFixed(0)}KB</span>
                                        <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-gray-500 hover:text-red-400 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {files.length < 2 && (
                                <p className="text-amber-400 text-sm">⚠️ Upload at least 2 documents to compare</p>
                            )}
                        </div>
                    </FadeInView>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4">
                        <p className="font-medium">Analysis Failed</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <FadeInView>
                        <div className="space-y-6">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Documents</p>
                                    <p className="text-2xl font-bold text-white mt-1">{result.summary.totalDocuments}</p>
                                </div>
                                <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Transactions</p>
                                    <p className="text-2xl font-bold text-white mt-1">{result.summary.totalTransactions}</p>
                                </div>
                                <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Avg Expenses</p>
                                    <p className="text-2xl font-bold text-white mt-1">${result.summary.avgMonthlyExpenses.toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Categories</p>
                                    <p className="text-2xl font-bold text-white mt-1">{result.summary.categories.length}</p>
                                </div>
                            </div>

                            {/* AI Narrative */}
                            {result.narrative && (
                                <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl p-5">
                                    <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                                        🧠 AI Analysis
                                    </h3>
                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{result.narrative}</p>
                                </div>
                            )}

                            {/* Period Comparison */}
                            <div>
                                <h3 className="text-white font-semibold mb-3">📊 Period Comparison</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {result.periods.map((period, i) => (
                                        <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-violet-400" />
                                                <p className="text-white font-medium text-sm truncate">{period.filename}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-gray-500 text-xs">Income</p>
                                                    <p className="text-green-400 font-medium">${period.totalIncome.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs">Expenses</p>
                                                    <p className="text-red-400 font-medium">${period.totalExpenses.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs">Net Flow</p>
                                                    <p className={`font-medium ${period.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {period.netFlow >= 0 ? '+' : ''}${period.netFlow.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs">Transactions</p>
                                                    <p className="text-white font-medium">{period.transactionCount}</p>
                                                </div>
                                            </div>
                                            {/* Top categories */}
                                            <div className="space-y-1">
                                                {Object.entries(period.categoryBreakdown).slice(0, 4).map(([cat, amount]) => (
                                                    <div key={cat} className="flex justify-between text-xs">
                                                        <span className="text-gray-400">{cat}</span>
                                                        <span className="text-gray-300">${amount.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Category Trends */}
                            {result.categoryTrends.length > 0 && (
                                <div>
                                    <h3 className="text-white font-semibold mb-3">📈 Category Trends</h3>
                                    <div className="space-y-2">
                                        {result.categoryTrends.map((trend, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 rounded-xl p-3">
                                                {trendIcon(trend.trend)}
                                                <span className="text-white text-sm font-medium w-28">{trend.category}</span>
                                                <div className="flex-1 flex items-center gap-2">
                                                    {trend.values.map((v, j) => (
                                                        <span key={j} className="text-gray-400 text-xs">${v.toLocaleString()}</span>
                                                    ))}
                                                </div>
                                                <span className={`text-sm font-semibold ${trendColor(trend.trend)}`}>
                                                    {trend.changePercent > 0 ? '+' : ''}{trend.changePercent}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Anomalies */}
                            {result.anomalies.length > 0 && (
                                <div>
                                    <h3 className="text-white font-semibold mb-3">🔍 Anomalies Detected</h3>
                                    <div className="space-y-2">
                                        {result.anomalies.map((anomaly, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-white text-sm font-medium">{anomaly.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                                    <p className="text-gray-400 text-xs mt-0.5">{anomaly.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Insights */}
                            {result.insights.length > 0 && (
                                <div>
                                    <h3 className="text-white font-semibold mb-3">💡 Insights</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {result.insights.map((insight, i) => (
                                            <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                                                <p className="text-white text-sm font-medium">{insight.icon} {insight.title}</p>
                                                <p className="text-gray-400 text-xs mt-1">{insight.description}</p>
                                            </div>
                                        ))}
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
