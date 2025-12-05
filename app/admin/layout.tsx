import { enforceAdminRole } from '@/lib/auth-guards';
import Link from 'next/link';
import { LayoutDashboard, Users, LogOut, BookOpen } from 'lucide-react';
import { MobileHeader } from '@/components/admin/mobile-header';
// Actually, for simplicity, let's just use a link to api/auth/signout or a server action form

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await enforceAdminRole();

    return (
        <div className="flex min-h-screen bg-[var(--brand-bg)] flex-col md:flex-row">
            <MobileHeader />

            {/* Sidebar */}
            <aside className="w-64 bg-[var(--brand-navy)] text-white hidden md:block border-r border-blue-900">
                <div className="p-6 border-b border-blue-800">
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--brand-gold)]">Admin</h1>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-800 transition-colors text-blue-100 hover:text-white">
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-800 transition-colors text-blue-100 hover:text-white">
                        <Users className="h-5 w-5" />
                        Users
                    </Link>
                    <Link href="/admin/courses" className="flex items-center gap-3 rounded-lg px-3 py-2 text-blue-100 transition-all hover:text-white hover:bg-blue-800">
                        <BookOpen className="h-4 w-4" />
                        Courses
                    </Link>
                    <Link href="/admin/orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-blue-100 transition-all hover:text-white hover:bg-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        Orders
                    </Link>
                    <Link href="/admin/sales" className="flex items-center gap-3 rounded-lg px-3 py-2 text-blue-100 transition-all hover:text-white hover:bg-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4">
                            <line x1="12" y1="20" x2="12" y2="10" />
                            <line x1="18" y1="20" x2="18" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="16" />
                        </svg>
                        Sales
                    </Link>

                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t border-blue-800">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-800 transition-colors text-blue-300 hover:text-white">
                        <LogOut className="h-5 w-5" />
                        Exit to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
