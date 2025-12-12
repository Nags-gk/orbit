
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import type { Subscription } from '../../lib/mockData';
import { Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionCardProps {
    subscription: Subscription;
    onCancel: (id: string) => void;
}

export function SubscriptionCard({ subscription, onCancel }: SubscriptionCardProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">{subscription.name}</CardTitle>
                <span className="text-sm font-medium text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                    {subscription.category}
                </span>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
                <div className="text-3xl font-bold mb-4">${subscription.cost.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Renews on {format(new Date(subscription.renewalDate), 'MMM do')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Auto-pay enabled</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => onCancel(subscription.id)}
                >
                    Cancel Subscription
                </Button>
            </CardFooter>
        </Card>
    );
}
