
import { useStore } from '../store/useStore';
import { SubscriptionCard } from '../components/subscriptions/SubscriptionCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DollarSign } from 'lucide-react';

export default function Subscriptions() {
    const { subscriptions, removeSubscription } = useStore();

    const totalMonthlyCost = subscriptions.reduce((acc, sub) => acc + sub.cost, 0);

    const handleCancel = (id: string) => {
        if (window.confirm('Are you sure you want to cancel this subscription?')) {
            removeSubscription(id);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
                <p className="text-muted-foreground">
                    Manage your recurring subscriptions and expenses.
                </p>
            </div>

            <Card className="glass-card border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium text-muted-foreground">
                        Total Monthly Cost
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-primary">
                        ${totalMonthlyCost.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Across {subscriptions.length} active subscriptions
                    </p>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {subscriptions.map((sub) => (
                    <SubscriptionCard
                        key={sub.id}
                        subscription={sub}
                        onCancel={handleCancel}
                    />
                ))}
            </div>
        </div>
    );
}
