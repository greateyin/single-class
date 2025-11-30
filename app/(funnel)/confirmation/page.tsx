import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmationPage() {
    return (
        <div className="space-y-8 text-center">
            <div className="flex justify-center">
                <CheckCircle className="h-20 w-20 text-green-500" />
            </div>

            <h1 className="text-4xl font-bold">You're In!</h1>
            <p className="text-xl text-slate-400">
                Thank you for your purchase. Your account has been upgraded.
            </p>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-slate-400">
                        Check your email for the receipt and login details.
                        You can access the course content immediately.
                    </p>
                    <Button asChild size="lg" className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200">
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
