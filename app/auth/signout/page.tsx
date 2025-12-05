'use client';

import { signOut } from 'next-auth/react';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { GlassCard } from '@/components/auth/glass-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignoutPage() {
    return (
        <AuthWrapper>
            <GlassCard className="flex flex-col items-center justify-center space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-semibold text-white">Sign Out</h1>
                    <p className="text-sm text-white/70">
                        Are you sure you want to sign out?
                    </p>
                </div>

                <div className="flex flex-col w-full gap-3">
                    <Button
                        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                    >
                        Yes, Sign Out
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className="w-full text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <Link href="/dashboard">
                            Cancel
                        </Link>
                    </Button>
                </div>
            </GlassCard>
        </AuthWrapper>
    );
}
