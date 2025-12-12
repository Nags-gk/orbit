
import { DollarSign, CreditCard, Activity, TrendingUp } from 'lucide-react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { SpendingChart } from '../components/charts/SpendingChart';
import { CategoryChart } from '../components/charts/CategoryChart';

export default function Dashboard() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of your financial health.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Balance"
                    value="$12,345.00"
                    icon={DollarSign}
                    trend="+2.5% from last month"
                    trendUp={true}
                />
                <StatsCard
                    title="Monthly Spending"
                    value="$2,345.00"
                    icon={CreditCard}
                    trend="+10% from last month"
                    trendUp={false}
                />
                <StatsCard
                    title="Active Subscriptions"
                    value="5"
                    icon={Activity}
                    trend="Same as last month"
                    trendUp={true}
                />
                <StatsCard
                    title="Savings Goal"
                    value="$5,000.00"
                    icon={TrendingUp}
                    trend="+5% towards goal"
                    trendUp={true}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <SpendingChart />
                <CategoryChart />
            </div>
        </div>
    );
}
