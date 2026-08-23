import { storagePut } from "./storage";
import { decodeImageDataUrl } from "./sura-commerce";

const extensionByMimeType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export async function storeCompanyPostImage(input: { dataUrl: string; companyId: number; uploadedByUserId: number }) {
  const { mimeType, buffer } = decodeImageDataUrl(input.dataUrl);
  const extension = extensionByMimeType[mimeType as keyof typeof extensionByMimeType];
  if (!extension) throw new Error("Unsupported post image type");

  return storagePut(
    `company-posts/${input.companyId}/${input.uploadedByUserId}/${Date.now()}.${extension}`,
    buffer,
    mimeType,
  );
}
