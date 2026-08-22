import { generateImage } from "./_core/imageGeneration";
import { invokeLLM } from "./_core/llm";
import { storageGetSignedUrl, storagePut } from "./storage";
import { decodeImageDataUrl } from "./sura-commerce";

export type AiAssistKind = "home_refresh" | "personal_style" | "footwear_fit" | "inspiration";

export type AiAssistPlan = {
  title: string;
  designDirection: string;
  priorities: string[];
  recommendedCategories: string[];
  shoppingLens: string;
  safetyNote: string;
};

export async function storeConsentImage(userId: number, imageDataUrl: string) {
  const { mimeType, buffer } = decodeImageDataUrl(imageDataUrl);
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return storagePut(`ai-private/${userId}/source.${extension}`, buffer, mimeType);
}

export async function createAiAssistPlan(input: { kind: AiAssistKind; brief: string; city: string; budgetKes: number; sizeProfile?: string; imageKey?: string }) {
  const imageUrl = input.imageKey ? await storageGetSignedUrl(input.imageKey) : undefined;
  const instruction = `You are SURA, a Kenyan aesthetic-commerce planning assistant. Create a practical, respectful style or space plan. Do not identify a person, infer sensitive traits, make health claims, or promise exact fit, stock, delivery, or interior-design outcomes. Use the member's stated brief, city, budget, and optional size notes. Output concise, actionable content for local shopping filters and inspiration.`;
  const userPrompt = `Brief type: ${input.kind}\nCity: ${input.city}\nBudget: KES ${input.budgetKes}\nSize or fit notes: ${input.sizeProfile ?? "Not supplied"}\nGoal: ${input.brief}`;
  const response = await invokeLLM({
    model: "gemini-3-flash-preview",
    messages: [{ role: "system", content: instruction }, { role: "user", content: imageUrl ? [{ type: "text", text: userPrompt }, { type: "image_url", image_url: { url: imageUrl, detail: "low" } }] : userPrompt }],
    outputSchema: {
      name: "sura_ai_assist_plan",
      strict: true,
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          designDirection: { type: "string" },
          priorities: { type: "array", items: { type: "string" } },
          recommendedCategories: { type: "array", items: { type: "string" } },
          shoppingLens: { type: "string" },
          safetyNote: { type: "string" },
        },
        required: ["title", "designDirection", "priorities", "recommendedCategories", "shoppingLens", "safetyNote"],
        additionalProperties: false,
      },
    },
  });
  const rawContent = response.choices[0]?.message.content;
  if (typeof rawContent !== "string") throw new Error("The AI plan did not return readable content");
  const plan = JSON.parse(rawContent) as AiAssistPlan;
  const conceptPrompt = `Create an editorial AI concept image for a ${input.kind.replace(/_/g, " ")} plan in ${input.city}. Direction: ${plan.designDirection}. Emphasize ${plan.priorities.join(", ")}. This is a mood and composition concept, not a product advertisement; no text, logos, price tags, or identifiable real person.`;
  const generated = await generateImage({ prompt: conceptPrompt, ...(imageUrl ? { originalImages: [{ url: imageUrl, mimeType: "image/jpeg" }] } : {}) });
  return { plan, generatedImageUrl: generated.url };
}
