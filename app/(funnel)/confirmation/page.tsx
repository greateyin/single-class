import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmationPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <Card className="w-full max-w-md bg-white border-slate-200 shadow-lg">
                <CardHeader className="text-center space-y-2 pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Purchase Successful!</CardTitle>
                    <p className="text-slate-500">
                        Thank you for your purchase. You're all covered.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600 space-y-2">
                        <p>
                            We've sent a receipt and login details to your email.
                        </p>
                        <p>
                            You now have full access to the course materials.
                        </p>
                    </div>

                    <Button asChild size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all">
                        <Link href="/dashboard">
                            Go to Dashboard
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
