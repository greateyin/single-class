import { getOrder, refundOrder } from '@/actions/admin-orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/format';
import { formatDateTime, formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RefundButton } from './_components/refund-button';
import { SendInvoiceButton } from './_components/send-invoice-button';

export default async function OrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to orders
                    </Button>
                </Link>
                <h2 className="text-2xl font-bold tracking-tight">Order Details</h2>
                <div className="ml-auto">
                    <SendInvoiceButton orderId={order.id} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction Info</CardTitle>
                        <CardDescription>Details about the payment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm font-medium text-muted-foreground">Order ID</span>
                            <span className="text-sm font-mono">{order.id}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm font-medium text-muted-foreground">Date</span>
                            <span className="text-sm">{formatDateTime(order.saleDate)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm font-medium text-muted-foreground">Amount</span>
                            <span className="text-sm font-bold">{formatPrice(order.amountCents)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm font-medium text-muted-foreground">Access Expires</span>
                            <span className="text-sm font-mono">
                                {(() => {
                                    /* eslint-disable @typescript-eslint/no-explicit-any */
                                    const enrollment = (order.user as any).enrollments?.find((e: any) => e.courseId === order.courseId);
                                    if (!enrollment?.expiresAt) return '-';
                                    return formatDate(enrollment.expiresAt);
                                })()}
                            </span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm font-medium text-muted-foreground">Status</span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'refunded'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {order.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm font-medium text-muted-foreground">Payment Intent</span>
                            <span className="text-sm font-mono truncate max-w-[200px]" title={order.paymentIntentId || ''}>
                                {order.paymentIntentId || 'N/A'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer & Product</CardTitle>
                        <CardDescription>Who bought what</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground">Customer</h4>
                            <div className="flex flex-col">
                                <span className="text-base font-medium">{order.user.name}</span>
                                <span className="text-sm text-muted-foreground">{order.user.email}</span>
                                <span className="text-xs text-muted-foreground font-mono mt-1">ID: {order.userId}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground">Course</h4>
                            <div className="flex flex-col">
                                <span className="text-base font-medium">{order.course?.title}</span>
                                {order.course?.subtitle && (
                                    <span className="text-sm text-muted-foreground line-clamp-2">{order.course.subtitle}</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {order.status === 'completed' && order.paymentIntentId && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-900">Danger Zone</CardTitle>
                        <CardDescription className="text-red-700">
                            Refunds are irreversible. The money will be returned to the customer&apos;s original payment method.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RefundButton orderId={order.id} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
