'use client';

import { updateProfile } from '@/actions/user-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProfileFormProps {
    user: {
        name: string | null;
        email: string;
        image: string | null;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);

        try {
            const result = await updateProfile(formData);
            if (result.success) {
                toast.success(result.message);
                // Reset password field
                const form = event.target as HTMLFormElement;
                const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
                if (passwordInput) passwordInput.value = '';
            } else {
                toast.error(result.message);
                if (result.errors) {
                    // Could display field specific errors here if needed
                    console.error(result.errors);
                }
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
                {user.image ? (
                    <img
                        src={user.image}
                        alt="Profile"
                        className="h-16 w-16 rounded-full border object-cover"
                    />
                ) : (
                    <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-2xl">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                )}
                <div>
                    <p className="text-sm font-medium">Profile Photo</p>
                    <p className="text-xs text-muted-foreground">Managed by your login provider (Google/Gravatar)</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-slate-100"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={user.name || ''}
                    required
                    minLength={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">New Password (Optional)</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Leave blank to keep current password"
                    minLength={6}
                />
            </div>

            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    );
}
