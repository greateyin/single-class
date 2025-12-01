import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AccessDeniedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 space-y-4">
            <h1 className="text-4xl font-bold text-red-600">403 - Access Denied</h1>
            <p className="text-slate-600">You do not have permission to view this page.</p>
            <Link href="/dashboard">
                <Button>Return to Dashboard</Button>
            </Link>
        </div>
    );
}
