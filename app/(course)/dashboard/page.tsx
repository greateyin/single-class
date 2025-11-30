import { getCourseContent } from '@/actions/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
    const session = await auth();
    const { lessons, progress } = await getCourseContent();

    const nextLesson = lessons.find(l => !l.isCompleted) || lessons[0];

    return (
        <div className="p-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name || 'Student'}</h1>
                <p className="text-slate-400">
                    You are {Math.round(progress)}% through the course. Keep it up!
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Resume Card */}
                <Card className="bg-slate-900 border-slate-800 col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PlayCircle className="text-blue-500" />
                            Continue Learning
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Next Up</p>
                            <h3 className="text-xl font-bold">{nextLesson.title}</h3>
                        </div>
                        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Link href={`/lessons/${nextLesson.id}`}>
                                {progress === 0 ? 'Start Course' : 'Resume Lesson'}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle>Your Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Completed</span>
                            <span className="text-xl font-bold">{lessons.filter(l => l.isCompleted).length} / {lessons.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Certificates</span>
                            <span className="text-xl font-bold">{progress === 100 ? 1 : 0}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
