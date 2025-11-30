import { getLessonsForAdmin, updateLesson } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function ContentPage() {
    const lessons = await getLessonsForAdmin();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Content Management</h1>

            <div className="grid gap-6">
                {lessons.map((lesson) => (
                    <Card key={lesson.id} className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex justify-between">
                                <span>{lesson.orderIndex}. {lesson.title}</span>
                                <span className="text-sm text-slate-500 font-normal">ID: {lesson.id}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                action={async (formData) => {
                                    'use server';
                                    const title = formData.get('title') as string;
                                    const videoEmbedUrl = formData.get('videoEmbedUrl') as string;
                                    const description = formData.get('description') as string;
                                    await updateLesson(lesson.id, { title, videoEmbedUrl, description });
                                }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`title-${lesson.id}`}>Title</Label>
                                        <Input
                                            id={`title-${lesson.id}`}
                                            name="title"
                                            defaultValue={lesson.title}
                                            className="bg-slate-800 border-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`video-${lesson.id}`}>Video URL</Label>
                                        <Input
                                            id={`video-${lesson.id}`}
                                            name="videoEmbedUrl"
                                            defaultValue={lesson.videoEmbedUrl}
                                            className="bg-slate-800 border-slate-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`desc-${lesson.id}`}>Description</Label>
                                    <Input
                                        id={`desc-${lesson.id}`}
                                        name="description"
                                        defaultValue={lesson.description || ''}
                                        className="bg-slate-800 border-slate-700"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" size="sm">Save Changes</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
