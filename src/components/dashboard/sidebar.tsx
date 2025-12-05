"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    User,
    MessageCircle,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react"; // We might need a different way to sign out if using server actions only

// Helper for SignOut - strictly client side navigation or use the server action prop passed down?
// For consistency with the previous layout, let's try to simulate the form submission or just use a simple link to a signout route if one exists. 
// However, the cleanest way in a client component sidebar without passing props is often just a button that triggers a server action if we can import it, 
// BUT server actions in client components need to be safe. 
// Let's assume we can use a server action wrapper or just standard next-auth signOut if applicable. 
// Given the previous layout used a form with server action:
// <form action={async () => { 'use server'; await signOut(); }}>
// We can't put 'use server' directly inside a client component's event handler.
// We will create a small client-friendly wrapper or just pass the action, but for now let's build the UI.

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Q&A",
        icon: MessageCircle,
        href: "/qa",
        color: "text-emerald-500",
    },
    {
        label: "Profile",
        icon: User,
        href: "/profile",
        color: "text-violet-500",
    },
];

export const UserSidebar = () => {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-white text-slate-900 border-r border-slate-200 shadow-sm relative z-20">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                            {process.env.NEXT_PUBLIC_APP_NAME?.[0] || 'L'}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        {process.env.NEXT_PUBLIC_APP_NAME || 'Learning'}
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition",
                                pathname === route.href || pathname?.startsWith(route.href + '/')
                                    ? "text-indigo-600 bg-indigo-50"
                                    : "text-slate-500"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="px-3 py-2 border-t border-slate-200 bg-slate-50/50">
                {/* For now, we link to api/auth/signout for simplicity, or we can use a form in the layout and pass it down. 
                     Let's use a standard link for now which NextAuth usually handles or a redirect.
                     Actually, standard Next.js way with Auth.js v5 is usually a form.
                     Let's leave a visual button here, but maybe we handle the actual signout in the Header or via a dedicated component?
                     Let's try to mimic the form submission using a transition or just a link to a route that signs out.
                  */}
                <Link
                    href="/api/auth/signout"
                    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition text-slate-500"
                >
                    <div className="flex items-center flex-1">
                        <LogOut className="h-5 w-5 mr-3 text-slate-500" />
                        Sign Out
                    </div>
                </Link>
            </div>
        </div>
    );
};
