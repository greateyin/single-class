'use client';

import { fixEnrollment } from '@/actions/admin-orders';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function FixEnrollmentButton({ orderId }: { orderId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleFixEnrollment = async () => {
        setIsLoading(true);
        try {
            const result = await fixEnrollment(orderId);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fix enrollment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleFixEnrollment} disabled={isLoading} className="text-amber-600 border-amber-200 hover:bg-amber-50">
            <Wrench className="h-4 w-4 mr-2" />
            {isLoading ? 'Fixing...' : 'Fix Enrollment'}
        </Button>
    );
}
