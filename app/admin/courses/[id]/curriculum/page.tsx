import { createLesson, deleteLesson, reorderLessons } from '@/actions/admin-content';
import { createModule, deleteModule, updateModule, reorderModules } from '@/actions/admin-modules';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db } from '@/db';
import { courses, lessons, modules } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { Plus, Edit, Trash2, GripVertical, Save, X } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function CurriculumPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: courseId } = await params;

    const course = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
        with: {
            modules: {
                orderBy: [asc(modules.orderIndex)],
                with: {
                    lessons: {
                        orderBy: [asc(lessons.orderIndex)],
                    },
                },
            },
            lessons: {
                // Fetch lessons without modules (orphaned)
                where: (lessons, { isNull }) => isNull(lessons.moduleId),
                orderBy: [asc(lessons.orderIndex)],
            }
        },
    });

    if (!course) {
        redirect('/admin/courses');
    }

    async function handleCreateModule(formData: FormData) {
        'use server';
        const title = formData.get('title') as string;
        if (!title) return;
        await createModule(courseId, title);
    }

    async function handleDeleteModule(moduleId: string) {
        'use server';
        await deleteModule(moduleId);
    }

    async function handleCreateLesson(moduleId: string, formData: FormData) {
        'use server';
        const title = formData.get('title') as string;
        if (!title) return;

        // Calculate order index by fetching from DB instead of using closure
        const moduleLessons = await db.query.lessons.findMany({
            where: eq(lessons.moduleId, moduleId),
        });
        const maxOrder = moduleLessons.reduce((max, l) => Math.max(max, l.orderIndex), -1);

        await createLesson({
            title,
            orderIndex: maxOrder + 1,
            videoEmbedUrl: '', // Default empty
            courseId: courseId,
            moduleId: moduleId,
        });

        revalidatePath(`/admin/courses/${courseId}/curriculum`);
    }

    async function handleDeleteLesson(lessonId: string) {
        'use server';
        await deleteLesson(lessonId);
        revalidatePath(`/admin/courses/${courseId}/curriculum`);
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Curriculum</h2>
                <p className="text-muted-foreground">
                    Start putting together your course by creating sections, lectures and practice activities.
                </p>
            </div>

            {/* Add Module Form */}
            <Card className="bg-slate-50 border-dashed">
                <CardContent className="pt-6">
                    <form action={handleCreateModule} className="flex gap-4">
                        <Input name="title" placeholder="New Section Title (e.g. Introduction)" required className="flex-1 bg-white" />
                        <Button type="submit" variant="secondary">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Section
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Modules List */}
            <div className="space-y-6">
                {course.modules.map((module) => (
                    <Card key={module.id} className="overflow-hidden">
                        <CardHeader className="bg-slate-100 py-3 flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2 font-semibold">
                                <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
                                <span>Section {module.orderIndex + 1}: {module.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <form action={handleDeleteModule.bind(null, module.id)}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Lessons in Module */}
                            <div className="divide-y">
                                {module.lessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">Lecture {lesson.orderIndex + 1}:</span>
                                                <span>{lesson.title}</span>
                                                {lesson.downloadUrl && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Downloadable</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/admin/lessons/${lesson.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8">
                                                    <Edit className="h-3 w-3 mr-1" /> Edit Content
                                                </Button>
                                            </Link>
                                            <form action={handleDeleteLesson.bind(null, lesson.id)}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Lesson to Module */}
                            <div className="p-4 bg-slate-50/50 border-t">
                                <form action={handleCreateLesson.bind(null, module.id)} className="flex gap-3 pl-7">
                                    <Input name="title" placeholder="New Lecture Title" required className="flex-1 h-9 text-sm" />
                                    <Button type="submit" size="sm" variant="outline">
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Lecture
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Orphaned Lessons (if any) */}
            {course.lessons.length > 0 && (
                <Card className="border-orange-200 bg-orange-50/30">
                    <CardHeader>
                        <CardTitle className="text-orange-700 text-base">Uncategorized Lessons</CardTitle>
                        <CardDescription>These lessons are not assigned to any section.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-orange-200/50">
                            {course.lessons.map((lesson) => (
                                <div key={lesson.id} className="flex items-center justify-between p-3">
                                    <span>{lesson.title}</span>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/lessons/${lesson.id}`}>
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </Link>
                                        <form action={handleDeleteLesson.bind(null, lesson.id)}>
                                            <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
