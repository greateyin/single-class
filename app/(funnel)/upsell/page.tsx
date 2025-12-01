import { handleOneClickCharge, rejectUpsell } from '@/actions/payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function UpsellPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full shadow-xl border-blue-100">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-medium w-fit">
                        Wait! Your Order is Not Complete Yet
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-900">
                        Upgrade to the Advanced Module?
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Get access to 10+ advanced architectural patterns and direct mentorship.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                            <span className="text-slate-700">Advanced System Design Patterns</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                            <span className="text-slate-700">Weekly Group Mentorship Calls</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                            <span className="text-slate-700">Private Community Access</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <span className="text-4xl font-bold text-slate-900">$47</span>
                        <span className="text-slate-500 ml-2 line-through">$197</span>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <form action={handleOneClickCharge.bind(null, 'upsell')} className="w-full">
                        <Button size="lg" className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700">
                            Yes, Add to My Order (One-Click)
                        </Button>
                    </form>
                    <form action={rejectUpsell} className="w-full">
                        <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-700">
                            No thanks, I don't need advanced training
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
