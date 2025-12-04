import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CheckCircle, PlayCircle, Circle } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    orderIndex: number;
    moduleId: string | null;
    isCompleted: boolean;
}

interface Module {
    id: string;
    title: string;
    orderIndex: number;
}

interface CourseSidebarProps {
    course: {
        id: string;
        title: string;
    };
    lessons: Lesson[];
    modules: Module[];
    currentLessonId: string;
}

export function CourseSidebar({ course, lessons, modules, currentLessonId }: CourseSidebarProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden sticky top-24">
            <div className="bg-slate-700 text-white p-4 text-center font-medium">
                Course Progress
            </div>
            <div className="p-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-slate-200" />

                <div className="space-y-6 relative">
                    {modules.map((module) => {
                        const moduleLessons = lessons.filter((l) => l.moduleId === module.id);
                        if (moduleLessons.length === 0) return null;

                        return (
                            <div key={module.id} className="space-y-2">
                                <h3 className="text-sm font-bold text-slate-900 pl-10 uppercase tracking-wider">
                                    {module.title}
                                </h3>
                                <div className="space-y-4">
                                    {moduleLessons.map((lesson) => (
                                        <SidebarLessonItem
                                            key={lesson.id}
                                            lesson={lesson}
                                            courseId={course.id}
                                            isActive={lesson.id === currentLessonId}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Orphaned Lessons */}
                    {lessons.filter((l) => !l.moduleId).length > 0 && (
                        <div className="space-y-2">
                            {modules.length > 0 && (
                                <h3 className="text-sm font-bold text-slate-900 pl-10 uppercase tracking-wider">
                                    General
                                </h3>
                            )}
                            <div className="space-y-4">
                                {lessons
                                    .filter((l) => !l.moduleId)
                                    .map((lesson) => (
                                        <SidebarLessonItem
                                            key={lesson.id}
                                            lesson={lesson}
                                            courseId={course.id}
                                            isActive={lesson.id === currentLessonId}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SidebarLessonItem({ lesson, courseId, isActive }: { lesson: Lesson; courseId: string; isActive: boolean }) {
    const isCompleted = lesson.isCompleted;

    return (
        <Link
            href={`/lessons/${lesson.id}?courseId=${courseId}`}
            className={cn(
                "flex items-start gap-4 group transition-colors relative",
                isActive ? "text-[var(--brand-navy)]" : "text-slate-600 hover:text-slate-900"
            )}
        >
            <div className="relative z-10 bg-white py-1">
                {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-500 fill-green-50" />
                ) : isActive ? (
                    <PlayCircle className="h-6 w-6 text-[var(--brand-gold)] fill-yellow-50" />
                ) : (
                    <Circle className="h-6 w-6 text-slate-300 fill-slate-50" />
                )}
            </div>
            <div className="pt-1">
                <div className="text-sm font-medium text-slate-500 mb-0.5">
                    Lesson {lesson.orderIndex}
                </div>
                <div className={cn(
                    "font-medium leading-tight",
                    isActive && "text-[var(--brand-navy)] font-bold"
                )}>
                    {lesson.title}
                </div>
            </div>
        </Link>
    );
}
