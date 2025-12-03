import { deleteCourse, updateCourse } from '@/actions/admin-courses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Save, Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: courseId } = await params;

    const course = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
    });

    if (!course) {
        redirect('/admin/courses');
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your course status and settings.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Course Status</CardTitle>
                    <CardDescription>Control the visibility of your course.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={updateCourse.bind(null, courseId)} className="space-y-4">
                        {/* Hidden fields to preserve other data */}
                        <input type="hidden" name="title" value={course.title} />
                        <input type="hidden" name="subtitle" value={course.subtitle || ''} />
                        <input type="hidden" name="description" value={course.description || ''} />
                        <input type="hidden" name="language" value={course.language || ''} />
                        <input type="hidden" name="level" value={course.level || ''} />
                        <input type="hidden" name="category" value={course.category || ''} />
                        <input type="hidden" name="primaryTopic" value={course.primaryTopic || ''} />
                        <input type="hidden" name="imageUrl" value={course.imageUrl || ''} />
                        <input type="hidden" name="priceCents" value={course.priceCents} />

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

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="allowDownload"
                                name="allowDownload"
                                defaultChecked={course.allowDownload || false}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="allowDownload" className="text-sm font-medium">Allow Video Download</label>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                Save Status
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
    );
}
