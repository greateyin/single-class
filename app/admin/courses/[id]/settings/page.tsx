import { deleteCourse, updateCourseSettings } from '@/actions/admin-courses';
import { ConfirmModal } from '@/components/confirm-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Save, Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { SuccessToast } from '@/components/success-toast';

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
            <SuccessToast message="Settings updated successfully" />
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
                    <form action={updateCourseSettings.bind(null, courseId)} className="space-y-4">

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

                        <div className="space-y-2 pt-4 border-t">
                            <label htmlFor="guarantee" className="text-sm font-medium">Money Back Guarantee</label>
                            <p className="text-xs text-muted-foreground">
                                Text to display for the guarantee policy (e.g. &quot;30-Day Money-Back Guarantee&quot;). Leave empty to hide.
                            </p>
                            <input
                                id="guarantee"
                                name="guarantee"
                                type="text"
                                placeholder="e.g. 30-Day Money-Back Guarantee"
                                defaultValue={course.guarantee || ''}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <label htmlFor="accessMonths" className="text-sm font-medium">Access Duration (Months)</label>
                            <p className="text-xs text-muted-foreground">
                                Set the number of months a user has access to the course after their first view. Leave empty for lifetime access.
                            </p>
                            <input
                                id="accessMonths"
                                name="accessMonths"
                                type="number"
                                min="1"
                                placeholder="e.g. 12"
                                defaultValue={course.accessMonths || ''}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            <div className="space-y-2">
                                <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
                                <p className="text-xs text-muted-foreground">
                                    When the course becomes available.
                                </p>
                                <input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    defaultValue={course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : ''}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
                                <p className="text-xs text-muted-foreground">
                                    When the course stops being available.
                                </p>
                                <input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    defaultValue={course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : ''}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
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
                    <ConfirmModal
                        onConfirm={deleteCourse.bind(null, courseId)}
                        title="Delete Course"
                        description="Are you sure you want to delete this course? This action cannot be undone and will remove all modules, lessons, and student progress."
                    >
                        <Button variant="destructive" className="w-full">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Course
                        </Button>
                    </ConfirmModal>
                </CardContent>
            </Card>
        </div>
    );
}
