import { getLessonById, updateLesson, deleteAttachment, createAssessment, deleteAssessment } from '@/actions/admin-content';
import { LessonAttachmentUpload } from '@/components/admin/lesson-attachment-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '@/db';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SuccessToast } from '@/components/success-toast';

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: lessonId } = await params;

    const lesson = await getLessonById(lessonId);
    if (!lesson) {
        notFound();
    }

    const allCourses = await db.query.courses.findMany();

    async function handleUpdate(formData: FormData) {
        'use server';

        const title = formData.get('title') as string;
        const videoEmbedUrl = formData.get('videoEmbedUrl') as string;
        const description = formData.get('description') as string;
        const orderIndexRaw = formData.get('orderIndex') as string;
        const orderIndex = orderIndexRaw ? parseInt(orderIndexRaw) : 0;
        const courseIdRaw = formData.get('courseId') as string;
        const courseId = courseIdRaw === '' ? null : courseIdRaw;
        const downloadUrl = formData.get('downloadUrl') as string || undefined;


        await updateLesson(lessonId, {
            title,
            videoEmbedUrl,
            description,
            orderIndex,
            courseId,
            downloadUrl,
        });


        redirect(`/admin/lessons/${lessonId}?updated=true`);
    }

    return (
        <div className="space-y-6">
            <SuccessToast message="Lesson updated successfully" />
            <div className="flex items-center gap-4">
                <Link href={lesson.courseId ? `/admin/courses/${lesson.courseId}/curriculum` : '/admin/courses'}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-slate-900">Edit Lesson</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lesson Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleUpdate} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" defaultValue={lesson.title} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="courseId">Course</Label>
                                <select
                                    id="courseId"
                                    name="courseId"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    defaultValue={lesson.courseId || ''}
                                >
                                    <option value="">Select a course...</option>
                                    {allCourses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="orderIndex">Order Index</Label>
                                <Input id="orderIndex" name="orderIndex" type="number" defaultValue={lesson.orderIndex} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="videoEmbedUrl">Vimeo Embed URL</Label>
                            <Input
                                id="videoEmbedUrl"
                                name="videoEmbedUrl"
                                defaultValue={lesson.videoEmbedUrl}
                                placeholder="https://player.vimeo.com/video/..."
                            />
                            <p className="text-xs text-muted-foreground">
                                Only Vimeo URLs are secure. Ensure domain privacy is set on Vimeo.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="downloadUrl">Video Download URL (Optional)</Label>
                            <Input
                                id="downloadUrl"
                                name="downloadUrl"
                                defaultValue={lesson.downloadUrl || ''}
                                placeholder="https://..."
                            />
                            <p className="text-xs text-muted-foreground">
                                Direct link to the video file (e.g. S3, Dropbox). Only shown if &quot;Allow Video Download&quot; is enabled in Course Settings.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={lesson.description || ''}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Attachments & Assessments */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Attachments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* List Attachments */}
                        {lesson.attachments.length > 0 ? (
                            <ul className="space-y-2">
                                {lesson.attachments.map((att) => (
                                    <li key={att.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-sm font-medium truncate">{att.fileName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={att.storageUrl} target="_blank" className="text-xs text-blue-600 hover:underline">
                                                View
                                            </Link>
                                            <form action={deleteAttachment.bind(null, att.id)}>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500">
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </form>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No attachments yet.</p>
                        )}

                        {/* Upload Form */}
                        <div className="pt-4 border-t">
                            <LessonAttachmentUpload lessonId={lesson.id} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* List Assessments */}
                        {lesson.assessments.length > 0 ? (
                            <ul className="space-y-4">
                                {lesson.assessments.map((q) => (
                                    <li key={q.id} className="p-3 bg-slate-50 rounded border space-y-2">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium text-sm">{q.questionText}</p>
                                            <form action={deleteAssessment.bind(null, q.id)}>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500">
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </form>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            <span className="font-semibold">Answer:</span> {q.correctAnswer}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No assessments yet.</p>
                        )}

                        {/* Add Assessment Form */}
                        <div className="pt-4 border-t">
                            <form action={createAssessment.bind(null, lesson.id)} className="space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="questionText" className="text-xs">Question</Label>
                                    <Input id="questionText" name="questionText" required className="text-sm" placeholder="e.g. What is the capital of France?" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="correctAnswer" className="text-xs">Correct Answer</Label>
                                    <Input id="correctAnswer" name="correctAnswer" required className="text-sm" placeholder="e.g. Paris" />
                                </div>
                                <Button type="submit" size="sm" className="w-full">Add Question</Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
