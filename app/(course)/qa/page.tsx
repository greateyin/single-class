import { getQaMessages } from '@/actions/content';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default async function QaPage() {
    const messages = await getQaMessages();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Q&A Discussions</h1>
            </div>

            <div className="grid gap-4">
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <Card key={msg.id}>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{msg.authorName}</span>
                                        {msg.authorRole === 'admin' && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Instructor</span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            in <Link href={`/lessons/${msg.lessonId}`} className="text-blue-600 hover:underline">{msg.lessonTitle}</Link>
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            • {msg.createdAt.toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-700">{msg.content}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-12">No discussions yet.</p>
                )}
            </div>
        </div>
    );
}
