"use client";

import { Bell, Search, Settings, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { markAsRead, markAllAsRead } from "@/actions/notifications";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface AdminHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string;
    };
    notifications: {
        id: string;
        title: string;
        message: string;
        type: "info" | "warning" | "success" | "error";
        isRead: boolean;
        createdAt: Date;
        link: string | null;
    }[];
    unreadCount: number;
}

export const AdminHeader = ({ user, notifications, unreadCount }: AdminHeaderProps) => {
    const router = useRouter();

    const handleNotificationClick = async (id: string, link: string | null) => {
        await markAsRead(id);
        if (link) {
            router.push(link);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    return (
        <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Type to search..."
                        className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-indigo-600 hover:bg-indigo-50">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex justify-between items-center">
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                                <Button variant="ghost" className="text-xs h-auto p-0 text-indigo-600 hover:bg-transparent" onClick={handleMarkAllRead}>
                                    Mark all as read
                                </Button>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-500">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.isRead ? "bg-slate-50" : ""}`}
                                        onClick={() => handleNotificationClick(notification.id, notification.link)}
                                    >
                                        <div className="flex justify-between w-full">
                                            <span className="font-medium text-sm">{notification.title}</span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2">{notification.message}</p>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Link href="/admin/settings">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50">
                        <Settings className="h-5 w-5" />
                    </Button>
                </Link>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-slate-900">{user.name || "Admin User"}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role || "Admin"}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100 cursor-pointer">
                                <AvatarImage src={user.image || "https://github.com/shadcn.png"} />
                                <AvatarFallback>{user.name?.charAt(0) || "A"}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/admin/profile" className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/settings" className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => signOut()}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};
