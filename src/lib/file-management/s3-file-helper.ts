import { toast } from "sonner";
import type { File } from "@/prisma/generated/client";
import { sizes } from "./constant";
import { client } from "@/lib/orpc";

export type ShortFileProp = {
  originalName: string;
  size: number;
};

export type PresignedUrlProp = ShortFileProp & {
  url: string;
  fileNameInBucket: string;
};

export type FilesListProps = {
  files: File[];
  fetchFiles: () => Promise<void>;
  setFiles: (files: File[] | ((files: File[]) => File[])) => void;
};

export type UploadFilesFormUIProps = {
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  uploadToServer: (event: React.FormEvent<HTMLFormElement>) => void;
  maxFileSize: number;
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Gets presigned urls for uploading files to S3
 * @param formData form data with files to upload
 * @returns
 */
export const getPresignedUrls = async (files: ShortFileProp[]) => {
  const presignedUrls = await client.files.presignedUrl(files);

  return presignedUrls as PresignedUrlProp[];
};

/**
 * Uploads file to S3 directly using presigned url
 * @param presignedUrl presigned url for uploading
 * @param file  file to upload
 * @returns  response from S3
 */
export const uploadToS3 = async (
  presignedUrl: PresignedUrlProp,
  file: globalThis.File
) => {
  const response = await fetch(presignedUrl.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
      "Access-Control-Allow-Origin": "*",
    },
  });
  return response;
};

/**
 * Uploads files to S3 and saves file info in DB
 * @param files files to upload
 * @param presignedUrls  presigned urls for uploading
 * @param onUploadSuccess callback to execute after successful upload
 * @returns
 */
export const handleUpload = async (
  files: globalThis.File[],
  presignedUrls: PresignedUrlProp[]
) => {
  const uploadToS3Response = await Promise.all(
    presignedUrls.map((presignedUrl) => {
      const file = files.find(
        (file) =>
          file.name === presignedUrl.originalName &&
          file.size === presignedUrl.size
      );
      if (!file) {
        throw new Error("File not found");
      }
      return uploadToS3(presignedUrl, file);
    })
  );

  if (uploadToS3Response.some((res) => res.status !== 200)) {
    toast.error("Upload failed");
    return;
  }

  const savedFiles = await client.files.saveFileInfo(presignedUrls);
  return savedFiles;
};

export async function getPresignedUrl(file: File) {
  const urls = await client.files.getFileById({ id: file.id });
  return urls;
}

export const downloadFile = async (file: File) => {
  const presignedUrl = await getPresignedUrl(file);

  window.open(presignedUrl.presignedUrl, "_blank");
};
