import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserSidebar } from '@/components/dashboard/sidebar';
import { UserHeader } from '@/components/dashboard/header';
import { MobileHeader } from '@/components/admin/mobile-header'; // Reuse or create new one? Text content might differ...
// For now, let's stick to a clean layout. Mobile support might need a UserMobileHeader later.

export default async function CourseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) redirect('/api/auth/signin');

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="w-64 hidden md:block flex-shrink-0">
                <UserSidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <UserHeader />
                <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
