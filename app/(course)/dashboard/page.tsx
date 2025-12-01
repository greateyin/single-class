import { getStudentLessons } from '@/actions/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Lock, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
    const lessons = await getStudentLessons();

    const completedCount = lessons.filter(l => l.isCompleted).length;
    const progress = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Progress Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{Math.round(progress)}% Completed</span>
                        <span>{completedCount} / {lessons.length} Lessons</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </CardContent>
            </Card>

            {/* Lesson List */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Course Content</h2>
                <div className="grid gap-4">
                    {lessons.map((lesson) => (
                        <Link
                            key={lesson.id}
                            href={lesson.isLocked ? '#' : `/lessons/${lesson.id}`}
                            className={`block transition-opacity ${lesson.isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                        >
                            <Card>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0">
                                            {lesson.isCompleted ? (
                                                <CheckCircle className="h-6 w-6 text-green-500" />
                                            ) : lesson.isLocked ? (
                                                <Lock className="h-6 w-6 text-slate-400" />
                                            ) : (
                                                <PlayCircle className="h-6 w-6 text-blue-500" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{lesson.title}</h3>
                                            <p className="text-sm text-muted-foreground">Lesson {lesson.orderIndex}</p>
                                        </div>
                                    </div>
                                    {lesson.isCompleted && (
                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                            Completed
                                        </span>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
