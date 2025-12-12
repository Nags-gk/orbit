
import { TransactionsTable } from '../components/transactions/TransactionsTable';

export default function Transactions() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                <p className="text-muted-foreground">
                    View and manage your transaction history.
                </p>
            </div>

            <TransactionsTable />
        </div>
    );
}
