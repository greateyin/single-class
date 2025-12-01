import { createCoreCheckoutSession } from '@/actions/payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function CoreOfferPage() {
    const session = await auth();

    if (session?.user?.id) {
        const hasAccess = await db.query.transactions.findFirst({
            where: and(
                eq(transactions.userId, session.user.id),
                eq(transactions.status, 'completed'),
                or(
                    eq(transactions.type, 'core'),
                    eq(transactions.type, 'upsell'), // Upsell includes core
                    eq(transactions.type, 'downsell') // Downsell includes core
                )
            ),
        });

        if (hasAccess) {
            redirect('/dashboard');
        }
    }

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    The Ultimate Guide to Single Class Architecture
                </h1>
                <p className="text-xl text-slate-400">
                    Build scalable, secure, and profitable course platforms with Next.js 16.
                </p>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="space-y-2">
                        {[
                            "Serverless Monolith Architecture",
                            "Secure Video Streaming with Vimeo",
                            "One-Click Upsells with Stripe",
                            "Role-Based Access Control",
                            "Drizzle ORM & Postgres Optimization"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-center">
                        <span className="text-3xl font-bold">$97</span>
                        <span className="text-slate-500 ml-2 line-through">$197</span>
                    </div>
                    <form action={createCoreCheckoutSession.bind(null, 1)} className="w-full">
                        <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg">
                            Get Instant Access
                        </Button>
                    </form>
                    <p className="text-xs text-center text-slate-500">
                        Secure Payment via Stripe • 30-Day Money Back Guarantee
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
