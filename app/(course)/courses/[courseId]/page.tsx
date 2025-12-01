import { enforcePaidAccess } from '@/lib/auth-guards';
import { db } from '@/db';
import { courses, lessons, lessonCompletion } from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, PlayCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId: idString } = await params;
    const courseId = parseInt(idString);

    if (isNaN(courseId)) notFound();

    const session = await enforcePaidAccess(courseId);
    const userId = session.user.id;

    const course = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
    });

    if (!course) notFound();

    const courseLessons = await db.query.lessons.findMany({
        where: eq(lessons.courseId, courseId),
        orderBy: [asc(lessons.orderIndex)],
        with: {
            lessonCompletion: {
                where: eq(lessonCompletion.userId, userId),
            },
        },
    });

    const completedCount = courseLessons.filter(l => l.lessonCompletion.length > 0).length;
    const progress = courseLessons.length > 0 ? (completedCount / courseLessons.length) * 100 : 0;

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{course.title}</h1>
                <p className="text-lg text-slate-600">{course.description}</p>

                <div className="flex items-center gap-4">
                    <Progress value={progress} className="h-2 w-64" />
                    <span className="text-sm text-slate-500">{Math.round(progress)}% Complete</span>
                </div>
            </div>

            <div className="grid gap-4">
                {courseLessons.map((lesson) => {
                    const isCompleted = lesson.lessonCompletion.length > 0;
                    return (
                        <Link key={lesson.id} href={`/lessons/${lesson.id}?courseId=${courseId}`}>
                            <Card className={`hover:bg-slate-50 transition-colors ${isCompleted ? 'border-green-200 bg-green-50/30' : ''}`}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        {isCompleted ? (
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                        ) : (
                                            <PlayCircle className="h-6 w-6 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-medium ${isCompleted ? 'text-slate-700' : 'text-slate-900'}`}>
                                            {lesson.title}
                                        </h3>
                                        {lesson.description && (
                                            <p className="text-sm text-slate-500 line-clamp-1">{lesson.description}</p>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        Lesson {lesson.orderIndex}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
                {courseLessons.length === 0 && (
                    <p className="text-slate-500 italic">No lessons available yet.</p>
                )}
            </div>
        </div>
    );
}
