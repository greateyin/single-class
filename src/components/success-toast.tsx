"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface SuccessToastProps {
    message?: string;
}

export function SuccessToast({ message = "Changes saved successfully" }: SuccessToastProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (searchParams.get("updated") === "true") {
            toast.success(message);

            // Clean up the URL
            const params = new URLSearchParams(searchParams.toString());
            params.delete("updated");
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [searchParams, router, pathname, message]);

    return null;
}
