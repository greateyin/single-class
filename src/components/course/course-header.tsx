import Link from 'next/link';
import { Star, AlertCircle, Globe } from 'lucide-react';


interface CourseHeaderProps {
    course: {
        id: string;
        title: string;
        subtitle: string | null;
        description: string | null;
        language: string | null;
        updatedAt?: Date | null;
        authorName?: string | null;
        // Add other necessary fields
    };
    progress: number;
}

export function CourseHeader({ course }: CourseHeaderProps) {
    return (
        <div className="bg-[#1c1d1f] text-white py-12">
            <div className="max-w-7xl mx-auto px-8 relative">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[#cea4f1] text-sm font-bold mb-4">
                    <Link href="/dashboard" className="hover:underline">Home</Link>
                    <span>{'>'}</span>
                    <Link href="/courses" className="hover:underline">Courses</Link>
                    <span>{'>'}</span>
                    <span className="text-white truncate max-w-[300px]">{course.title}</span>
                </div>

                <div className="max-w-[800px]">
                    <h1 className="text-4xl font-bold mb-4 leading-tight">
                        {course.title}
                    </h1>
                    {course.subtitle && (
                        <p className="text-xl mb-6 leading-relaxed">
                            {course.subtitle}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-white mb-6">
                        <div className="flex items-center gap-1">
                            <span className="text-white">Created by</span>
                            <span className="text-[#c0c4fc]">{course.authorName || 'Single Class Platform'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>Last updated {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <span>{course.language || 'English'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
