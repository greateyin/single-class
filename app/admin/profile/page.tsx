import { auth } from "@/lib/auth";
import { ProfileForm } from "./profile-form";
import { redirect } from "next/navigation";

export default async function AdminProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Manage your personal account settings.</p>
            </div>

            <ProfileForm user={session.user} />
        </div>
    );
}
