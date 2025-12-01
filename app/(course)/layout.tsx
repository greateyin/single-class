import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function CourseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) redirect('/api/auth/signin');

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="font-bold text-xl text-slate-900">
                        Single Course
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                            Dashboard
                        </Link>
                        <Link href="/qa" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                            Q&A
                        </Link>
                        <form
                            action={async () => {
                                'use server';
                                await signOut();
                            }}
                        >
                            <Button variant="ghost" size="sm">
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
