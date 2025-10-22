'use client'
import type { Metadata } from "next"

// Error boundaries must be Client Components


export const metadata: Metadata = {
    title: 'Not Found',
    description: 'The page you are looking for does not exist.',
}


export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        // global-error must include html and body tags
        <html>
            <body style={{ padding: 20 }}>
                <h2>Something went wrong!</h2>
                <pre>{error?.message ?? "Unknown error"}</pre>
                <button onClick={() => reset()}>Try again</button>
            </body>
        </html>
    )
}