import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface Notification {
    id: string;
    type: 'warning' | 'info' | 'success' | 'danger';
    title: string;
    message: string;
    read: boolean;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const generateAlerts = useCallback(async () => {
        const alerts: Notification[] = [];
        let counter = 0;

        try {
            // Check budget overages
            const budgets = await apiFetch('/budgets');
            const summary = await apiFetch('/summary');

            if (budgets && summary?.categoryBreakdown) {
                for (const budget of budgets) {
                    const spent = summary.categoryBreakdown[budget.category] || 0;
                    const pct = (spent / budget.monthlyLimit) * 100;
                    if (pct >= 100) {
                        alerts.push({
                            id: `budget-${counter++}`,
                            type: 'danger',
                            title: `${budget.category} Budget Exceeded`,
                            message: `You've spent $${spent.toFixed(0)} of your $${budget.monthlyLimit} limit.`,
                            read: false,
                        });
                    } else if (pct >= 80) {
                        alerts.push({
                            id: `budget-${counter++}`,
                            type: 'warning',
                            title: `${budget.category} Budget at ${pct.toFixed(0)}%`,
                            message: `$${(budget.monthlyLimit - spent).toFixed(0)} remaining this month.`,
                            read: false,
                        });
                    }
                }
            }

            // Check upcoming bills
            try {
                const bills = await apiFetch('/bills');
                const today = new Date();
                for (const bill of bills) {
                    const dueDate = new Date(bill.nextDueDate);
                    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysUntil <= 3 && daysUntil >= 0) {
                        alerts.push({
                            id: `bill-${counter++}`,
                            type: 'warning',
                            title: `${bill.name} Due ${daysUntil === 0 ? 'Today' : `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}`,
                            message: `$${bill.amount.toFixed(2)} payment coming up.`,
                            read: false,
                        });
                    }
                }
            } catch { /* bills endpoint may not have data */ }

            // Check spending anomalies
            if (summary) {
                if (summary.monthlySpending > 2000) {
                    alerts.push({
                        id: `spending-${counter++}`,
                        type: 'info',
                        title: 'High Monthly Spending',
                        message: `You've spent $${summary.monthlySpending.toFixed(0)} this month.`,
                        read: false,
                    });
                }
            }

            // Savings milestone check
            try {
                const goals = await apiFetch('/goals');
                for (const goal of goals) {
                    if (goal.progress >= 100) {
                        alerts.push({
                            id: `goal-${counter++}`,
                            type: 'success',
                            title: `🎉 ${goal.name} Reached!`,
                            message: `You've saved $${goal.currentAmount.toLocaleString()} of $${goal.targetAmount.toLocaleString()}.`,
                            read: false,
                        });
                    } else if (goal.progress >= 75) {
                        alerts.push({
                            id: `goal-${counter++}`,
                            type: 'info',
                            title: `${goal.name} — ${goal.progress}% Complete`,
                            message: `Only $${(goal.targetAmount - goal.currentAmount).toLocaleString()} to go!`,
                            read: false,
                        });
                    }
                }
            } catch { /* goals may be empty */ }

        } catch { /* empty */ }

        setNotifications(alerts);
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    useEffect(() => { generateAlerts(); }, [generateAlerts]);

    return { notifications, unreadCount: notifications.filter(n => !n.read).length, markAllRead, refresh: generateAlerts };
}
