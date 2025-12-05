'use client';

import { requestPasswordReset } from '@/actions/password-reset';
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
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email address to reset your password.
                    </p>
                </div>
                <div className="grid gap-6">
                    {successMessage ? (
                        <div className="text-center text-sm text-muted-foreground bg-green-50 p-4 rounded-md border border-green-200">
                            {successMessage}
                        </div>
                    ) : (
                        <form onSubmit={onSubmit}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
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
                                    />
                                </div>
                                <Button disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Reset Link
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
                <p className="px-8 text-center text-sm text-muted-foreground">
                    <Link href="/auth/signin" className="hover:text-brand underline underline-offset-4">
                        Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
