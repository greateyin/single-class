import { getUsers, updateUserRole } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">User Management</h1>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="p-4 font-medium">{user.name || 'N/A'}</td>
                                        <td className="p-4 text-slate-400">{user.email}</td>
                                        <td className="p-4">
                                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <form action={updateUserRole.bind(null, user.id, user.role === 'admin' ? 'student' : 'admin')}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className={user.role === 'admin' ? "text-red-400 hover:text-red-300" : "text-blue-400 hover:text-blue-300"}
                                                >
                                                    {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
