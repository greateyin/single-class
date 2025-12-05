"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const UserHeader = () => {
    return (
        <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
            <div className="flex items-center gap-4 w-96">
                {/* Search can be optional for users, but good for course search */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search courses..."
                        className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-indigo-600 hover:bg-indigo-50">
                    <Bell className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-slate-900">Student</p>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarImage src="" /> {/* We can pass user image if needed later */}
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>
    );
};
