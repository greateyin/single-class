import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IntendedLearnersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Intended Learners</h3>
                <p className="text-sm text-muted-foreground">
                    Define who this course is for.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500">
                        This feature is currently under development.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
