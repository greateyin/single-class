import { createCoreCheckoutSession } from '@/actions/payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { transactions, courses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import { PayPalButton } from '@/components/paypal-button';

export default async function EnrollPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId: courseIdStr } = await params;
    const courseId = parseInt(courseIdStr);

    if (isNaN(courseId)) {
        notFound();
    }

    // Fetch Course
    const course = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
    });

    if (!course) {
        notFound();
    }

    const session = await auth();

    if (session?.user?.id) {
        const hasAccess = await db.query.transactions.findFirst({
            where: and(
                eq(transactions.userId, session.user.id),
                eq(transactions.status, 'completed'),
                eq(transactions.courseId, courseId)
            ),
        });

        if (hasAccess) {
            redirect(`/courses/${courseId}`);
        }
    }

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    {course.title}
                </h1>
                <p className="text-xl text-slate-400">
                    {course.description || 'Unlock your potential with this course.'}
                </p>
            </div>

            <Card className="bg-slate-900 border-slate-800 max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Enroll Now</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-center">
                        {course.imageUrl && (
                            <img src={course.imageUrl} alt={course.title} className="rounded-lg max-h-64 object-cover" />
                        )}
                    </div>
                    <ul className="space-y-2">
                        {[
                            "Full Lifetime Access",
                            "Access on Mobile and TV",
                            "Certificate of Completion",
                            "30-Day Money-Back Guarantee"
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
                        <span className="text-3xl font-bold">${(course.priceCents / 100).toFixed(2)}</span>
                    </div>
                    <form action={createCoreCheckoutSession.bind(null, courseId)} className="w-full">
                        <Button size="lg" className="w-full bg-[#635BFF] hover:bg-[#5851E1] text-white font-bold text-lg mb-4 flex items-center justify-center gap-2 h-[55px]">
                            Credit Card
                        </Button>
                    </form>

                    <div className="w-full">
                        <PayPalButton
                            courseId={courseId}
                            clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!}
                        />
                    </div>

                    <p className="text-xs text-center text-slate-500">
                        Secure Payment via Stripe or PayPal • 30-Day Money Back Guarantee
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
