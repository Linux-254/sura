import { randomUUID } from "node:crypto";
import { decodeImageDataUrl } from "./sura-commerce";
import { storagePut } from "./storage";

export async function storePrivatePersonalEditImage(userId: number, imageDataUrl: string) {
  const { mimeType, buffer } = decodeImageDataUrl(imageDataUrl);
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return storagePut(`personal-edits/${userId}/${randomUUID()}.${extension}`, buffer, mimeType);
}
