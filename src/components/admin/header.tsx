"use client";

import { Bell, Search, Settings, LogOut, User, Menu, LayoutDashboard, Users, BookOpen, ShoppingCart, TrendingUp } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
    );
};
