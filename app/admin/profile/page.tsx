import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

export default async function AdminProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login"); // Should be handled by middleware, but safe fallback
    }

    const { user } = session;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Your account details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                            <AvatarFallback className="text-lg">{user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-lg">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" defaultValue={user.name || ""} readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue={user.email || ""} readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" defaultValue={user.role || "student"} readOnly className="capitalize" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="id">User ID</Label>
                            <Input id="id" defaultValue={user.id || ""} readOnly className="font-mono text-xs" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
