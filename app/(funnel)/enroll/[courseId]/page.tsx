import { createCoreCheckoutSession } from '@/actions/payment';
import { Button } from '@/components/ui/button';
import { Check, Lock, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { transactions, courses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { PayPalButton } from '@/components/paypal-button';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ courseId: string }>
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const { courseId } = await params;

    let course;
    if (courseId === 'core') {
        course = await db.query.courses.findFirst();
    } else {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);
        if (isUuid) {
            course = await db.query.courses.findFirst({
                where: eq(courses.id, courseId),
            });
        }
    }

    if (!course) return {
        title: 'Course Not Found',
    };

    return {
        title: course.title,
        description: course.subtitle || course.description,
        openGraph: {
            title: course.title,
            description: course.subtitle || course.description || undefined,
            images: course.imageUrl ? [course.imageUrl] : [],
        },
    };
}

import Link from 'next/link';

// ... imports

export default async function EnrollPage({ params }: Props) {
    const { courseId } = await params;

    let course;
    if (courseId === 'core') {
        course = await db.query.courses.findFirst();
    } else {
        // Simple UUID validation to prevent DB errors
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);
        if (isUuid) {
            course = await db.query.courses.findFirst({
                where: eq(courses.id, courseId),
            });
        }
    }

    if (!course) {
        return (
            <div className="min-h-screen w-full bg-[var(--brand-bg)] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="h-8 w-8 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Course Not Found</h1>
                        <p className="text-slate-500">
                            The course you are looking for does not exist or is currently unavailable.
                        </p>
                    </div>
                    <Button asChild className="w-full bg-[var(--brand-navy)] hover:bg-blue-900">
                        <Link href="/">
                            Return to Home
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const session = await auth();
    let hasAccess = false;

    if (session?.user?.id) {
        const tx = await db.query.transactions.findFirst({
            where: and(
                eq(transactions.userId, session.user.id),
                eq(transactions.status, 'completed'),
                eq(transactions.courseId, course.id)
            ),
        });
        hasAccess = !!tx;

        if (hasAccess) {
            redirect(`/courses/${course.id}`);
        }
    }

    return (
        <div className="min-h-screen w-full bg-[var(--brand-bg)] font-sans text-[#2d3748] overflow-x-hidden">
            {/* 1. Headline Bar (Expert Secrets Blue) */}
            <div className="bg-[var(--brand-navy)] text-white pt-12 pb-24 px-4 text-center relative overflow-hidden">
                <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                    <div className="inline-block bg-[#fbbf24] text-[#8d4b0e] font-extrabold px-6 py-2 uppercase tracking-widest text-sm rounded shadow-md mb-2 transform -rotate-1">
                        Limited Time Special Offer
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-sm">
                        {course.title}
                    </h1>
                    {course.subtitle && (
                        <p className="text-lg md:text-2xl text-blue-100 font-medium max-w-4xl mx-auto leading-relaxed">
                            {course.subtitle}
                        </p>
                    )}
                </div>
                {/* Decorative curve at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#f4f7fa] rounded-t-[50%] transform scale-x-150 translate-y-8"></div>
            </div>

            <div className="container mx-auto px-4 -mt-16 pb-20 relative z-20 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* 2. Left Column: Content & VSL (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* VSL / Image Placeholder */}
                        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-white">
                            {course.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={course.imageUrl} alt={course.title} className="w-full h-auto object-cover" />
                            ) : (
                                <div className="aspect-video flex items-center justify-center bg-slate-100 text-slate-400">
                                    <span className="text-xl font-bold text-slate-500">Course Preview Video</span>
                                </div>
                            )}
                        </div>

                        {/* What You Will Get */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
                            <h2 className="text-3xl font-bold text-[var(--brand-navy)] border-b-2 border-slate-100 pb-4">
                                Here&apos;s What You&apos;re Going To Get...
                            </h2>
                            <div className="prose prose-lg text-slate-600 leading-relaxed max-w-none">
                                <p className="whitespace-pre-wrap">
                                    {course.description || 'No description available.'}
                                </p>
                            </div>

                            {course.features && (course.features as { label: string; value: string }[]).length > 0 && (
                                <div className="bg-[#eff6ff] p-6 rounded-lg border border-blue-100">
                                    <h3 className="text-xl font-bold text-[var(--brand-navy)] mb-4 flex items-center gap-2">
                                        <ShieldCheck className="h-6 w-6" />
                                        Everything Included:
                                    </h3>
                                    <ul className="space-y-4">
                                        {(course.features as { label: string; value: string }[]).map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="bg-green-500 rounded-full p-1 mt-0.5 flex-shrink-0">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                                <span className="font-semibold text-slate-700 text-lg">
                                                    {item.label} {item.value && <span className="text-slate-500 text-base font-normal">({item.value})</span>}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Right Column: The Order Box (lg:col-span-5) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-8">
                            {/* Order Box Header */}
                            <div className="bg-[#fffbeb] border-2 border-dashed border-[var(--brand-gold)] rounded-t-xl p-6 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-gold)]"></div>
                                <h3 className="text-2xl font-black text-[#b45309] uppercase tracking-wide leading-tight">
                                    Yes! I Want Instant Access!
                                </h3>
                                <p className="text-[#92400e] text-sm mt-2 font-bold">
                                    One-Time Payment • Lifetime Access
                                </p>
                            </div>

                            {/* Order Box Body */}
                            <div className="bg-white border-x-2 border-b-2 border-slate-200 rounded-b-xl p-6 shadow-2xl space-y-6">

                                {/* The Stack (Summary) */}
                                <div className="space-y-4 border-b border-slate-100 pb-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Regular Price:</span>
                                        <span className="font-bold text-slate-400 line-through decoration-red-500 decoration-2">$297.00</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-[#2d3748]">Your Price:</span>
                                        <span className="text-4xl font-extrabold text-[var(--brand-navy)]">${(course.priceCents / 100).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Buttons */}
                                <div className="space-y-4">
                                    <form action={createCoreCheckoutSession.bind(null, course.id)} className="w-full">
                                        <Button size="lg" className="w-full bg-[var(--brand-red)] hover:opacity-90 text-white font-bold text-lg md:text-xl py-6 md:py-8 h-auto whitespace-normal shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl flex flex-col items-center justify-center gap-1 rounded-lg border-b-4 border-[#9b2c2c]">
                                            <div className="flex items-center gap-2 flex-wrap justify-center">
                                                <span>YES! Upgrade My Skills Now</span>
                                                <ArrowRight className="h-6 w-6 shrink-0" />
                                            </div>
                                            <span className="text-xs font-normal opacity-90 uppercase tracking-wider">Secure 256-bit SSL Encryption</span>
                                        </Button>
                                    </form>

                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-slate-200" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-slate-400 font-semibold">Or pay with PayPal</span>
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <PayPalButton
                                            courseId={course.id}
                                            clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!}
                                        />
                                    </div>
                                </div>

                                {/* Security Seals */}
                                <div className="flex flex-col items-center gap-3 pt-2">
                                    <div className="flex gap-4 text-slate-300">
                                        <Lock className="h-6 w-6" />
                                        <ShieldCheck className="h-6 w-6" />
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <p className="text-center text-xs text-slate-400 font-medium">
                                        Guaranteed Safe & Secure Checkout<br />
                                        30-Day Money-Back Guarantee
                                    </p>
                                </div>
                            </div>

                            {/* Guarantee Badge */}
                            <div className="mt-8 text-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/30-day-money-back-guarantee-badge.png/640px-30-day-money-back-guarantee-badge.png"
                                    alt="Money Back Guarantee"
                                    className="h-28 mx-auto drop-shadow-md hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white py-12 border-t border-slate-200">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-slate-500 text-sm mb-4">&copy; {new Date().getFullYear()} Single Class. All rights reserved.</p>
                    <div className="flex justify-center gap-6 text-sm text-[var(--brand-navy)] font-medium">
                        <a href="#" className="hover:underline">Terms of Service</a>
                        <a href="#" className="hover:underline">Privacy Policy</a>
                        <a href="#" className="hover:underline">Support</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
