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
        <div className="min-h-screen bg-[var(--brand-bg)]">
            <header className="bg-[var(--brand-navy)] border-b border-blue-900 sticky top-0 z-10 shadow-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="font-bold text-xl text-[var(--brand-gold)] tracking-tight">
                        {process.env.NEXT_PUBLIC_APP_NAME || 'Single Course'}
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/qa" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                            Q&A
                        </Link>
                        <Link href="/profile" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                            Profile
                        </Link>
                        <form
                            action={async () => {
                                'use server';
                                await signOut();
                            }}
                        >
                            <Button variant="ghost" size="sm" className="text-blue-100 hover:text-white hover:bg-blue-800">
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
