import React from 'react';

export default function FunnelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4">
            <main className="w-full max-w-2xl">
                {children}
            </main>
            <footer className="mt-8 text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} Single Class Platform. Secure Payment.
            </footer>
        </div>
    );
}
