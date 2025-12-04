'use client';

import { FileUpload } from '@/components/admin/file-upload';
import { saveAttachmentMetadata } from '@/actions/admin-content';

interface LessonAttachmentUploadProps {
    lessonId: string;
}

export function LessonAttachmentUpload({ lessonId }: LessonAttachmentUploadProps) {
    const handleUploadComplete = async (url: string, fileName: string) => {
        await saveAttachmentMetadata(lessonId, fileName, url);
    };

    return (
        <FileUpload
            onUploadComplete={handleUploadComplete}
            label="Upload Attachment"
        />
    );
}
