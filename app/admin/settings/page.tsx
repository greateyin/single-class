import { enforceAdminRole } from "@/lib/auth-guards";
import { getSystemSettings } from "@/actions/admin-settings";
import { SystemSettingsForm } from "./system-settings-form";

export default async function AdminSettingsPage() {
    await enforceAdminRole();
    const settings = await getSystemSettings();

    if (!settings) return null; // Should be handled by ensure in getSystemSettings but safe check

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-muted-foreground">Manage global application configuration.</p>
            </div>

            <SystemSettingsForm
                settings={{
                    stripeEnabled: settings.stripeEnabled,
                    paypalEnabled: settings.paypalEnabled
                }}
            />
        </div>
    );
}
