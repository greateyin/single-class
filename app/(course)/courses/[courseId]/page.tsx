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


    // Calculate Next Lesson (First incomplete lesson)
    const nextLesson = courseLessons.find(l => l.lessonCompletion.length === 0) || courseLessons[0];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* 1. Dark Header (Full Width) */}
            <CourseHeader
                course={{
                    ...course,
                    updatedAt: course.createdAt // Fallback since updatedAt might not exist on schema yet or just use createdAt
                }}
                progress={progress}
            />

            <div className="max-w-7xl mx-auto px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* 2. Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* What you'll learn */}
                        <div className="bg-white p-6 border border-slate-200 rounded-sm">
                            <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-6">What you{`'`}ll learn</h2>
                            {course.features && (course.features as { label: string; value: string }[]).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(course.features as { label: string; value: string }[]).map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-slate-800 shrink-0" />
                                            <span className="text-sm text-slate-600">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">Objectives not listed.</p>
                            )}
                        </div>

                        {/* Course Content */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--brand-navy)]">Course content</h2>
                            <div className="text-sm text-slate-500 mb-4">
                                {courseModules.length} sections • {courseLessons.length} lectures
                            </div>

                            <div className="border border-slate-200 rounded-sm divide-y divide-slate-200 bg-white">
                                {/* Modules */}
                                {courseModules.map((module) => {
                                    const moduleLessons = courseLessons.filter(l => l.moduleId === module.id);
                                    if (moduleLessons.length === 0) return null;

                                    return (
                                        <div key={module.id} className="group">
                                            <div className="bg-slate-50/50 p-4 font-bold text-[var(--brand-navy)] flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors">
                                                <span>{module.title}</span>
                                                <span className="text-xs font-normal text-slate-500">{moduleLessons.length} lectures</span>
                                            </div>
                                            <div className="divide-y divide-slate-100">
                                                {moduleLessons.map((lesson) => (
                                                    <LessonItem key={lesson.id} lesson={lesson} courseId={course.id} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Orphaned Lessons */}
                                {courseLessons.filter(l => !l.moduleId).length > 0 && (
                                    <div className="group">
                                        {courseModules.length > 0 && (
                                            <div className="bg-slate-50/50 p-4 font-bold text-[var(--brand-navy)]">
                                                General
                                            </div>
                                        )}
                                        <div className="divide-y divide-slate-100">
                                            {courseLessons.filter(l => !l.moduleId).map((lesson) => (
                                                <LessonItem key={lesson.id} lesson={lesson} courseId={course.id} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--brand-navy)]">Description</h2>
                            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {course.description}
                            </div>
                        </div>
                    </div>

                    {/* 3. Sidebar (Right Column) */}
                    <div className="lg:col-span-1">
                        <CourseSidebar
                            course={course}
                            progress={progress}
                            nextLessonId={nextLesson?.id}
                            lessonCount={courseLessons.length}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}

import { Check } from 'lucide-react';
import { CourseHeader } from '@/components/course/course-header';
import { CourseSidebar } from '@/components/course/course-sidebar';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LessonItem({ lesson, courseId }: { lesson: any, courseId: string }) {
    const isCompleted = lesson.lessonCompletion.length > 0;
    return (
        <Link href={`/lessons/${lesson.id}?courseId=${courseId}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors bg-white">
            <div className="flex items-center gap-3">
                {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-[var(--brand-navy)]" />
                ) : (
                    <PlayCircle className="h-4 w-4 text-slate-400" />
                )}
                <span className={`text-sm ${isCompleted ? 'text-[var(--brand-navy)]' : 'text-slate-600'}`}>
                    {lesson.title}
                </span>
            </div>
            {/* <span className="text-xs text-slate-400">10:00</span> */}
        </Link>
    );
}

