import { updateCourse } from '@/actions/admin-courses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Save } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function PricingPage({ params }: { params: Promise<{ id: string }> }) {
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
                <h2 className="text-2xl font-bold tracking-tight">Pricing</h2>
                <p className="text-muted-foreground">
                    Set the price for your course.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Course Price</CardTitle>
                    <CardDescription>Set the price in cents (e.g., 9700 for $97.00).</CardDescription>
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
                        <input type="hidden" name="isPublished" value={course.isPublished ? 'on' : 'off'} />

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

                        <div className="pt-4 flex justify-end">
                            <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                Save
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
