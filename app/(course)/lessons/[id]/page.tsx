import { getLesson, markLessonComplete } from '@/actions/content';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function LessonPage({ params }: { params: { id: string } }) {
    const lessonId = parseInt(params.id);
    const lesson = await getLesson(lessonId);

    if (!lesson) {
        notFound();
    }

    return (
        <div className="flex flex-col h-full">
            {/* Video Player Area */}
            <div className="bg-black aspect-video w-full flex items-center justify-center">
                <iframe
                    src={lesson.videoEmbedUrl}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                />
            </div>

            {/* Content Area */}
            <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{lesson.title}</h1>
                    <form action={markLessonComplete.bind(null, lessonId)}>
                        <Button
                            variant={lesson.isCompleted ? "outline" : "default"}
                            className={lesson.isCompleted ? "text-green-500 border-green-500 hover:text-green-600" : "bg-green-600 hover:bg-green-700 text-white"}
                        >
                            {lesson.isCompleted ? (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Completed
                                </>
                            ) : (
                                "Mark as Complete"
                            )}
                        </Button>
                    </form>
                </div>

                <div className="prose prose-invert max-w-none">
                    <p className="text-slate-400">
                        In this lesson, we will cover the fundamental concepts of... (Content placeholder)
                    </p>
                    {/* In a real app, render lesson.description (Markdown) here */}
                </div>

                <div className="flex justify-between pt-8 border-t border-slate-800">
                    <Button variant="ghost" asChild>
                        <Link href={`/lessons/${lessonId - 1}`}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href={`/lessons/${lessonId + 1}`}>
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
