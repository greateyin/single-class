import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, Award, FileText, Smartphone, Infinity as InfinityIcon } from 'lucide-react';
import Image from 'next/image';

interface CourseSidebarProps {
    course: {
        id: string;
        title: string;
        priceCents: number;
        imageUrl?: string | null;
        videoEmbedUrl?: string | null;
    };
    progress: number;
}

export function CourseSidebar({ course, progress }: CourseSidebarProps) {
    return (
        <Card className="shadow-lg border-0 overflow-hidden sticky top-4">
            {/* Preview Section */}
            <div className="relative aspect-video bg-black group cursor-pointer">
                {course.imageUrl ? (
                    <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="text-slate-500 font-bold">No Preview</span>
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-4 shadow-xl transform group-hover:scale-110 transition-transform">
                        <PlayCircle className="h-8 w-8 text-black fill-current" />
                    </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-white font-bold text-sm drop-shadow-md">Preview this course</span>
                </div>
            </div>

            <CardContent className="p-6 space-y-6">

                {/* Progress Section (Since this is for enrolled students) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                        <span>Values</span>
                        <span>{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />

                    <Button className="w-full bg-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/90 h-10 text-base font-bold">
                        Continue Learning
                    </Button>
                </div>

                {/* Course Includes */}
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-800">This course includes:</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-3">
                            <PlayCircle className="h-4 w-4" />
                            <span>14 hours on-demand video</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <FileText className="h-4 w-4" />
                            <span>5 articles</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Smartphone className="h-4 w-4" />
                            <span>Access on mobile and TV</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <InfinityIcon className="h-4 w-4" />
                            <span>Full lifetime access</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Award className="h-4 w-4" />
                            <span>Certificate of completion</span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 font-bold">Share</Button>
                    <Button variant="outline" className="flex-1 font-bold">Gift this course</Button>
                </div>

            </CardContent>
        </Card>
    );
}
