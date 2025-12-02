import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SidebarNav } from './sidebar-nav';

export default async function CourseEditorLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

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
                    <h1 className="text-xl font-bold tracking-tight">Weebly 2016 架站實務</h1>
                    <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded">DRAFT</span>
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
