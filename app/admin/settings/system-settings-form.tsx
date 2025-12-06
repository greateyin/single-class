"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSystemSettings } from "@/actions/admin-settings";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SystemSettingsFormProps {
    settings: {
        stripeEnabled: boolean;
        paypalEnabled: boolean;
    };
}

export function SystemSettingsForm({ settings }: SystemSettingsFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [stripeEnabled, setStripeEnabled] = useState(settings.stripeEnabled);
    const [paypalEnabled, setPaypalEnabled] = useState(settings.paypalEnabled);

    const onSubmit = async () => {
        setIsLoading(true);
        try {
            await updateSystemSettings({ stripeEnabled, paypalEnabled });
            toast.success("System settings updated");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                    Enable or disable payment providers globally.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                        <Label className="text-base">Stripe</Label>
                        <p className="text-sm text-muted-foreground">Accept credit card payments via Stripe.</p>
                    </div>
                    <Switch
                        checked={stripeEnabled}
                        onCheckedChange={setStripeEnabled}
                        disabled={isLoading}
                    />
                </div>
                <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                        <Label className="text-base">PayPal</Label>
                        <p className="text-sm text-muted-foreground">Accept payments via PayPal.</p>
                    </div>
                    <Switch
                        checked={paypalEnabled}
                        onCheckedChange={setPaypalEnabled}
                        disabled={isLoading}
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <Button onClick={onSubmit} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
