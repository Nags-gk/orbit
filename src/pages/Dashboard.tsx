import { useEffect } from 'react';
import { DollarSign, CreditCard, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { SpendingChart } from '../components/charts/SpendingChart';
import { CategoryChart } from '../components/charts/CategoryChart';
import { InsightsPanel } from '../components/ai/InsightCard';
import { PredictionChart } from '../components/ai/PredictionChart';
import { DocumentUploader } from '../components/ai/DocumentUploader';
import { AccountShowcase } from '../components/dashboard/AccountShowcase';
import { NetWorthChart } from '../components/dashboard/NetWorthChart';
import { SavingsGoals } from '../components/dashboard/SavingsGoals';
import { AnimatedPage, StaggerContainer, StaggerItem, FadeInView } from '../components/ui/AnimatedComponents';
import { useInsights } from '../hooks/useInsights';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useAccounts } from '../hooks/useAccounts';

export default function Dashboard() {
    const { insights, forecast, isLoading: insightsLoading, refresh: refreshInsights } = useInsights();
    const { summary, isLoading: statsLoading, refresh: refreshStats } = useDashboardStats();
    const { accounts, isLoading: accountsLoading, refresh: refreshAccounts, updateAccount, addAccount, deleteAccount } = useAccounts();

    useEffect(() => {
        const handleTransactionAdded = () => {
            refreshStats();
            refreshAccounts();
            refreshInsights();
        };
        window.addEventListener('transaction-added', handleTransactionAdded);
        return () => window.removeEventListener('transaction-added', handleTransactionAdded);
    }, [refreshStats, refreshAccounts, refreshInsights]);

    const isLoading = insightsLoading || statsLoading || accountsLoading;
    const handleRefresh = () => {
        refreshInsights();
        refreshStats();
        refreshAccounts();
    };

    return (
        <AnimatedPage>
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

                <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StaggerItem>
                        <StatsCard
                            title="Total Balance"
                            value={summary ? `$${summary.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
                            icon={DollarSign}
                            trend="All time net balance"
                            trendUp={true}
                        />
                    </StaggerItem>
                    <StaggerItem>
                        <StatsCard
                            title="Monthly Spending"
                            value={summary ? `$${summary.monthlySpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
                            icon={CreditCard}
                            trend="This month"
                            trendUp={false}
                        />
                    </StaggerItem>
                    <StaggerItem>
                        <StatsCard
                            title="Active Subscriptions"
                            value={summary ? summary.activeSubscriptions.toString() : "0"}
                            icon={Activity}
                            trend="Current tracked services"
                            trendUp={true}
                        />
                    </StaggerItem>
                    <StaggerItem>
                        <StatsCard
                            title="Savings Goal"
                            value={summary ? `$${summary.savingsGoal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$5,000.00"}
                            icon={TrendingUp}
                            trend="Current target"
                            trendUp={true}
                        />
                    </StaggerItem>
                </StaggerContainer>

                {/* Account & Investment Breakdown */}
                <FadeInView>
                    <AccountShowcase accounts={accounts} isLoading={accountsLoading} onUpdateAccount={updateAccount} onAddAccount={addAccount} onDeleteAccount={deleteAccount} />
                </FadeInView>

                {/* Net Worth + Savings Goals side-by-side */}
                <FadeInView delay={0.1}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <NetWorthChart />
                        <SavingsGoals />
                    </div>
                </FadeInView>

                {/* AI Insights + Forecast */}
                <FadeInView delay={0.15}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            {insights.length > 0 && (
                                <InsightsPanel insights={insights} />
                            )}
                            <DocumentUploader />
                        </div>
                        {forecast && forecast.historical.length > 0 && (
                            <PredictionChart data={forecast} />
                        )}
                    </div>
                </FadeInView>

                <FadeInView delay={0.2}>
                    <div className="grid gap-4 md:grid-cols-7">
                        <SpendingChart />
                        <CategoryChart />
                    </div>
                </FadeInView>
            </div>
        </AnimatedPage>
    );
}
