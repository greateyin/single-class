import { updateCourse } from '@/actions/admin-courses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function CourseLandingPage({ params }: { params: Promise<{ id: string }> }) {
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
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Course landing page</h2>
                <p className="text-muted-foreground">
                    Your course landing page is crucial to your success. If it's done right, it can also help you gain visibility in search engines like Google.
                </p>
            </div>

            <form action={updateCourse.bind(null, courseId)} className="space-y-8">
                <Card>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">Course title</label>
                            <Input id="title" name="title" defaultValue={course.title} placeholder="Insert your course title." required />
                            <p className="text-xs text-muted-foreground">Your title should be a mix of attention-grabbing, informative, and optimized for search</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="subtitle" className="text-sm font-medium">Course subtitle</label>
                            <Input id="subtitle" name="subtitle" defaultValue={course.subtitle || ''} placeholder="Insert your course subtitle." />
                            <p className="text-xs text-muted-foreground">Use 1 or 2 related keywords, and mention 3-4 of the most important areas that you've covered during your course.</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">Course description</label>
                            <Textarea id="description" name="description" defaultValue={course.description || ''} placeholder="Insert your course description." rows={6} />
                            <p className="text-xs text-muted-foreground">Description should have minimum 200 words.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Basic info</label>
                            <div className="grid grid-cols-3 gap-4">
                                <select
                                    name="language"
                                    defaultValue={course.language || 'English'}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="English">English</option>
                                    <option value="Chinese (Traditional)">Chinese (Traditional)</option>
                                    <option value="Spanish">Spanish</option>
                                </select>

                                <select
                                    name="level"
                                    defaultValue={course.level || 'All Levels'}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="Beginner Level">Beginner Level</option>
                                    <option value="Intermediate Level">Intermediate Level</option>
                                    <option value="Expert Level">Expert Level</option>
                                    <option value="All Levels">All Levels</option>
                                </select>

                                <select
                                    name="category"
                                    defaultValue={course.category || ''}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="" disabled>-- Select Category --</option>
                                    <option value="Development">Development</option>
                                    <option value="Business">Business</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Design">Design</option>
                                    <option value="Marketing">Marketing</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="primaryTopic" className="text-sm font-medium">What is primarily taught in your course?</label>
                            <Input id="primaryTopic" name="primaryTopic" defaultValue={course.primaryTopic || ''} placeholder="e.g. Landscape Photography" />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="imageUrl" className="text-sm font-medium">Course Image</label>
                            <div className="flex gap-4 items-start">
                                <div className="w-1/2 aspect-video bg-slate-100 rounded-md border flex items-center justify-center overflow-hidden">
                                    {course.imageUrl ? (
                                        <img src={course.imageUrl} alt="Course" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-slate-400">No image selected</span>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Upload your course image here. It must meet our course image quality standards to be accepted. Important guidelines: 750x422 pixels; .jpg, .jpeg,. gif, or .png. no text on the image.
                                    </p>
                                    <Input id="imageUrl" name="imageUrl" defaultValue={course.imageUrl || ''} placeholder="https://..." />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg">Save</Button>
                </div>
            </form>
        </div>
    );
}
