import { createCoreCheckoutSession, enrollForFree } from '@/actions/payment';
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
import { FlipClock } from '@/components/flip-clock';

// Helper to convert standard URLs to embed URLs
function getEmbedUrl(url: string): string {
    if (!url) return '';

    // YouTube (Standard, Short, Embed, etc.)
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
        const videoId = youtubeMatch[1];
        // YouTube requires 'playlist' param with the same video ID for looping to work on single videos
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    }

    // Vimeo (Standard, Channels, Groups, etc.)
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1`;
    }

    return url;
}

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
        <div className="min-h-screen w-full bg-[#f8fafc] font-sans text-[#2d3748] overflow-x-hidden">
            {/* 1. Headline Bar (Dark Theme) */}
            <div className="bg-[#111] text-white pt-12 pb-32 px-4 text-center relative overflow-hidden">
                {/* Background Pattern/Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-[#1a1a1a] to-[#111] opacity-80"></div>

                <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                    <div className="inline-block bg-[#dc2626] text-white font-extrabold px-6 py-2 uppercase tracking-widest text-sm rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] mb-4 transform -rotate-1">
                        Limited Time Special Offer
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight drop-shadow-2xl uppercase">
                        {course.title} <span className="text-[#dc2626]">Masterclass!</span>
                    </h1>
                    {course.subtitle && (
                        <p className="text-xl md:text-3xl text-slate-300 font-medium max-w-4xl mx-auto leading-relaxed">
                            {course.subtitle}
                        </p>
                    )}

                    {/* Video Embed */}
                    {course.videoEmbedUrl && (
                        <div className="mt-12 max-w-4xl mx-auto">
                            <div className="relative aspect-video rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10 bg-black">
                                <iframe
                                    src={getEmbedUrl(course.videoEmbedUrl)}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-20 pb-20 relative z-20 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* 2. Left Column: Content & VSL (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* What You Will Get */}
                        <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-100 space-y-6 relative overflow-hidden">
                            {/* Dotted border effect */}
                            <div className="absolute inset-0 border-2 border-dashed border-slate-200 rounded-xl pointer-events-none m-2"></div>

                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-[#111] border-b-4 border-[#dc2626] pb-4 inline-block mb-6 uppercase">
                                    Start Now!! <span className="font-medium text-slate-600 normal-case block text-xl mt-2">Here's Everything You Get...</span>
                                </h2>
                                <div className="prose prose-lg text-slate-600 leading-relaxed max-w-none">
                                    <p className="whitespace-pre-wrap">
                                        {course.description || 'No description available.'}
                                    </p>
                                </div>

                                {course.features && (course.features as { label: string; value: string }[]).length > 0 && (
                                    <div className="mt-8 space-y-4">
                                        {(course.features as { label: string; value: string }[]).map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 group">
                                                <div className="bg-red-100 rounded-full p-1 mt-0.5 flex-shrink-0 group-hover:bg-red-200 transition-colors">
                                                    <div className="bg-[#dc2626] rounded-full p-1">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-bold text-[#111] text-lg block">
                                                        {item.label}
                                                    </span>
                                                    {item.value && (
                                                        <span className="text-[#dc2626] font-bold text-sm">
                                                            ({item.value})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Right Column: The Order Box (lg:col-span-5) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-8">
                            {/* Order Box Header */}
                            <div className="bg-[#dc2626] rounded-t-xl p-6 text-center relative overflow-hidden shadow-lg">
                                <h3 className="text-2xl font-black text-white uppercase tracking-wide leading-tight">
                                    Get Access Now
                                </h3>
                                <p className="text-red-100 text-sm font-medium mt-1">Limited Time Special Pricing</p>
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
                                        <span className="text-xl font-bold text-[#111]">Your Price:</span>
                                        <span className="text-4xl font-black text-[#dc2626]">${(course.priceCents / 100).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Buttons or Countdown */}
                                <div className="space-y-4">
                                    {(() => {
                                        const now = new Date();
                                        const startDate = course.startDate ? new Date(course.startDate) : new Date();
                                        // Set start date time to 23:59:59
                                        startDate.setHours(23, 59, 59, 999);

                                        const endDate = course.endDate ? new Date(course.endDate) : new Date('2100-12-31');
                                        // Set end date time to 23:59:59
                                        endDate.setHours(23, 59, 59, 999);

                                        // 1. Pre-launch: Now < Start Date
                                        if (now < startDate) {
                                            return (
                                                <div className="w-full">
                                                    <FlipClock targetDate={startDate} label="Enrollment Opens In" />
                                                    <p className="text-center text-sm text-slate-500 mt-4">
                                                        Enrollment opens soon. Mark your calendar!
                                                    </p>
                                                </div>
                                            );
                                        }

                                        // 2. Open: Start Date <= Now < End Date
                                        if (now < endDate) {
                                            const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;
                                            const showCountdown = endDate.getTime() - now.getTime() <= tenDaysInMs;

                                            return (
                                                <div className="space-y-6">
                                                    {showCountdown && (
                                                        <div className="w-full">
                                                            <FlipClock targetDate={endDate} label="Enrollment Closes In" />
                                                        </div>
                                                    )}

                                                    {course.priceCents === 0 ? (
                                                        session?.user ? (
                                                            <form action={enrollForFree.bind(null, course.id)} className="w-full">
                                                                <Button size="lg" className="w-full bg-[#dc2626] hover:bg-red-700 text-white font-bold text-lg md:text-xl py-6 md:py-8 h-auto whitespace-normal shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl flex flex-col items-center justify-center gap-1 rounded-lg border-b-4 border-red-900">
                                                                    <div className="flex items-center gap-2 flex-wrap justify-center">
                                                                        <span>Enroll for Free</span>
                                                                        <ArrowRight className="h-6 w-6 shrink-0" />
                                                                    </div>
                                                                    <span className="text-xs font-normal opacity-90 uppercase tracking-wider">Instant Access</span>
                                                                </Button>
                                                            </form>
                                                        ) : (
                                                            <Button asChild size="lg" className="w-full bg-[#dc2626] hover:bg-red-700 text-white font-bold text-lg md:text-xl py-6 md:py-8 h-auto whitespace-normal shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl flex flex-col items-center justify-center gap-1 rounded-lg border-b-4 border-red-900">
                                                                <Link href={`/api/auth/signin?callbackUrl=/enroll/${course.id}`}>
                                                                    <div className="flex items-center gap-2 flex-wrap justify-center">
                                                                        <span>Sign in to Enroll</span>
                                                                        <ArrowRight className="h-6 w-6 shrink-0" />
                                                                    </div>
                                                                    <span className="text-xs font-normal opacity-90 uppercase tracking-wider">Create an account to start</span>
                                                                </Link>
                                                            </Button>
                                                        )
                                                    ) : (
                                                        <>
                                                            <form action={createCoreCheckoutSession.bind(null, course.id)} className="w-full">
                                                                <Button size="lg" className="w-full bg-[#dc2626] hover:bg-red-700 text-white font-bold text-lg md:text-xl py-6 md:py-8 h-auto whitespace-normal shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl flex flex-col items-center justify-center gap-1 rounded-lg border-b-4 border-red-900">
                                                                    <div className="flex items-center gap-2 flex-wrap justify-center">
                                                                        <span>Get Access Now</span>
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
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        }

                                        // 3. Closed: Now >= End Date
                                        return (
                                            <div className="w-full p-8 bg-slate-100 rounded-xl text-center border border-slate-200">
                                                <h3 className="text-xl font-bold text-slate-600 mb-2">Enrollment Closed</h3>
                                                <p className="text-slate-500">
                                                    This course is currently not accepting new students.
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Security Seals */}
                                <div className="flex flex-col items-center gap-3 pt-2">
                                    <div className="flex gap-4 text-slate-300">
                                        <Lock className="h-6 w-6" />
                                        <ShieldCheck className="h-6 w-6" />
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <p className="text-center text-xs text-slate-400 font-medium">
                                        Guaranteed Safe & Secure Checkout
                                        {course.guarantee && (
                                            <>
                                                <br />
                                                {course.guarantee}
                                            </>
                                        )}
                                    </p>
                                </div>
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
