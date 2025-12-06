import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateEnrollmentExpiration } from "@/actions/admin-users";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PasswordResetForm } from "./password-reset-form";

export default async function AdminUserDetailsPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
            enrollments: {
                with: {
                    course: true
                }
            },
            transactions: true
        }
    });

    if (!user) {
        notFound();
    }

    const totalSpend = user.transactions
        .filter(t => t.status === 'completed')
        .reduce((acc, t) => acc + t.amountCents, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/users">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Users
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{user.name || 'User Details'}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Total Spend</div>
                            <div className="text-2xl font-bold">${(totalSpend / 100).toFixed(2)}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Last Login</div>
                            <div className="text-lg">
                                {user.lastLoginAt ? format(user.lastLoginAt, 'PP pp') : '-'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Joined</div>
                            <div className="text-lg">{format(user.createdAt, 'PP')}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Role</div>
                            <div className="capitalize">{user.role}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Enrolled Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.enrollments.length === 0 ? (
                            <p className="text-muted-foreground">No enrollments found.</p>
                        ) : (
                            <div className="space-y-6">
                                {user.enrollments.map((enrollment) => (
                                    <div key={enrollment.id} className="flex items-start justify-between p-4 border rounded-lg bg-slate-50">
                                        <div className="space-y-1">
                                            <h4 className="font-semibold">{enrollment.course.title}</h4>
                                            <div className="text-sm text-muted-foreground">
                                                Enrolled: {format(enrollment.enrolledAt, 'PP')}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                First Access: {enrollment.firstAccessedAt ? format(enrollment.firstAccessedAt, 'PP') : 'Not yet accessed'}
                                            </div>
                                        </div>

                                        <div className="w-full max-w-xs">
                                            <form action={updateEnrollmentExpiration.bind(null, enrollment.id)} className="flex items-end gap-2">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-xs font-medium">Expires At</label>
                                                    <Input
                                                        type="date"
                                                        name="expiresAt"
                                                        defaultValue={enrollment.expiresAt ? new Date(enrollment.expiresAt).toISOString().split('T')[0] : ''}
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <Button type="submit" size="sm" variant="outline">Update</Button>
                                            </form>
                                            {enrollment.expiresAt && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Current: {format(enrollment.expiresAt, 'PP')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="md:col-span-1">
                    <PasswordResetForm userId={user.id} />
                </div>
            </div>
        </div>
    );
}
