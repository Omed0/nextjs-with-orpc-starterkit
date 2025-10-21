"use client"

import { useState, useRef } from 'react'
import { Loader, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { File } from '@/prisma/generated/client'
import {
    downloadFile, formatBytes,
    getPresignedUrls, handleUpload,
    type ShortFileProp
} from '@/lib/file-management/s3-file-helper'
import { MAX_FILE_SIZE_S3_ENDPOINT } from '@/lib/file-management/constant'
import {
    useMutation, useQuery,
    type QueryObserverResult, type RefetchOptions
} from '@tanstack/react-query'
import { orpc } from '@/lib/orpc'
import { Button } from '@/components/ui/button'

type onUploadSuccess = {
    onUploadSuccess: () => void
}

export default function UploadFiles() {
    const { data, refetch, isLoading } = useQuery(orpc.files.getFiles.queryOptions({}))


    return (
        <main className='flex flex-col min-h-screen items-center justify-center gap-5'>
            <div className='container flex flex-col gap-5 px-3'>
                <UploadFilesS3PresignedUrl onUploadSuccess={() => refetch()} />
            </div>
            {isLoading ? (
                <div className='flex h-80 flex-col items-center justify-center '>
                    <Loader className='size-8 animate-spin' />
                </div>
            ) : (
                <FilesContainer
                    files={data || []}
                    fetchFiles={refetch}
                />
            )}
        </main>
    )
}

type FilesListProps = {
    files: File[]
    fetchFiles: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>
}

export function FilesContainer({ files, fetchFiles }: FilesListProps) {
    if (files.length === 0) {
        return (
            <div className='flex h-96 flex-col items-center justify-center '>
                <p className='text-xl'>No files uploaded yet</p>
            </div>
        )
    }

    return (
        <div className='h-96'>
            <h1 className='text-xl '>
                Last {files.length} uploaded file{files.length > 1 ? 's' : ''}
            </h1>
            <ul className='h-80 overflow-auto'>
                {files.map((file) => (
                    <FileItem
                        key={file.id}
                        file={file}
                        fetchFiles={fetchFiles}
                    />
                ))}
            </ul>
        </div>
    )
}

type FileItemProps = {
    file: File
    fetchFiles: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>
}

export function FileItem({ file, fetchFiles }: FileItemProps) {
    const deleteFile = useMutation(orpc.files.deleteFile.mutationOptions({
        onSuccess: () => {
            fetchFiles()
            toast.success('File deleted successfully')
        }
    }))


    return (
        <li className='relative flex items-center justify-between gap-2 border-b py-2 text-sm'>
            <button
                className='truncate text-blue-500 hover:text-blue-600 hover:underline'
                onClick={() => downloadFile(file)}
            >
                {file.originalName}
            </button>

            <div className=' flex items-center gap-2'>
                <span className='w-32 '>{formatBytes(file.size)}</span>

                <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteFile.mutate(file)}
                    disabled={!deleteFile.isIdle}
                >
                    <Trash2 className='size-4' />
                </Button>
            </div>

            {!deleteFile.isIdle && (
                <div className='absolute inset-0 flex items-center justify-center rounded-md bg-secondary bg-opacity-20'>
                    <Loader className='size-8 animate-spin' />
                </div>
            )}
        </li>
    )
}

export function UploadFilesS3PresignedUrl({ onUploadSuccess }: onUploadSuccess) {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const uploadToServer = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        try {
            // get File[] from FileList
            const files = Object.values(fileInputRef.current?.files || [])
            // validate files
            const filesInfo: ShortFileProp[] = files.map((file) => ({
                originalName: file.name,
                size: file.size,
            }))

            const presignedUrls = await getPresignedUrls(filesInfo)

            // upload files to s3 endpoint directly and save file info to db
            await handleUpload(files, presignedUrls)
            onUploadSuccess()
        } catch (error) {
            console.error(error)
            toast.error((error as Error).message || 'Error uploading files')
            setIsLoading(false)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <UploadFilesFormUI
            isLoading={isLoading}
            fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
            uploadToServer={uploadToServer}
            maxFileSize={MAX_FILE_SIZE_S3_ENDPOINT}
        />
    )
}

type UploadFilesFormUIProps = {
    isLoading: boolean
    fileInputRef: React.RefObject<HTMLInputElement> | null
    uploadToServer: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
    maxFileSize: number
}

export function UploadFilesFormUI({ isLoading, fileInputRef, uploadToServer, maxFileSize }: UploadFilesFormUIProps) {
    return (
        <form className='flex flex-col items-center justify-center gap-3' onSubmit={uploadToServer}>
            <h1 className='text-2xl'>File upload example using Next.js, MinIO S3, Prisma and PostgreSQL</h1>
            <div className='flex gap-5'>
                <input
                    id='file'
                    type='file'
                    multiple
                    className='rounded-md border p-2'
                    required
                    ref={fileInputRef}
                    disabled={isLoading}
                    title={`Maximum file size is ${formatBytes(maxFileSize)}`}
                />
                <Button
                    type='submit'
                    size="lg"
                    disabled={isLoading}
                    className="disabled:cursor-not-allowed disabled:bg-secondary/10 h-auto"
                >
                    Upload
                </Button>
            </div>
        </form>
    )
}