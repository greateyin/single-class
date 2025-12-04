import { getLessonDetails, markLessonCompleted, submitAssessment, submitQaMessage, getQaMessages } from '@/actions/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Download, FileText, MessageSquare, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { lessons, courses, modules } from '@/db/schema';
import { eq, and, asc, gt } from 'drizzle-orm';
import { getEmbedUrl } from '@/lib/utils';
import { auth } from '@/lib/auth';
import { CourseSidebar } from '@/components/course-sidebar';
import { lessonCompletion } from '@/db/schema';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: lessonId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    const lesson = await getLessonDetails(lessonId);
    if (!lesson) notFound();

    const course = await db.query.courses.findFirst({
        where: eq(courses.id, lesson.courseId!),
    });

    if (!course) notFound();

    // Fetch all lessons for sidebar
    const allLessons = await db.query.lessons.findMany({
        where: eq(lessons.courseId, course.id),
        orderBy: [asc(lessons.orderIndex)],
        with: {
            lessonCompletion: {
                where: eq(lessonCompletion.userId, session.user.id),
            },
        },
    });

    const sidebarLessons = allLessons.map(l => ({
        id: l.id,
        title: l.title,
        orderIndex: l.orderIndex,
        moduleId: l.moduleId,
        isCompleted: l.lessonCompletion.length > 0,
    }));

    const qaMessages = await getQaMessages(lessonId);

    // Find Next Lesson
    const nextLesson = await db.query.lessons.findFirst({
        where: and(
            eq(lessons.courseId, lesson.courseId!),
            gt(lessons.orderIndex, lesson.orderIndex)
        ),
        orderBy: [asc(lessons.orderIndex)],
    });

    // Fetch modules for sidebar structure
    const modules = await db.query.modules.findMany({
        where: eq(modules.courseId, course.id),
        orderBy: [asc(modules.orderIndex)],
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Video Player */}
                    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                        <iframe
                            src={getEmbedUrl(lesson.videoEmbedUrl) || ''}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title={lesson.title}
                        />
                    </div>

                    {/* Header & Actions */}
                    <div className="flex flex-col gap-4">
                        <Link href={`/courses/${lesson.courseId}`} className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Course
                        </Link>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{lesson.title}</h1>
                                <p className="text-muted-foreground">Lesson {lesson.orderIndex}</p>
                                {course?.allowDownload && lesson.downloadUrl && (
                                    <div className="mt-2">
                                        <Link href={lesson.downloadUrl} target="_blank" download>
                                            <Button variant="outline" size="sm" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                                                <Download className="h-4 w-4" /> Download Video
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {nextLesson && (
                                    <Link href={`/lessons/${nextLesson.id}`}>
                                        <Button variant="outline" className="gap-2">
                                            Next Lesson <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                                <form action={markLessonCompleted.bind(null, lessonId)}>
                                    <Button
                                        disabled={lesson.isCompleted}
                                        variant={lesson.isCompleted ? "outline" : "default"}
                                        className="gap-2"
                                    >
                                        {lesson.isCompleted ? (
                                            <>
                                                <CheckCircle className="h-4 w-4" /> Completed
                                            </>
                                        ) : (
                                            "Mark as Complete"
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Content Tabs */}
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                                <TabsTrigger value="qa">Q&A</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6 mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Attachments</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {lesson.attachments.length > 0 ? (
                                            <ul className="space-y-2">
                                                {lesson.attachments.map((att) => (
                                                    <li key={att.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-5 w-5 text-slate-500" />
                                                            <span className="font-medium text-sm">{att.fileName}</span>
                                                        </div>
                                                        <Link href={att.storageUrl} target="_blank" download>
                                                            <Button variant="ghost" size="sm" className="gap-2">
                                                                <Download className="h-4 w-4" /> Download
                                                            </Button>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No attachments available.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Assessment Tab */}
                            <TabsContent value="assessment" className="space-y-6 mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Knowledge Check</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {lesson.assessments.length > 0 ? (
                                            lesson.assessments.map((assessment) => {
                                                const attempt = lesson.attempts.find(a => a.assessmentId === assessment.id);
                                                return (
                                                    <div key={assessment.id} className="space-y-4 p-4 border rounded-lg">
                                                        <p className="font-medium">{assessment.questionText}</p>

                                                        {attempt ? (
                                                            <div className={`p-3 rounded text-sm font-medium ${attempt.score > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                                {attempt.score > 0 ? 'Correct! Good job.' : 'Incorrect. Try again?'}
                                                            </div>
                                                        ) : (
                                                            <form action={submitAssessment.bind(null, lessonId)} className="flex gap-2">
                                                                <input type="hidden" name="assessmentId" value={assessment.id} />
                                                                <Input name="answer" placeholder="Type your answer..." required className="flex-1" />
                                                                <Button type="submit">Submit</Button>
                                                            </form>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No assessments for this lesson.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Q&A Tab */}
                            <TabsContent value="qa" className="space-y-6 mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Discussion</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Post Question Form */}
                                        <form action={submitQaMessage.bind(null, lessonId)} className="space-y-4">
                                            <Textarea name="content" placeholder="Ask a question..." required />
                                            <Button type="submit" className="gap-2">
                                                <MessageSquare className="h-4 w-4" /> Post Question
                                            </Button>
                                        </form>

                                        {/* Message List */}
                                        <div className="space-y-4">
                                            {qaMessages.length > 0 ? (
                                                qaMessages.map((msg) => (
                                                    <div key={msg.id} className="p-4 bg-slate-50 rounded-lg space-y-2">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-sm">{msg.authorName}</span>
                                                                {msg.authorRole === 'admin' && (
                                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Instructor</span>
                                                                )}
                                                                <span className="text-xs text-muted-foreground">
                                                                    {msg.createdAt.toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-700">{msg.content}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-8">No questions yet. Be the first to ask!</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <CourseSidebar
                        course={{ id: course.id, title: course.title }}
                        lessons={sidebarLessons}
                        modules={modules}
                        currentLessonId={lessonId}
                    />
                </div>
            </div>
        </div>
    );
}
