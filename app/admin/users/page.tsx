import { getUsersList } from '@/actions/admin';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminUsersPage() {
    const users = await getUsersList();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Users</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Students</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'Paid' ? 'success' : 'outline'} className={user.status === 'Paid' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700 max-w-[100px]">
                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${user.progress}%` }}></div>
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-1 block">{user.progress}%</span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(user.joinedAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
