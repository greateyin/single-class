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

                    <div className="flex items-center gap-2 mb-4 text-sm">
                        <span className="bg-[#eceb98] text-[#3d3c0a] px-2 py-0.5 font-bold text-xs rounded-sm">
                            Bestseller
                        </span>
                        <div className="flex items-center gap-1 text-[#f69c08]">
                            <span className="font-bold">4.8</span>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                        </div>
                        <span className="text-[#c0c4fc] underline">(1,234 ratings)</span>
                        <span className="text-white">10,567 students</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-white mb-6">
                        <div className="flex items-center gap-1">
                            <span className="text-white">Created by</span>
                            <a href="#" className="text-[#c0c4fc] underline">Single Class Admin</a>
                        </div>
                        <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>Last updated {new Date().toLocaleDateString()}</span>
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
