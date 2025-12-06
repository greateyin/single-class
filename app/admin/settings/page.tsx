import { auth } from "@/lib/auth";
import { SettingsForm } from "./settings-form";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your admin preferences.</p>
            </div>

            <SettingsForm user={session.user} />
        </div>
    );
}
