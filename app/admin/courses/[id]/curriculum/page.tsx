import { createLesson, deleteLesson, reorderLessons } from '@/actions/admin-content';
import { ConfirmModal } from '@/components/confirm-modal';
import { ModulesList } from './_components/modules-list';
import { createModule, deleteModule, updateModule, reorderModules } from '@/actions/admin-modules';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db } from '@/db';
import { courses, lessons, modules } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { Plus } from 'lucide-react';
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

    async function handleReorderModules(updateData: { id: string; orderIndex: number }[]) {
        'use server';
        await reorderModules(updateData);
    }

    async function handleUpdateModule(moduleId: string, title: string) {
        'use server';
        await updateModule(moduleId, title);
    }

    async function handleReorderLessons(moduleId: string, updateData: { id: string; orderIndex: number }[]) {
        'use server';
        await reorderLessons(updateData);
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
            <ModulesList
                items={course.modules}
                onReorder={handleReorderModules}
                onUpdate={handleUpdateModule}
                onDelete={handleDeleteModule}
                onReorderLessons={handleReorderLessons}
                onDeleteLesson={handleDeleteLesson}
                onCreateLesson={handleCreateLesson}
            />

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
                                        <ConfirmModal onConfirm={handleDeleteLesson.bind(null, lesson.id)}>
                                            <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                                        </ConfirmModal>
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
