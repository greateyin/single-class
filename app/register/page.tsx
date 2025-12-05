'use client';

import { registerUser } from '@/actions/register';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { GlassCard } from '@/components/auth/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const result = await registerUser(formData);

        setIsLoading(false);

        if (result.success) {
            toast.success('Account created! Please check your email to verify.');
            // Route to sign in but maybe show a success state or keep them here? 
            // Standard flow: redirect to login or check email page. 
            router.push('/auth/signin');
        } else {
            toast.error(result.message);
        }
    }

    return (
        <AuthWrapper>
            <GlassCard>
                <div className="flex flex-col space-y-2 text-center mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Create an account</h1>
                    <p className="text-sm text-white/70">
                        Enter your email below to create your account
                    </p>
                </div>
                <div className="grid gap-6">
                    <form onSubmit={onSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-gray-200">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    type="text"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    disabled={isLoading}
                                    required
                                    className="bg-white/80 border-0 focus-visible:bg-white text-slate-900 placeholder:text-slate-500"
                                />
                            </div>
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
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-gray-200">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    placeholder="******"
                                    type="password"
                                    autoComplete="new-password"
                                    disabled={isLoading}
                                    required
                                    minLength={6}
                                    className="bg-white/80 border-0 focus-visible:bg-white text-slate-900 placeholder:text-slate-500"
                                />
                            </div>
                            <Button disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign Up
                            </Button>
                        </div>
                    </form>
                </div>
                <div className="mt-6 text-center text-sm">
                    <span className="text-white/70">Already have an account? </span>
                    <Link href="/auth/signin" className="font-semibold text-white hover:underline">
                        Sign In
                    </Link>
                </div>
            </GlassCard>
        </AuthWrapper>
    );
}
