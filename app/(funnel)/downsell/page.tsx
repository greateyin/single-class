import { handleOneClickCharge } from '@/actions/payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function DownsellPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full shadow-xl border-orange-100">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-medium w-fit">
                        Last Chance Offer
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-900">
                        How About Just the Lite Pack?
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Get the essential design patterns without the mentorship calls.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                            <span className="text-slate-700">Advanced System Design Patterns PDF</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                            <span className="text-slate-700">Community Access (Read-Only)</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <span className="text-4xl font-bold text-slate-900">$27</span>
                        <span className="text-slate-500 ml-2 line-through">$47</span>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <form action={handleOneClickCharge.bind(null, 'downsell')} className="w-full">
                        <Button size="lg" className="w-full text-lg py-6 bg-orange-600 hover:bg-orange-700">
                            Yes, Add Lite Pack (One-Click)
                        </Button>
                    </form>
                    <Link href="/confirmation" className="w-full">
                        <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-700">
                            No thanks, I'll stick with the core course
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
