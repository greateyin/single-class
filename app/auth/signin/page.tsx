'use client';

import { resendVerificationEmail } from '@/actions/verification';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { GlassCard } from '@/components/auth/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';

function SignInForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const result = await signIn('credentials', {
                email: email.toLowerCase(),
                password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                if (result.error === 'Configuration') {
                    // In NextAuth.js v5, 'Configuration' often wraps specific errors.
                    // We'll attempt to resend the verification email to check if it's an unverified email scenario.
                    const resendResult = await resendVerificationEmail(email.toLowerCase());
                    if (resendResult.success) {
                        toast.warning('Please verify your email address before logging in.');
                    } else {
                        // If resend failed, it might be a genuine 'Configuration' error not related to verification,
                        // or the email was already verified but credentials were wrong.
                        if (resendResult.message === 'Email already verified!') {
                            toast.error('Invalid credentials'); // Wrong password but verified email
                        } else if (resendResult.message.startsWith('Failed to send')) {
                            // Show specific Resend error if possible, or generic
                            toast.error(resendResult.message);
                        } else {
                            toast.error('Invalid credentials or unverified email');
                        }
                    }
                } else {
                    // For other errors, we can still try to resend as a fallback
                    const resendResult = await resendVerificationEmail(email.toLowerCase());
                    if (resendResult.success) {
                        toast.warning('Please verify your email address before logging in.');
                    } else if (resendResult.message.startsWith('Failed to send')) {
                        toast.error(resendResult.message);
                    } else {
                        toast.error('Invalid credentials or unverified email');
                    }
                }
            } else {
                toast.success('Signed in successfully');
                window.location.href = callbackUrl;
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    async function googleSignIn() {
        setIsGoogleLoading(true);
        try {
            await signIn('google', { callbackUrl });
        } catch (error) {
            toast.error('Something went wrong with Google Sign In');
        } finally {
            setIsGoogleLoading(false);
        }
    }

    return (
        <AuthWrapper>
            <GlassCard>
                <div className="flex flex-col space-y-2 text-center mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Login</h1>
                    <p className="text-sm text-white/70">
                        Enter your email to sign in to your account
                    </p>
                </div>
                <div className="grid gap-6">
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
                                    disabled={isLoading || isGoogleLoading}
                                    required
                                    className="bg-white/80 border-0 focus-visible:bg-white text-slate-900 placeholder:text-slate-500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-gray-200">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    placeholder="******"
                                    type="password"
                                    autoComplete="current-password"
                                    disabled={isLoading || isGoogleLoading}
                                    minLength={6}
                                    className="bg-white/80 border-0 focus-visible:bg-white text-slate-900 placeholder:text-slate-500"
                                />
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-xs text-white/70 hover:text-white underline underline-offset-4 text-right"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <Button disabled={isLoading || isGoogleLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign in
                            </Button>
                        </div>
                    </form>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-transparent px-2 text-white/70">
                                or continue with
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        type="button"
                        disabled={isLoading || isGoogleLoading}
                        onClick={googleSignIn}
                        className="bg-white border-0 hover:bg-white/90 text-slate-900"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        )}
                        Google
                    </Button>
                </div>
                <div className="mt-6 text-center text-sm">
                    <span className="text-white/70">Don&apos;t have an account yet? </span>
                    <Link href="/register" className="font-semibold text-white hover:underline">
                        Register for free
                    </Link>
                </div>
            </GlassCard>
        </AuthWrapper>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInForm />
        </Suspense>
    );
}
