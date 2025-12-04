"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, LogOut, BookOpen, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileHeader() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden bg-[var(--brand-navy)] text-white border-b border-blue-900">
            <div className="flex items-center justify-between p-4">
                <h1 className="text-xl font-bold tracking-tight text-[var(--brand-gold)]">Admin</h1>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-white hover:bg-blue-800 hover:text-white">
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="absolute top-[60px] left-0 right-0 bg-[var(--brand-navy)] border-b border-blue-900 z-50 shadow-xl">
                    <nav className="flex flex-col p-4 space-y-2">
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-2 px-4 py-3 rounded hover:bg-blue-800 transition-colors text-blue-100 hover:text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            <LayoutDashboard className="h-5 w-5" />
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-2 px-4 py-3 rounded hover:bg-blue-800 transition-colors text-blue-100 hover:text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            <Users className="h-5 w-5" />
                            Users
                        </Link>
                        <Link
                            href="/admin/courses"
                            className="flex items-center gap-2 px-4 py-3 rounded hover:bg-blue-800 transition-colors text-blue-100 hover:text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            <BookOpen className="h-5 w-5" />
                            Courses
                        </Link>

                        <div className="border-t border-blue-800 my-2 pt-2">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-4 py-3 rounded hover:bg-blue-800 transition-colors text-blue-300 hover:text-white"
                                onClick={() => setIsOpen(false)}
                            >
                                <LogOut className="h-5 w-5" />
                                Exit to App
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </div>
    );
}
