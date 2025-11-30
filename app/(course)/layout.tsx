import React from 'react';
import Link from 'next/link';
import { getCourseContent } from '@/actions/content';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, PlayCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/auth';

export default async function CourseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { lessons, progress } = await getCourseContent();

    return (
        <div className="flex h-screen bg-slate-950 text-slate-50">
            {/* Sidebar */}
            <aside className="w-80 border-r border-slate-800 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-slate-800">
                    <Link href="/dashboard" className="text-xl font-bold hover:text-blue-400 transition">
                        Single Class
                    </Link>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                        {lessons.map((lesson) => (
                            <Link
                                key={lesson.id}
                                href={`/lessons/${lesson.id}`}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-slate-900",
                                    lesson.isCompleted ? "text-slate-400" : "text-slate-200"
                                )}
                            >
                                {lesson.isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                ) : (
                                    <PlayCircle className="h-5 w-5 text-blue-500 shrink-0" />
                                )}
                                <span className="text-sm font-medium line-clamp-1">{lesson.title}</span>
                            </Link>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-slate-800">
                    <form
                        action={async () => {
                            'use server';
                            await signOut({ redirectTo: '/' });
                        }}
                    >
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white">
                            Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
