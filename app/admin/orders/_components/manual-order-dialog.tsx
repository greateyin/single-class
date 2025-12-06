'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { manualFulfillOrder } from '@/actions/admin';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ManualOrderDialog() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [courseId, setCourseId] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await manualFulfillOrder(email, courseId);
            if (result.success) {
                toast.success('Order fulfilled successfully');
                setOpen(false);
                setEmail('');
                setCourseId('');
                router.refresh();
            } else {
                toast.error(`Failed: ${result.error}`);
            }
        } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Manual Order
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manual Order Fulfillment</DialogTitle>
                    <DialogDescription>
                        Manually create a completed transaction and enrollment for a user.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="courseId" className="text-right">
                                Course ID
                            </Label>
                            <Input
                                id="courseId"
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Fulfill Order'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
