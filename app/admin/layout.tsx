import React from 'react';
import Link from 'next/link';
import { enforceAdminRole } from '@/lib/auth-guards';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Video, LogOut, ArrowLeft } from 'lucide-react';
import { signOut } from '@/lib/auth';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Security Check
    await enforceAdminRole();

    return (
        <div className="flex h-screen bg-slate-950 text-slate-50">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r border-slate-800 flex flex-col bg-slate-900">
                <div className="p-6 border-b border-slate-800">
                    <span className="text-xl font-bold text-red-500">Admin Console</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                        <Users className="h-5 w-5" />
                        Users
                    </Link>
                    <Link href="/admin/content" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                        <Video className="h-5 w-5" />
                        Content
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <Button variant="ghost" asChild className="w-full justify-start text-slate-400 hover:text-white">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to App
                        </Link>
                    </Button>
                    <form
                        action={async () => {
                            'use server';
                            await signOut({ redirectTo: '/' });
                        }}
                    >
                        <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20">
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
