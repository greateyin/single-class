import { handleOneClickUpsell } from '@/actions/payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function UpsellPage() {
    return (
        <div className="space-y-6 text-center">
            <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 p-4 rounded-lg">
                <p className="font-bold">WAIT! Your order is not complete yet.</p>
            </div>

            <h1 className="text-3xl font-bold">
                Want to add the "Advanced Patterns" Module?
            </h1>

            <p className="text-slate-400">
                Get 5 extra hours of content covering Advanced Patterns, Performance Tuning, and Multi-Tenancy.
            </p>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-2xl text-green-400">One-Time Offer: $47</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-400">
                        Usually sold for $97. This offer is only available on this page.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <form action={handleOneClickUpsell} className="w-full">
                        <Button size="lg" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold">
                            Yes, Add to My Order (One-Click)
                        </Button>
                    </form>
                    <Link href="/downsell" className="text-sm text-slate-500 hover:text-slate-400 underline">
                        No thanks, I don't need advanced patterns right now.
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
