# 📦 File Storage with MinIO (S3-Compatible)

Self-hosted object storage using MinIO with complete S3 API compatibility for file uploads, downloads, and management.

## Overview

MinIO provides S3-compatible object storage that you can self-host. No vendor lock-in, no cloud costs, complete control.

## Features

✅ S3-compatible API  
✅ Self-hosted (runs in Docker)  
✅ File upload/download  
✅ Bucket management  
✅ Presigned URLs  
✅ Access policies  
✅ Web console UI  
✅ No cloud costs  

## Configuration

### Environment Variables

```env
# MinIO Server (Docker)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin_secure_password

# MinIO Client (Application)
S3_ENDPOINT=kubernetes.docker.internal  # or localhost
S3_PORT=9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin_secure_password
S3_USE_SSL=false
NEXT_PUBLIC_S3_BUCKET_NAME=your-app-name
```

### Docker Setup

MinIO runs automatically when you start Docker:

```bash
bun run docker:up
```

Access:
- **API**: http://localhost:9000
- **Console**: http://localhost:9001

## Initial Setup

### 1. Access MinIO Console

1. Open http://localhost:9001
2. Login with `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`

### 2. Create Bucket

1. Click "Buckets" → "Create Bucket"
2. Name: Use value from `NEXT_PUBLIC_S3_BUCKET_NAME`
3. Click "Create Bucket"

### 3. Set Bucket Policy (Optional)

For public file access:

1. Select your bucket
2. Go to "Access" → "Access Policy"
3. Select "Public" or configure custom policy

## S3 Client

### Client Setup (`src/lib/file-management/s3-file-client.ts`)

```typescript
import { Client } from 'minio';
import { env } from '@/lib/utils/env';

export const s3Client = new Client({
  endPoint: env.S3_ENDPOINT,
  port: parseInt(env.S3_PORT),
  useSSL: env.S3_USE_SSL === 'true',
  accessKey: env.S3_ACCESS_KEY,
  secretKey: env.S3_SECRET_KEY,
});

// Ensure bucket exists
export async function ensureBucket(bucketName: string) {
  const exists = await s3Client.bucketExists(bucketName);
  if (!exists) {
    await s3Client.makeBucket(bucketName, 'us-east-1');
  }
}
```

## Usage Examples

### Upload File

```typescript
import { s3Client } from '@/lib/file-management/s3-file-client';
import { env } from '@/lib/utils/env';
import fs from 'fs';

async function uploadFile(filePath: string, objectName: string) {
  const fileStream = fs.createReadStream(filePath);
  const fileSize = fs.statSync(filePath).size;

  await s3Client.putObject(
    env.NEXT_PUBLIC_S3_BUCKET_NAME,
    objectName,
    fileStream,
    fileSize,
    {
      'Content-Type': 'application/octet-stream',
    }
  );

  return objectName;
}
```

### Upload from Buffer

```typescript
async function uploadBuffer(buffer: Buffer, objectName: string, contentType: string) {
  await s3Client.putObject(
    env.NEXT_PUBLIC_S3_BUCKET_NAME,
    objectName,
    buffer,
    buffer.length,
    {
      'Content-Type': contentType,
    }
  );
}
```

### Download File

```typescript
async function downloadFile(objectName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    s3Client.getObject(env.NEXT_PUBLIC_S3_BUCKET_NAME, objectName, (err, stream) => {
      if (err) return reject(err);
      
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  });
}
```

### Get Presigned URL

```typescript
// Presigned GET URL (for downloads)
async function getDownloadUrl(objectName: string, expirySeconds = 3600) {
  return await s3Client.presignedGetObject(
    env.NEXT_PUBLIC_S3_BUCKET_NAME,
    objectName,
    expirySeconds
  );
}

// Presigned PUT URL (for direct uploads)
async function getUploadUrl(objectName: string, expirySeconds = 3600) {
  return await s3Client.presignedPutObject(
    env.NEXT_PUBLIC_S3_BUCKET_NAME,
    objectName,
    expirySeconds
  );
}
```

### Delete File

