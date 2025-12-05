'use client';

import { resetPassword } from '@/actions/password-reset';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { GlassCard } from '@/components/auth/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';

function ResetPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    if (!token) {
        return (
            <AuthWrapper>
                <GlassCard>
                    <div className="text-center">
                        <p className="text-red-300 font-semibold mb-4 border border-red-500/50 bg-red-500/10 p-4 rounded-lg">
                            Invalid or missing token.
                        </p>
                        <Link href="/auth/signin" className="text-sm font-semibold text-white hover:underline">
                            Back to Sign In
                        </Link>
                    </div>
                </GlassCard>
            </AuthWrapper>
        );
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        formData.append('token', token!); // Append token from URL

        const result = await resetPassword(formData);

        setIsLoading(false);

        if (result.success) {
            toast.success(result.message);
            router.push('/auth/signin');
        } else {
            toast.error(result.message);
        }
    }

    return (
        <AuthWrapper>
            <GlassCard>
                <div className="flex flex-col space-y-2 text-center mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Reset Password</h1>
                    <p className="text-sm text-white/70">
                        Enter a new password for your account.
                    </p>
                </div>
                <div className="grid gap-6">
                    <form onSubmit={onSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-gray-200">New Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    placeholder="******"
                                    type="password"
                                    disabled={isLoading}
                                    required
                                    minLength={6}
                                    className="bg-white/80 border-0 focus-visible:bg-white text-slate-900 placeholder:text-slate-500"
                                />
                            </div>
                            <Button disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reset Password
                            </Button>
                        </div>
                    </form>
                </div>
            </GlassCard>
        </AuthWrapper>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
