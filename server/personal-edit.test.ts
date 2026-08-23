import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { assertPersonalEditCollectionOwnership } from "./db";

function collectionDb(rows: unknown[]) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => rows,
        }),
      }),
    }),
  };
}

describe("SURA Personal Edit Studio ownership", () => {
  it("rejects a collection that is not owned by the authenticated member before an image can be stored", async () => {
    await expect(assertPersonalEditCollectionOwnership(44, 8, collectionDb([]))).rejects.toThrow("not available to the current account");
  });

  it("permits only the already owner-scoped collection result", async () => {
    await expect(assertPersonalEditCollectionOwnership(44, 8, collectionDb([{ id: 8, userId: 44 }]))).resolves.toMatchObject({ id: 8, userId: 44 });
  });

  it("removes edit-rail movement when reduced motion is requested", () => {
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(css).toContain(".sura-edit-card { animation: sura-edit-turn");
    expect(css).toContain("@media (prefers-reduced-motion: reduce) { .sura-shimmer, .sura-edit-card { animation: none !important; transform: none !important; transition: none !important; } }");
  });
});
