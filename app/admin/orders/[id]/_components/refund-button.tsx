'use client';

import { refundOrder } from '@/actions/admin-orders';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export function RefundButton({ orderId }: { orderId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleRefund = async () => {
        if (!confirm('Are you sure you want to refund this order? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);
        try {
            await refundOrder(orderId);
            toast.success('Order refunded successfully');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to refund order');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="destructive"
            onClick={handleRefund}
            disabled={isLoading}
        >
            {isLoading ? 'Processing Refund...' : 'Refund Order'}
        </Button>
    );
}
