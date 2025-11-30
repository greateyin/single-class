import { enforceAdminRole } from '@/lib/auth-guards';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth'; // We might need a client-side signout or server action
// Actually, for simplicity, let's just use a link to api/auth/signout or a server action form

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await enforceAdminRole();

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Admin</h1>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-slate-800 transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-slate-800 transition-colors">
                        <Users className="h-5 w-5" />
                        Users
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t border-slate-800">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
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
