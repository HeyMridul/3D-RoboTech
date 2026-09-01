import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "model/gltf-binary",
  "application/octet-stream",
];

export interface StorageResult {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export async function uploadFile(file: File): Promise<StorageResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 5MB.");
  }

  if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith(".glb")) {
    throw new Error("File type not allowed.");
  }

  const provider = process.env.STORAGE_PROVIDER || "local";

  if (provider === "local") {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name);
    const filename = `${randomUUID()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return {
      url: `/uploads/${filename}`,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    };
  }

  throw new Error(`Storage provider "${provider}" not configured.`);
}
