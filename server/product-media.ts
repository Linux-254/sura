import { storagePut } from "./storage";
import { decodeImageDataUrl } from "./sura-commerce";

const extensionByMimeType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type ProductImageUpload = {
  dataUrl: string;
  companyId: number;
  uploadedByUserId: number;
  position: number;
};

export async function storeCompanyProductImage(input: ProductImageUpload) {
  const { mimeType, buffer } = decodeImageDataUrl(input.dataUrl);
  const extension = extensionByMimeType[mimeType as keyof typeof extensionByMimeType];
  if (!extension) throw new Error("Unsupported product image type");

  return storagePut(
    `company-products/${input.companyId}/${input.uploadedByUserId}/${Date.now()}-${input.position}.${extension}`,
    buffer,
    mimeType,
  );
}
