import { getLessons, createLesson, deleteLesson } from '@/actions/admin-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function AdminLessonsPage() {
    const lessons = await getLessons();

    async function handleCreate(formData: FormData) {
        'use server';
        const title = formData.get('title') as string;
        if (!title) return;

        // Auto-assign next order index
        const maxOrder = lessons.reduce((max, l) => Math.max(max, l.orderIndex), 0);

        await createLesson({
            title,
            orderIndex: maxOrder + 1,
            videoEmbedUrl: '', // Default empty
        });
    }

    async function handleDelete(id: string) {
        'use server';
        await deleteLesson(id);
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">Lessons</h1>
            </div>

            {/* Create New Lesson */}
            <Card>
                <CardHeader>
                    <CardTitle>Add New Lesson</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleCreate} className="flex gap-4">
                        <Input name="title" placeholder="Lesson Title" required className="max-w-md" />
                        <Button type="submit">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lesson
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Lessons List */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Video</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lessons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No lessons found. Create one above.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lessons.map((lesson) => (
                                    <TableRow key={lesson.id}>
                                        <TableCell className="font-medium">{lesson.orderIndex}</TableCell>
                                        <TableCell>{lesson.title}</TableCell>
                                        <TableCell>
                                            {lesson.course ? (
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                    {lesson.course.title}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {lesson.hasAttachment && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">File</span>}
                                                {lesson.hasAssessment && <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Quiz</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/admin/lessons/${lesson.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <form action={handleDelete.bind(null, lesson.id)} className="inline-block">
                                                <Button variant="destructive" size="sm" type="submit">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
