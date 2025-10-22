import z, { nanoid } from "zod";
import {
  type PresignedUrlProp,
  type ShortFileProp,
} from "@/lib/file-management/s3-file-helper";
import {
  LIMIT_FILES,
  expiry,
  bucketName,
} from "@/lib/file-management/constant";
import {
  createPresignedUrlToDownload,
  createPresignedUrlToUpload,
  deleteFileFromBucket,
} from "@/lib/file-management/s3-file-client";
import { env } from "@/lib/utils/env";
import { ORPCError } from "@orpc/client";
import { protectedProcedure, publicProcedure } from "./base";

export const filesRoute = {
  getFiles: protectedProcedure.handler(async ({ context }) => {
    const files = await context.db.file.findMany({
      take: LIMIT_FILES,
      orderBy: {
        createdAt: "desc",
      },
    });
    return files;
  }),

  //  assign type from ShortFileProp to presignedUrl
  presignedUrl: publicProcedure
    .input(z.custom<ShortFileProp[]>())
    .handler(async ({ input }) => {
      if (!input.length) {
        throw new Error("No files to upload.");
      }
      if (input.length > LIMIT_FILES) {
        throw new Error(`You can upload up to ${LIMIT_FILES} files at a time.`);
      }

      const presignedUrls = [] as PresignedUrlProp[];

      await Promise.all(
        // loop through the files
        input.map(async (file) => {
          const fileName = `${nanoid()}-${file?.originalName}`;

          // get presigned url using s3 sdk
          const url = await createPresignedUrlToUpload({
            bucketName,
            fileName,
            expiry,
          });
          // add presigned url to the list
          presignedUrls.push({
            fileNameInBucket: fileName,
            originalName: file.originalName,
            size: file.size,
            url,
          });
        })
      );

      return presignedUrls;
    }),

  saveFileInfo: protectedProcedure
    .input(z.custom<PresignedUrlProp[]>())
    .handler(async ({ input, context }) => {
      const saveFilesInfo = await context.db.file.createMany({
        skipDuplicates: true,
        data: input.map((file: PresignedUrlProp) => ({
          bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
          originalName: file.originalName,
          fileName: file.fileNameInBucket,
          size: file.size,
        })),
      });

      if (!saveFilesInfo) {
        throw new ORPCError("Failed to save file info in DB.");
      }
      return saveFilesInfo;
    }),

  getFileById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const fileObject = await context.db.file.findUnique({
        where: { id: input.id },
        select: { fileName: true },
      });

      if (!fileObject) {
        throw new ORPCError("File not found.");
      }

      const presignedUrl = await createPresignedUrlToDownload({
        bucketName: env.NEXT_PUBLIC_S3_BUCKET_NAME,
        fileName: fileObject.fileName,
      });

      return { presignedUrl };
    }),

  deleteFile: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      // Get the file name in bucket from the database
      const fileObject = await context.db.file.findUnique({
        where: { id: input.id },
        select: { fileName: true },
      });

      if (!fileObject) {
        throw new ORPCError("File not found.");
      }

      await deleteFileFromBucket({
        bucketName: env.NEXT_PUBLIC_S3_BUCKET_NAME,
        fileName: fileObject?.fileName,
      });

      // Delete the file record from the database
      const deletedFile = await context.db.file.delete({
        where: { id: input.id },
      });

      if (!deletedFile) {
        throw new ORPCError("File Not Found");
      }
    }),
};