```typescript
async function deleteFile(objectName: string) {
  await s3Client.removeObject(
    env.NEXT_PUBLIC_S3_BUCKET_NAME,
    objectName
  );
}
```

### List Files

```typescript
async function listFiles(prefix?: string) {
  const objects: any[] = [];
  
  const stream = s3Client.listObjects(
    env.NEXT_PUBLIC_S3_BUCKET_NAME,
    prefix,
    true  // recursive
  );

  for await (const obj of stream) {
    objects.push(obj);
  }

  return objects;
}
```

### Get File Metadata

```typescript
async function getFileMetadata(objectName: string) {
  return await s3Client.statObject(
    env.NEXT_PUBLIC_S3_BUCKET_NAME,
    objectName
  );
}
```

## File Upload UI Component

Located in `src/components/file-upload/`:

### Upload Form

```typescript
'use client';

import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';

export function FileUploadForm() {
  const uploadMutation = orpc.files.upload.useMutation({
    onSuccess: () => {
      toast.success('File uploaded successfully');
    },
  });

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    await uploadMutation.mutateAsync({ file });
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
    </div>
  );
}
```

## oRPC File Procedures

Located in `src/o-rpc/files.ts`:

```typescript
import { publicProcedure } from './base';
import { z } from 'zod';
import { s3Client } from '@/lib/file-management/s3-file-client';

export const filesRouter = {
  upload: publicProcedure
    .input(z.object({
      file: z.instanceof(File),
    }))
    .handler(async ({ input }) => {
      // Upload logic
      const objectName = `uploads/${Date.now()}-${input.file.name}`;
      // ... upload to MinIO
      return { success: true, objectName };
    }),

  getUrl: publicProcedure
    .input(z.object({
      objectName: z.string(),
    }))
    .handler(async ({ input }) => {
      const url = await s3Client.presignedGetObject(
        env.NEXT_PUBLIC_S3_BUCKET_NAME,
        input.objectName,
        3600
      );
      return { url };
    }),
};
```

## Best Practices

### 1. Organize Files with Prefixes

```typescript
const objectName = `uploads/${userId}/${Date.now()}-${filename}`;
```

### 2. Validate File Types

```typescript
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}
```

### 3. Limit File Sizes

```typescript
const maxSize = 10 * 1024 * 1024; // 10MB

if (file.size > maxSize) {
  throw new Error('File too large');
}
```

### 4. Use Content-Type

```typescript
await s3Client.putObject(bucket, objectName, buffer, size, {
  'Content-Type': file.type,
  'x-amz-meta-original-name': file.name,
  'x-amz-meta-uploaded-by': userId,
});
```

### 5. Clean Up Old Files

```typescript
async function deleteOldFiles(daysOld = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);

  const objects = await listFiles();
  
  for (const obj of objects) {
    if (obj.lastModified < cutoff) {
      await deleteFile(obj.name);
    }
  }
}
```

## Bucket Policies

### Public Read Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::your-bucket/*"]
    }
  ]
}
```

### Private Policy (Default)

No public access. Files accessible only via presigned URLs.

## Production Deployment

### Using External MinIO

Update `.env`:

```env
S3_ENDPOINT=minio.your-domain.com
S3_PORT=443
S3_USE_SSL=true
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
```

### Using AWS S3

MinIO client is S3-compatible:

```env
S3_ENDPOINT=s3.amazonaws.com
S3_PORT=443
S3_USE_SSL=true
S3_ACCESS_KEY=your_aws_access_key
S3_SECRET_KEY=your_aws_secret_key
NEXT_PUBLIC_S3_BUCKET_NAME=your-s3-bucket
```

## Troubleshooting

### Connection Refused

- Check MinIO is running: `docker compose ps`
- Verify endpoint: `kubernetes.docker.internal` or `localhost`
- Check firewall settings

### Access Denied

- Verify credentials match between MinIO and `.env`
- Check bucket exists
- Verify bucket policy

### Slow Uploads

- Use chunked uploads for large files
- Consider using presigned URLs for direct client uploads
- Check network bandwidth

## Resources

- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [MinIO Client SDK](https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html)
- [S3 API Reference](https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html)

---

[← Back to Main README](../README.md)
