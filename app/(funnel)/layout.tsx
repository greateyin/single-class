import React from 'react';

export default function FunnelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full">
            <main className="w-full">
                {children}
            </main>
        </div>
    );
}
