'use client';

import { verifyEmail } from '@/actions/verification';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { GlassCard } from '@/components/auth/glass-card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

function VerifyEmailForm() {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const onSubmit = useCallback(() => {
        if (success || error) return;

        if (!token) {
            setError('Missing token!');
            return;
        }

        verifyEmail(token)
            .then((data) => {
                if (data.success) {
                    setSuccess(data.message);
                } else {
                    setError(data.message);
                }
            })
            .catch(() => {
                setError('Something went wrong!');
            });
    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <AuthWrapper>
            <GlassCard className="flex flex-col items-center justify-center space-y-6">
                <h1 className="text-2xl font-semibold text-white">Confirming Verification</h1>
                {!success && !error && (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-white/70" />
                        <p className="text-sm text-white/50">Verifying your email...</p>
                    </div>
                )}
                {success && (
                    <div className="w-full text-center p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 text-sm backdrop-blur-sm shadow-sm">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="w-full text-center p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-100 text-sm backdrop-blur-sm shadow-sm">
                        {error}
                    </div>
                )}
                <Link href="/auth/signin" className="text-sm font-semibold text-white hover:underline hover:text-white/90">
                    Back to login
                </Link>
            </GlassCard>
        </AuthWrapper>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <AuthWrapper>
                <GlassCard className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                </GlassCard>
            </AuthWrapper>
        }>
            <VerifyEmailForm />
        </Suspense>
    );
}
