import { enforceAuthentication } from '@/lib/auth-guards';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ProfileForm } from './_components/profile-form';

export default async function ProfilePage() {
    const session = await enforceAuthentication();
    const userId = session.user.id;

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user) {
        // Should not happen if authenticated, but good to handle
        return <div>User not found</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profile Settings</h1>
                <p className="text-slate-500 mt-2">Manage your account information and preferences.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <ProfileForm user={user} />
            </div>
        </div>
    );
}
