import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { ApiError } from "@/lib/api-utils";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

/**
 * Allow-list keyed by extension, because a client-supplied MIME type is not
 * trustworthy on its own. The stored name is always a generated UUID plus one
 * of these extensions, so a caller cannot choose the path or the suffix.
 */
const ALLOWED: Record<string, string[]> = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".avif": ["image/avif"],
  ".gif": ["image/gif"],
  ".svg": ["image/svg+xml"],
  ".glb": ["model/gltf-binary", "application/octet-stream", ""],
  ".gltf": ["model/gltf+json", "application/json", ""],
};

/** Magic-number probes for the raster formats we accept. */
const SIGNATURES: { ext: string[]; test: (b: Buffer) => boolean }[] = [
  { ext: [".jpg", ".jpeg"], test: (b) => b[0] === 0xff && b[1] === 0xd8 },
  {
    ext: [".png"],
    test: (b) => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  },
  { ext: [".gif"], test: (b) => b.subarray(0, 3).toString() === "GIF" },
  {
    ext: [".webp"],
    test: (b) =>
      b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP",
  },
  { ext: [".glb"], test: (b) => b.subarray(0, 4).toString() === "glTF" },
];

export interface StorageResult {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface StorageProvider {
  put(key: string, body: Buffer, mimeType: string): Promise<string>;
}

/**
 * Writes under `public/uploads`. Suitable for a single-host deployment; swap
 * in an S3/R2 provider by implementing StorageProvider and registering it in
 * `getProvider`.
 */
const localProvider: StorageProvider = {
  async put(key, body) {
    const uploadDir =
      process.env.STORAGE_LOCAL_PATH || path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, key), body);
    return `/uploads/${key}`;
  },
};

function getProvider(): StorageProvider {
  const name = process.env.STORAGE_PROVIDER || "local";
  if (name === "local") return localProvider;
  throw new ApiError(
    500,
    `Storage provider "${name}" is not configured on this deployment.`,
  );
}

export async function uploadFile(file: File): Promise<StorageResult> {
  if (!file || file.size === 0) {
    throw new ApiError(400, "No file received.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError(
      413,
      `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    );
  }

  const ext = path.extname(file.name).toLowerCase();
  const permittedTypes = ALLOWED[ext];
  if (!permittedTypes) {
    throw new ApiError(
      415,
      `Files of type "${ext || "unknown"}" are not allowed.`,
    );
  }
  if (file.type && !permittedTypes.includes(file.type)) {
    throw new ApiError(415, `"${file.type}" does not match a ${ext} file.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Verify the bytes match the claimed extension so a renamed executable
  // cannot be stored as an image.
  const signature = SIGNATURES.find((s) => s.ext.includes(ext));
  if (signature && !signature.test(buffer)) {
    throw new ApiError(415, `File contents do not look like a valid ${ext} file.`);
  }

  const key = `${randomUUID()}${ext}`;
  const url = await getProvider().put(key, buffer, file.type);

  return { url, filename: file.name, mimeType: file.type, size: file.size };
}
