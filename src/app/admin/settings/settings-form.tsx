"use client";

import { updateProfile } from "@/actions/user-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
}

interface FormData {
    name: string;
    password?: string;
    confirmPassword?: string;
}

export function SettingsForm({ user }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset
    } = useForm<FormData>({
        defaultValues: {
            name: user.name || "",
            password: "",
            confirmPassword: "",
        },
    });

    const password = watch("password");

    const onSubmit = (data: FormData) => {
        if (data.password && data.password !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        if (data.password) {
            formData.append("password", data.password);
        }

        startTransition(async () => {
            const result = await updateProfile(formData);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
                // Reset password fields only
                reset({
                    name: data.name,
                    password: "",
                    confirmPassword: "",
                });
            } else {
                toast.error(result.message);
                if (result.errors) {
                    // Start showing validation errors from server if any
                    // For brevity, we just toast the main message, but you could setError here
                }
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                        Update your profile information and security settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={user.email || ""}
                            disabled
                            className="bg-slate-50 text-slate-500"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Email address cannot be changed.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 chars" } })}
                            disabled={isPending}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-sm font-medium mb-4">Change Password</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Leave blank to keep current"
                                    {...register("password", { minLength: { value: 6, message: "Min 6 chars" } })}
                                    disabled={isPending}
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-500">{errors.password.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    {...register("confirmPassword", {
                                        validate: (val) => {
                                            if (!password) return true;
                                            return val === password || "Passwords do not match";
                                        }
                                    })}
                                    disabled={isPending}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
