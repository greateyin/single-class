'use client';

import { requestPasswordReset } from '@/actions/password-reset';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { GlassCard } from '@/components/auth/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const result = await requestPasswordReset(formData);

        setIsLoading(false);

        if (result.success) {
            setSuccessMessage(result.message);
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    }

    return (
        <AuthWrapper>
            <GlassCard>
                <div className="flex flex-col space-y-2 text-center mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Forgot Password</h1>
                    <p className="text-sm text-white/70">
                        Enter your email address to reset your password.
                    </p>
                </div>
                <div className="grid gap-6">
                    {successMessage ? (
                        <div className="text-center text-sm text-emerald-800 bg-emerald-50/90 p-4 rounded-md border border-emerald-200 shadow-sm backdrop-blur-sm">
                            {successMessage}
                        </div>
                    ) : (
                        <form onSubmit={onSubmit}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-gray-200">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        disabled={isLoading}
                                        required
                                        className="bg-white/80 border-0 focus-visible:bg-white text-slate-900 placeholder:text-slate-500"
                                    />
                                </div>
                                <Button disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Reset Link
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
                <div className="mt-6 text-center text-sm">
                    <Link href="/auth/signin" className="font-semibold text-white hover:underline">
                        Back to Sign In
                    </Link>
                </div>
            </GlassCard>
        </AuthWrapper>
    );
}
