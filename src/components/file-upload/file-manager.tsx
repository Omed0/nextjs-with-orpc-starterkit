"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { orpc } from "@/lib/orpc"
import { UploadForm } from "./upload-form"
import { FileList } from "./file-list"

export function FileManager() {
    const { data, refetch, isLoading } = useQuery(
        orpc.files.getFiles.queryOptions({})
    )

    const handleUploadSuccess = () => {
        refetch()
    }

    const handleFileDeleted = () => {
        refetch()
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">File Manager</h1>
                    <p className="text-muted-foreground">
                        Upload and manage your files with MinIO S3 storage
                    </p>
                </div>

                <UploadForm onUploadSuccess={handleUploadSuccess} />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <FileList files={data || []} onFileDeleted={handleFileDeleted} />
                )}
            </div>
        </div>
    )
}
