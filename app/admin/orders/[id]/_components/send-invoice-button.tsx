'use client';

import { sendInvoiceEmail } from '@/actions/admin-orders';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function SendInvoiceButton({ orderId }: { orderId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSendInvoice = async () => {
        setIsLoading(true);
        try {
            await sendInvoiceEmail(orderId);
            toast.success('Invoice sent successfully');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to send invoice');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleSendInvoice} disabled={isLoading}>
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Invoice'}
        </Button>
    );
}
