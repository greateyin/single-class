"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    ShoppingCart,
    TrendingUp,
    LogOut,
    Settings
} from "lucide-react";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Users",
        icon: Users,
        href: "/admin/users",
        color: "text-violet-500",
    },
    {
        label: "Courses",
        icon: BookOpen,
        href: "/admin/courses",
        color: "text-pink-700",
    },
    {
        label: "Orders",
        icon: ShoppingCart,
        href: "/admin/orders",
        color: "text-orange-700",
    },
    {
        label: "Sales",
        icon: TrendingUp,
        href: "/admin/sales",
        color: "text-emerald-500",
    },
    {
        label: "Profile",
        icon: Users, // Using Users icon as a placeholder since User icon might not be imported or conflict. Or use Settings icon and change Settings page icon to something else like ToggleRight
        href: "/admin/profile",
        color: "text-slate-500",
    },
    {
        label: "System Settings",
        icon: Settings,
        href: "/admin/settings",
        color: "text-gray-500",
    },
];

export const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-white text-slate-900 border-r border-slate-200 shadow-sm relative z-20">
            <div className="px-3 py-2 flex-1">
                <Link href="/admin/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                            {process.env.NEXT_PUBLIC_APP_NAME?.[0] || 'A'}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        {process.env.NEXT_PUBLIC_APP_NAME || 'Admin'}
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
                <Link
                    href="/dashboard"
                    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition text-slate-500"
                >
                    <div className="flex items-center flex-1">
                        <LogOut className="h-5 w-5 mr-3 text-slate-500" />
                        Exit Admin
                    </div>
                </Link>
            </div>
        </div>
    );
};
