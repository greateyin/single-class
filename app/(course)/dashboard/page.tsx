import { enforceAuthentication } from '@/lib/auth-guards';
import { db } from '@/db';
import { courses, transactions } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default async function DashboardPage() {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    // 1. Get User's Transactions to find purchased courses
    const userTransactions = await db.query.transactions.findMany({
        where: and(
            eq(transactions.userId, userId),
            eq(transactions.status, 'completed')
        ),
    });

    const purchasedCourseIds = userTransactions
        .map(tx => tx.courseId)
        .filter((id): id is string => id !== null);

    // 2. Get Purchased Courses
    let myCourses: typeof courses.$inferSelect[] = [];

    if (purchasedCourseIds.length > 0) {
        myCourses = await db.query.courses.findMany({
            where: inArray(courses.id, purchasedCourseIds),
        });
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Learning</h1>
                    <p className="text-slate-500 mt-2">Welcome back, {session.user.name}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myCourses.map((course) => (
                    <Card key={course.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto pt-0">
                            <Link href={`/courses/${course.id}`} className="w-full">
                                <Button className="w-full">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Continue Learning
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {myCourses.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No courses available at the moment.
                </div>
            )}
        </div>
    );
}
