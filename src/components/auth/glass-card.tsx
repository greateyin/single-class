
import React from 'react';
import { cn } from "@/lib/utils";

export const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 relative", className)}>
        {children}
    </div>
  );
};
