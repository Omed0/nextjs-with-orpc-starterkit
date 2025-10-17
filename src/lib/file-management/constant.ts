import { env } from "@/lib/utils/env";

export const MAX_FILE_SIZE_S3_ENDPOINT = 20 * 1024 * 1024; // 20MB max file size to upload to s3 via presigned url
export const bucketName = env.NEXT_PUBLIC_S3_BUCKET_NAME;
export const LIMIT_FILES = 3; // max files to upload at once
export const expiry = 60 * 60; // 24 hours
export const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
