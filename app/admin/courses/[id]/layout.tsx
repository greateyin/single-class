import { Button } from '@/components/ui/button';

import { ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import { SidebarNav } from './sidebar-nav';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

export default async function CourseEditorLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const course = await db.query.courses.findFirst({
        where: eq(courses.id, id),
    });

    if (!course) {
        notFound();
    }

    return (
        <div className="space-y-6 p-6 pb-16 block">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/courses">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to courses
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight">{course.title}</h1>
                    <span className={`text-xs px-2 py-0.5 rounded ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                        {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                    <Link href={`/enroll/${course.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="ml-2">
                            <Eye className="h-4 w-4 mr-2" />
                            Landing Page
                        </Button>
                    </Link>
                    <Link href={`/courses/${course.id}`} target="_blank">
                        <Button variant="default" size="sm" className="ml-2 bg-[var(--brand-navy)] hover:bg-blue-900">
                            <Eye className="h-4 w-4 mr-2" />
                            Content Preview
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <SidebarNav courseId={id} />
                </aside>
                <div className="flex-1 lg:max-w-3xl">{children}</div>
            </div>
        </div>
    );
}
