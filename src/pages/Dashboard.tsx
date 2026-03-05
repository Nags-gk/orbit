import { useEffect } from 'react';
import { DollarSign, CreditCard, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { SpendingChart } from '../components/charts/SpendingChart';
import { CategoryChart } from '../components/charts/CategoryChart';
import { InsightsPanel } from '../components/ai/InsightCard';
import { PredictionChart } from '../components/ai/PredictionChart';
import { DocumentUploader } from '../components/ai/DocumentUploader';
import { useInsights } from '../hooks/useInsights';
import { useDashboardStats } from '../hooks/useDashboardStats';

export default function Dashboard() {
    const { insights, forecast, isLoading: insightsLoading, refresh: refreshInsights } = useInsights();
    const { summary, isLoading: statsLoading, refresh: refreshStats } = useDashboardStats();

    useEffect(() => {
        window.addEventListener('transaction-added', refreshStats);
        return () => window.removeEventListener('transaction-added', refreshStats);
    }, [refreshStats]);

    const isLoading = insightsLoading || statsLoading;
    const handleRefresh = () => {
        refreshInsights();
        refreshStats();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Overview of your financial health.
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                    title="Refresh dashboard"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Balance"
                    value={summary ? `$${summary.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
                    icon={DollarSign}
                    trend="All time net balance"
                    trendUp={true}
                />
                <StatsCard
                    title="Monthly Spending"
                    value={summary ? `$${summary.monthlySpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
                    icon={CreditCard}
                    trend="This month"
                    trendUp={false}
                />
                <StatsCard
                    title="Active Subscriptions"
                    value={summary ? summary.activeSubscriptions.toString() : "0"}
                    icon={Activity}
                    trend="Current tracked services"
                    trendUp={true}
                />
                <StatsCard
                    title="Savings Goal"
                    value={summary ? `$${summary.savingsGoal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$5,000.00"}
                    icon={TrendingUp}
                    trend="Current target"
                    trendUp={true}
                />
            </div>

            {/* AI Insights + Forecast */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Insights */}
                <div className="space-y-4">
                    {insights.length > 0 && (
                        <InsightsPanel insights={insights} />
                    )}
                    {/* Document upload */}
                    <DocumentUploader />
                </div>

                {/* Forecast chart */}
                {forecast && forecast.historical.length > 0 && (
                    <PredictionChart data={forecast} />
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <SpendingChart />
                <CategoryChart />
            </div>
        </div>
    );
}
