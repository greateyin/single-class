import { handleDownsellPurchase } from '@/actions/payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function DownsellPage() {
    return (
        <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold text-slate-200">
                Is price the issue?
            </h1>

            <p className="text-slate-400">
                We understand. How about a "Lite" version of the Advanced Module?
            </p>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-2xl text-blue-400">Lite Pack: $27</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-400">
                        Get the Performance Tuning chapter only.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <form action={handleDownsellPurchase} className="w-full">
                        <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            Yes, Add Lite Pack (One-Click)
                        </Button>
                    </form>
                    <Link href="/confirmation" className="text-sm text-slate-500 hover:text-slate-400 underline">
                        No thanks, I'll stick with the core course.
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
