import { createCourse } from '@/actions/admin-courses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { PlusCircle, Edit } from 'lucide-react';
import Link from 'next/link';

export default async function AdminCoursesPage() {
    const allCourses = await db.query.courses.findMany({
        orderBy: [desc(courses.createdAt)],
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Course</CardTitle>
                    <CardDescription>Add a new course to your platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createCourse} className="flex gap-4 items-end">
                        <div className="grid gap-2 flex-1">
                            <label htmlFor="title" className="text-sm font-medium">Course Title</label>
                            <Input id="title" name="title" placeholder="e.g. Advanced System Design" required />
                        </div>
                        <Button type="submit">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Course
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allCourses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>${(course.priceCents / 100).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {course.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/courses/${course.id}`}>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {allCourses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        No courses found. Create one above.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
