'use client';

import { verifyEmail } from '@/actions/verification';
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
        <div className="flex h-full flex-col items-center justify-center space-y-4">
            <h1 className="text-2xl font-semibold">Confirming your verification</h1>
            {!success && !error && (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            )}
            {success && (
                <div className="p-3 rounded-md bg-emerald-500/15 text-emerald-500 text-sm">
                    {success}
                </div>
            )}
            {error && (
                <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                    {error}
                </div>
            )}
            <Link href="/auth/signin" className="text-sm underline hover:text-primary">
                Back to login
            </Link>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <VerifyEmailForm />
            </Suspense>
        </div>
    );
}
