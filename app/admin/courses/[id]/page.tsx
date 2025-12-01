import { deleteCourse, updateCourse } from '@/actions/admin-courses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

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

            <div className="grid gap-6 md:grid-cols-2">
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
