import fs from "fs";
import path from "path";

export const NEWS_IMAGES_DIR = path.join(process.cwd(), "data", "noticias");
export const NEWS_IMAGES_URL_PREFIX = "/api/gas/news-images";

export function ensureNewsImagesDir(): void {
  if (!fs.existsSync(NEWS_IMAGES_DIR)) {
    fs.mkdirSync(NEWS_IMAGES_DIR, { recursive: true });
  }
}

function parseBase64Image(base64: string): { buffer: Buffer; ext: string } {
  const match = base64.match(/^data:image\/(\w+);base64,(.+)$/);
  if (match) {
    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    return { buffer: Buffer.from(match[2], "base64"), ext };
  }
  return { buffer: Buffer.from(base64, "base64"), ext: "png" };
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function isLocalNewsImage(imageRef?: string): boolean {
  if (!imageRef) return false;
  if (imageRef.startsWith("data:")) return false;
  if (/^https?:\/\//i.test(imageRef) && !imageRef.includes(NEWS_IMAGES_URL_PREFIX)) {
    return false;
  }
  return true;
}

export function getNewsImageFileName(imageRef: string): string | null {
  if (!isLocalNewsImage(imageRef)) return null;
  if (imageRef.includes("/")) {
    return sanitizeFileName(path.basename(imageRef.split("?")[0]));
  }
  return sanitizeFileName(imageRef);
}

/** Convierte valor guardado en Excel a URL servible por la app. */
export function resolveNewsImageUrl(imageRef?: string): string | undefined {
  if (!imageRef) return undefined;
  if (imageRef.startsWith("data:") || imageRef.startsWith("http")) return imageRef;
  if (imageRef.startsWith(NEWS_IMAGES_URL_PREFIX)) return imageRef;
  if (imageRef.startsWith("/")) return imageRef;
  return `${NEWS_IMAGES_URL_PREFIX}/${sanitizeFileName(imageRef)}`;
}

/** Valor compacto para guardar en la columna ImagenURL del Excel. */
export function toStoredImageRef(fileUrl: string): string {
  if (fileUrl.startsWith(NEWS_IMAGES_URL_PREFIX)) {
    return path.basename(fileUrl.split("?")[0]);
  }
  return fileUrl;
}

export function saveNewsImage(
  base64: string,
  newsId?: string
): { fileId: string; fileUrl: string; storedRef: string } {
  ensureNewsImagesDir();
  const { buffer, ext } = parseBase64Image(base64);
  const fileId = newsId
    ? sanitizeFileName(`${newsId}.${ext}`)
    : sanitizeFileName(`news_${Date.now()}.${ext}`);
  const filePath = path.join(NEWS_IMAGES_DIR, fileId);
  fs.writeFileSync(filePath, buffer);
  const fileUrl = `${NEWS_IMAGES_URL_PREFIX}/${fileId}`;
  return { fileId, fileUrl, storedRef: fileId };
}

export function deleteNewsImage(imageRef?: string): void {
  const fileName = imageRef ? getNewsImageFileName(imageRef) : null;
  if (!fileName) return;
  const filePath = path.join(NEWS_IMAGES_DIR, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
