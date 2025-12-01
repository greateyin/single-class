import { deleteCourse, updateCourse } from '@/actions/admin-courses';
import { createLesson, deleteLesson } from '@/actions/admin-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { db } from '@/db';
import { courses, lessons } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ArrowLeft, Save, Trash2, Plus, Edit } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
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

        revalidatePath(`/admin/courses/${courseId}`);
    }

    async function handleDeleteLesson(lessonId: number) {
        'use server';
        await deleteLesson(lessonId);
        revalidatePath(`/admin/courses/${courseId}`);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/courses">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
            </div>

            <div className="grid gap-6">
                {/* Course Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Course Details</CardTitle>
                        <CardDescription>Update the basic information for this course.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={updateCourse.bind(null, courseId)} className="space-y-4">
                            <div className="grid gap-2">
                                <label htmlFor="title" className="text-sm font-medium">Title</label>
                                <Input id="title" name="title" defaultValue={course.title} required />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="description" className="text-sm font-medium">Description</label>
                                <Textarea id="description" name="description" defaultValue={course.description || ''} rows={4} />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="priceCents" className="text-sm font-medium">Price (Cents)</label>
                                <Input
                                    id="priceCents"
                                    name="priceCents"
                                    type="number"
                                    defaultValue={course.priceCents}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Current Price: ${(course.priceCents / 100).toFixed(2)}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    name="isPublished"
                                    defaultChecked={course.isPublished || false}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isPublished" className="text-sm font-medium">Published</label>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <Button type="submit">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Course Lessons */}
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

                {/* Danger Zone */}
                <Card className="border-red-100">
                    <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={deleteCourse.bind(null, courseId)}>
                            <Button variant="destructive" className="w-full">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Course
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
