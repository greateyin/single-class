'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { resetUserPassword } from '@/actions/admin-users';
import { toast } from 'sonner';

interface PasswordResetFormProps {
    userId: string;
}

export function PasswordResetForm({ userId }: PasswordResetFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            await resetUserPassword(userId, formData);
            toast.success('Password updated successfully');
            // Optional: reset form
            const form = document.getElementById('password-reset-form') as HTMLFormElement;
            form?.reset();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update password');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reset Password</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="password-reset-form" action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Password</label>
                        <Input
                            type="password"
                            name="password"
                            placeholder="Enter new password"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Confirm Password</label>
                        <Input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm new password"
                            required
                            minLength={6}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
