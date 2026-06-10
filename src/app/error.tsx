"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-gray-500 text-sm max-w-md">{error.message}</p>
            <Button onClick={reset}>Try again</Button>
        </div>
    );
}
