import { enforcePaidAccess } from '@/lib/auth-guards';
import { db } from '@/db';
import { courses, lessons, lessonCompletion, modules } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;

    let course;
    if (courseId === 'core') {
        course = await db.query.courses.findFirst();
        if (course) {
            redirect(`/courses/${course.id}`);
        }
    } else {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);
        if (isUuid) {
            course = await db.query.courses.findFirst({
                where: eq(courses.id, courseId),
            });
        }
    }

    if (!course) notFound();

    const session = await enforcePaidAccess(course.id);
    const userId = session.user.id;

    const courseLessons = await db.query.lessons.findMany({
        where: eq(lessons.courseId, course.id),
        orderBy: [asc(lessons.orderIndex)],
        with: {
            lessonCompletion: {
                where: eq(lessonCompletion.userId, userId),
            },
        },
    });

    const courseModules = await db.query.modules.findMany({
        where: eq(modules.courseId, course.id),
        orderBy: [asc(modules.orderIndex)],
    });

    const completedCount = courseLessons.filter(l => l.lessonCompletion.length > 0).length;
    const progress = courseLessons.length > 0 ? (completedCount / courseLessons.length) * 100 : 0;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--brand-navy)]">{course.title}</h1>
                <p className="text-lg text-slate-600 leading-relaxed">{course.description}</p>

                <div className="flex items-center gap-4 pt-4">
                    <Progress value={progress} className="h-3 w-64 bg-slate-100 [&>div]:bg-[var(--brand-gold)]" />
                    <span className="text-sm font-medium text-slate-500">{Math.round(progress)}% Complete</span>
                </div>
            </div>

            <div className="space-y-8">
                {/* Modules */}
                {courseModules.map((module) => {
                    const moduleLessons = courseLessons.filter(l => l.moduleId === module.id);
                    if (moduleLessons.length === 0) return null;

                    return (
                        <div key={module.id} className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--brand-navy)] pl-2 border-l-4 border-[var(--brand-gold)] mb-4">
                                {module.title}
                            </h2>
                            <div className="grid gap-4 pl-6">
                                {moduleLessons.map((lesson) => (
                                    <LessonCard key={lesson.id} lesson={lesson} courseId={course.id} />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Orphaned Lessons (No Module) */}
                {courseLessons.filter(l => !l.moduleId).length > 0 && (
                    <div className="space-y-4">
                        {courseModules.length > 0 && (
                            <h2 className="text-xl font-bold text-[var(--brand-navy)] pl-2 border-l-4 border-slate-300">
                                General
                            </h2>
                        )}
                        <div className="grid gap-4">
                            {courseLessons.filter(l => !l.moduleId).map((lesson) => (
                                <LessonCard key={lesson.id} lesson={lesson} courseId={course.id} />
                            ))}
                        </div>
                    </div>
                )}

                {courseLessons.length === 0 && (
                    <p className="text-slate-500 italic">No lessons available yet.</p>
                )}
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LessonCard({ lesson, courseId }: { lesson: any, courseId: string }) {
    const isCompleted = lesson.lessonCompletion.length > 0;
    return (
        <Link href={`/lessons/${lesson.id}?courseId=${courseId}`}>
            <Card className={`hover:shadow-md transition-all duration-200 border-l-4 ${isCompleted ? 'border-l-green-500 bg-green-50/30' : 'border-l-[var(--brand-navy)] hover:border-l-[var(--brand-gold)]'}`}>
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-shrink-0">
                        {isCompleted ? (
                            <div className="bg-green-100 p-1.5 rounded-full">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                        ) : (
                            <div className="bg-blue-50 p-1.5 rounded-full">
                                <PlayCircle className="h-5 w-5 text-[var(--brand-navy)]" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${isCompleted ? 'text-slate-700' : 'text-[var(--brand-navy)]'}`}>
                            {lesson.title}
                        </h3>
                        {lesson.description && (
                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{lesson.description}</p>
                        )}
                    </div>
                    <div className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-500">
                        Lesson {lesson.orderIndex}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

