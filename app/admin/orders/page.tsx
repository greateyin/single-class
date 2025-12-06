import { getOrders } from '@/actions/admin-orders';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatPrice } from '@/lib/format';
import { formatDateTime, formatDate } from '@/lib/utils';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ManualOrderDialog } from './_components/manual-order-dialog';

export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page } = await searchParams;
    const currentPage = Number(page) || 1;
    const { data: orders, metadata } = await getOrders(currentPage);

    if (metadata.totalPages > 0 && currentPage > metadata.totalPages) {
        redirect(`/admin/orders?page=${metadata.totalPages}`);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Order Management</h2>
                    <p className="text-muted-foreground">
                        View and manage customer orders and transactions.
                    </p>
                </div>
                <ManualOrderDialog />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        {formatDateTime(order.saleDate)}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/users/${order.userId}`} className="hover:underline">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{order.user.name || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">{order.user.email}</span>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>{order.course?.title || 'Unknown Course'}</TableCell>
                                    <TableCell>{formatPrice(order.amountCents)}</TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${order.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : order.status === 'refunded'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {(() => {
                                            /* eslint-disable @typescript-eslint/no-explicit-any */
                                            const enrollment = (order.user as any).enrollments?.find((e: any) => e.courseId === order.courseId);
                                            if (!enrollment?.expiresAt) return '-';
                                            return formatDate(enrollment.expiresAt);
                                        })()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View</span>
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    asChild
                >
                    <Link href={`/admin/orders?page=${currentPage - 1}`}>Previous</Link>
                </Button>
                <div className="text-sm font-medium">
                    Page {metadata.page} of {metadata.totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= metadata.totalPages}
                    asChild
                >
                    <Link href={`/admin/orders?page=${currentPage + 1}`}>Next</Link>
                </Button>
            </div>
        </div>
    );
}
