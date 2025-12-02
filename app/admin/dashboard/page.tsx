import { getSalesStats } from '@/actions/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

export default async function AdminDashboardPage() {
    const stats = await getSalesStats();

    const coreSales = stats.salesByType.find(s => s.type === 'core')?.count || 0;
    const upsellSales = stats.salesByType.find(s => s.type === 'upsell')?.count || 0;
    const downsellSales = stats.salesByType.find(s => s.type === 'downsell')?.count || 0;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-[var(--brand-navy)]">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(stats.totalRevenue / 100).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime earnings
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Core Sales</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{coreSales}</div>
                        <p className="text-xs text-muted-foreground">
                            Main course purchases
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upsell Conversion</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {coreSales > 0 ? ((upsellSales / coreSales) * 100).toFixed(1) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {upsellSales} upsells / {downsellSales} downsells
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
