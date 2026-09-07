import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs/promises";
import path from "path";

const isConfigured = Boolean(
  process.env.STORAGE_ACCESS_KEY_ID &&
    process.env.STORAGE_SECRET_ACCESS_KEY &&
    process.env.STORAGE_ACCESS_KEY_ID !== "replace_with_access_key"
);

const s3Client = isConfigured
  ? new S3Client({
      region: process.env.STORAGE_REGION || "auto",
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    })
  : null;

const BUCKET_NAME = process.env.STORAGE_BUCKET_NAME || "brandflow-assets";
const PUBLIC_URL = process.env.STORAGE_PUBLIC_URL || "";

export interface UploadUrlResult {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  isDirectStorage: boolean;
}

export async function createPresignedUploadUrl(params: {
  workspaceId: string;
  fileName: string;
  mimeType: string;
  sizeBytes?: number;
}): Promise<UploadUrlResult> {
  const extension = path.extname(params.fileName) || ".png";
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const fileKey = `workspaces/${params.workspaceId}/assets/${uniqueId}${extension}`;

  if (s3Client) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: params.mimeType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    const publicUrl = PUBLIC_URL
      ? `${PUBLIC_URL.replace(/\/$/, "")}/${fileKey}`
      : uploadUrl.split("?")[0];

    return {
      uploadUrl,
      fileKey,
      publicUrl,
      isDirectStorage: true,
    };
  }

  // Local development fallback: serve route handler
  const uploadUrl = `/api/storage/upload?key=${encodeURIComponent(fileKey)}`;
  const publicUrl = `/api/storage/file?key=${encodeURIComponent(fileKey)}`;

  return {
    uploadUrl,
    fileKey,
    publicUrl,
    isDirectStorage: false,
  };
}

export async function saveRenderedAsset(params: {
  fileKey: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<string> {
  if (s3Client) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: params.fileKey,
        Body: params.buffer,
        ContentType: params.mimeType,
      })
    );

    return PUBLIC_URL
      ? `${PUBLIC_URL.replace(/\/$/, "")}/${params.fileKey}`
      : `https://${BUCKET_NAME}.s3.amazonaws.com/${params.fileKey}`;
  }

  // Local development filesystem storage
  const localDir = path.join(process.cwd(), "public", "storage", path.dirname(params.fileKey));
  await fs.mkdir(localDir, { recursive: true });
  const localFilePath = path.join(process.cwd(), "public", "storage", params.fileKey);
  await fs.writeFile(localFilePath, params.buffer);

  return `/storage/${params.fileKey}`;
}

