import { auth } from "@/lib/auth";
import { db } from "@/db";
import { enrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { addMonths, isAfter } from "date-fns";
import Link from "next/link";

export default async function CourseLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ courseId: string }>;
}) {
    const { courseId } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return redirect("/api/auth/signin");
    }

    // Allow admins to bypass enrollment check
    if (session?.user?.role === 'admin') {
        return <>{children}</>;
    }

    // 1. Check Enrollment
    const enrollment = await db.query.enrollments.findFirst({
        where: and(
            eq(enrollments.userId, userId),
            eq(enrollments.courseId, courseId)
        ),
        with: {
            course: true
        }
    });

    if (!enrollment) {
        return redirect("/"); // Or enroll page
    }

    const course = enrollment.course;

    // 2. Handle First Access
    if (!enrollment.firstAccessedAt) {
        const now = new Date();
        let expiresAt = null;

        if (course.accessMonths) {
            expiresAt = addMonths(now, course.accessMonths);
        }

        await db.update(enrollments)
            .set({
                firstAccessedAt: now,
                expiresAt: expiresAt
            })
            .where(eq(enrollments.id, enrollment.id));

        // Update local object for immediate check
        enrollment.expiresAt = expiresAt;
    }

    // 3. Check Expiration
    if (enrollment.expiresAt && isAfter(new Date(), enrollment.expiresAt)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">
                    <h1 className="text-2xl font-bold text-red-600">Access Expired</h1>
                    <p className="text-slate-600">
                        Your access to <strong>{course.title}</strong> has expired.
                    </p>
                    <p className="text-sm text-slate-500">
                        Expired on: {enrollment.expiresAt.toLocaleDateString()}
                    </p>
                    <Link href="/" className="inline-block bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
