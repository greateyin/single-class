"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function LessonSuccessToast() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (searchParams.get("updated") === "true") {
            toast.success("Lesson updated successfully");

            // Clean up the URL
            const params = new URLSearchParams(searchParams.toString());
            params.delete("updated");
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [searchParams, router, pathname]);

    return null;
}
