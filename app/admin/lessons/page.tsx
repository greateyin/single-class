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

    async function handleDelete(id: number) {
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
                                        <TableCell>
                                            <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
                                        </TableCell>
                                        <TableCell>{lesson.orderIndex}</TableCell>
                                        <TableCell className="font-medium">{lesson.title}</TableCell>
                                        <TableCell>
                                            {lesson.videoEmbedUrl ? (
                                                <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">Configured</span>
                                            ) : (
                                                <span className="text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded">Missing</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/admin/lessons/${lesson.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
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
