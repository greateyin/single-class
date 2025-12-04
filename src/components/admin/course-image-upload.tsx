'use client';

import { FileUpload } from '@/components/admin/file-upload';
import { uploadCourseImage } from '@/actions/admin-courses';
import { useState } from 'react';

interface CourseImageUploadProps {
    courseId: string;
    currentImageUrl?: string | null;
}

export function CourseImageUpload({ courseId, currentImageUrl }: CourseImageUploadProps) {
    const [imageUrl, setImageUrl] = useState(currentImageUrl);

    const handleUploadComplete = async (url: string, fileName: string) => {
        await uploadCourseImage(courseId, url);
        setImageUrl(url);
    };

    return (
        <div className="space-y-4">
            <div className="w-full md:w-1/2 aspect-video bg-slate-100 rounded-md border flex items-center justify-center overflow-hidden relative group">
                {imageUrl ? (
                    <img src={imageUrl} alt="Course" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center text-slate-400">
                        <span className="text-sm">No image selected</span>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Upload Image File</label>
                <FileUpload
                    onUploadComplete={handleUploadComplete}
                    accept="image/*"
                    label="Upload Cover Image"
                />
            </div>
        </div>
    );
}
