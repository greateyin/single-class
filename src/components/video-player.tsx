'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReactPlayerProps } from 'react-player';

// Use dynamic import for ReactPlayer to avoid SSR issues and lazy load
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

interface VideoPlayerProps {
    url: string;
    title: string;
    onComplete: () => void;
}

export function VideoPlayer({ url, title, onComplete }: VideoPlayerProps) {
    const [isReady, setIsReady] = useState(false);

    return (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            {!isReady && (
                <Skeleton className="absolute inset-0 w-full h-full bg-slate-800" />
            )}
            {/* @ts-ignore -- ReactPlayer dynamic import typing can be finicky */}
            <ReactPlayer
                url={url}
                width="100%"
                height="100%"
                controls
                onReady={() => setIsReady(true)}
                onEnded={onComplete}
                config={{
                    vimeo: {
                        playerOptions: { responsive: true }
                    }
                }}
            />
        </div>
    );
}
