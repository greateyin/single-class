import { enforceAdminRole } from '@/lib/auth-guards';
import { MobileHeader } from '@/components/admin/mobile-header';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { getNotifications } from '@/actions/notifications';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await enforceAdminRole();
    const { notifications, unreadCount } = await getNotifications();

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="w-64 hidden md:block flex-shrink-0">
                <AdminSidebar />
            </aside>

            {/* Mobile Header logic - might need adjustment or simply hide on desktop */}
            {/* For now, we keep MobileHeader but maybe we should integrate it better. 
                Assuming MobileHeader handles the mobile menu toggle. 
                MobileHeader currently likely has dark theme styles, might need update later.
             */}
            <div className="md:hidden absolute top-0 left-0 w-full z-50">
                <MobileHeader />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <AdminHeader user={session.user} notifications={notifications} unreadCount={unreadCount} />
                <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
