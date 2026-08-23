import { storagePut } from "./storage";
import { decodeImageDataUrl } from "./sura-commerce";

const extensionByMimeType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export async function storeAuthVisualImage(input: { dataUrl: string; uploadedByUserId: number; position: number }) {
  const { mimeType, buffer } = decodeImageDataUrl(input.dataUrl);
  const extension = extensionByMimeType[mimeType as keyof typeof extensionByMimeType];
  if (!extension) throw new Error("Unsupported sign-in visual type");
  return storagePut(`auth-visuals/${input.uploadedByUserId}/${Date.now()}-${input.position}.${extension}`, buffer, mimeType);
}
