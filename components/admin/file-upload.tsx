'use client';

import { upload } from '@vercel/blob/client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FileUploadProps {
    onUploadComplete: (url: string, fileName: string) => Promise<void>;
    accept?: string;
    label?: string;
    className?: string;
}

export function FileUpload({ onUploadComplete, accept, label = "Upload", className }: FileUploadProps) {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!inputFileRef.current?.files?.length) {
            toast({
                title: "Error",
                description: "Please select a file first",
                variant: "destructive",
            });
            return;
        }

        const file = inputFileRef.current.files[0];
        setIsUploading(true);

        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            });

            await onUploadComplete(newBlob.url, file.name);

            toast({
                title: "Success",
                description: "File uploaded successfully",
            });

            // Reset form
            if (inputFileRef.current) {
                inputFileRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast({
                title: "Error",
                description: "Upload failed. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={`flex gap-2 items-center ${className}`}>
            <Input
                ref={inputFileRef}
                type="file"
                name="file"
                accept={accept}
                required
                disabled={isUploading}
                className="text-sm"
            />
            <Button type="submit" size="sm" disabled={isUploading}>
                {isUploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        {label}
                    </>
                )}
            </Button>
        </form>
    );
}
