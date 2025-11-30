import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function EnrollPage() {
    const session = await auth();
    if (session?.user) {
        redirect('/core');
    }

    return (
        <Card className="w-full bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Master the Single Class</CardTitle>
                <CardDescription className="text-slate-400">
                    Join 10,000+ students learning the art of simplicity.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form
                    action={async () => {
                        'use server';
                        await signIn('google', { redirectTo: '/core' });
                    }}
                >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                        Continue with Google
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-2 text-slate-500">Or with Email</span>
                    </div>
                </div>

                <form
                    action={async (formData) => {
                        'use server';
                        await signIn('resend', formData);
                    }}
                    className="space-y-2"
                >
                    <input
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
                        required
                    />
                    <Button className="w-full" variant="outline" type="submit">
                        Send Magic Link
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
