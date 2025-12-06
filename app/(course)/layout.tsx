import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserSidebar } from '@/components/dashboard/sidebar';
import { UserHeader } from '@/components/dashboard/header';
import { getNotifications } from '@/actions/notifications';

export default async function CourseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) redirect('/api/auth/signin');

    const { notifications, unreadCount } = await getNotifications();

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="w-64 hidden md:block flex-shrink-0">
                <UserSidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <UserHeader user={session.user} notifications={notifications} unreadCount={unreadCount} />
                <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
