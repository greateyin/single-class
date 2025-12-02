import { createLesson, deleteLesson } from '@/actions/admin-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { db } from '@/db';
import { courses, lessons } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function CurriculumPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
        redirect('/admin/courses');
    }

    const course = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
    });

    if (!course) {
        redirect('/admin/courses');
    }

    // Fetch lessons for this course
    const courseLessons = await db.query.lessons.findMany({
        where: eq(lessons.courseId, courseId),
        orderBy: (lessons, { asc }) => [asc(lessons.orderIndex)],
    });

    async function handleCreateLesson(formData: FormData) {
        'use server';
        const title = formData.get('title') as string;
        if (!title) return;

        const maxOrder = courseLessons.reduce((max, l) => Math.max(max, l.orderIndex), 0);

        await createLesson({
            title,
            orderIndex: maxOrder + 1,
            videoEmbedUrl: '',
            courseId: courseId,
        });

        revalidatePath(`/admin/courses/${courseId}/curriculum`);
    }

    async function handleDeleteLesson(lessonId: number) {
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

            <Card>
                <CardHeader>
                    <CardTitle>Course Lessons</CardTitle>
                    <CardDescription>Manage lessons for this course.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add New Lesson */}
                    <form action={handleCreateLesson} className="flex gap-4">
                        <Input name="title" placeholder="New Lesson Title" required className="flex-1" />
                        <Button type="submit">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lesson
                        </Button>
                    </form>

                    {/* Lessons List */}
                    {courseLessons.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No lessons yet. Add one above.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courseLessons.map((lesson) => (
                                    <TableRow key={lesson.id}>
                                        <TableCell className="font-medium">{lesson.orderIndex}</TableCell>
                                        <TableCell>{lesson.title}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/admin/lessons/${lesson.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <form action={handleDeleteLesson.bind(null, lesson.id)} className="inline-block">
                                                <Button variant="destructive" size="sm" type="submit">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
