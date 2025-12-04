import { db } from "@/db";
import { desc } from "drizzle-orm";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Eye } from "lucide-react";

export default async function AdminUsersPage() {
    const allUsers = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
        with: {
            transactions: true
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                <p className="text-muted-foreground">
                    Manage registered users and view their activity.
                </p>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Total Spend</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allUsers.map((user) => {
                            const totalSpend = user.transactions
                                .filter(t => t.status === 'completed')
                                .reduce((acc, t) => acc + t.amountCents, 0);

                            return (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.name || 'No Name'}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {user.lastLoginAt
                                            ? format(user.lastLoginAt, 'MMM d, yyyy HH:mm')
                                            : <span className="text-muted-foreground">-</span>}
                                    </TableCell>
                                    <TableCell>
                                        {format(user.createdAt, 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${(totalSpend / 100).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View</span>
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
