import { describe, expect, it } from "vitest";
import {
  canAdvanceHandoff,
  canAdvanceProject,
  canReconcilePayment,
  canStartContextualConversation,
  canUpdateCompanyProduct,
  canUpdateInquiry,
  isCollageVisible,
  isNotificationRecipient,
  isPublicSearchProduct,
} from "./workflows";

describe("Sura backend workflow policies", () => {
  it("keeps public search limited to verified, published, active products", () => {
    expect(isPublicSearchProduct({ status: "published", isActive: true }, true)).toBe(true);
    expect(isPublicSearchProduct({ status: "draft", isActive: true }, true)).toBe(false);
    expect(isPublicSearchProduct({ status: "published", isActive: false }, true)).toBe(false);
    expect(isPublicSearchProduct({ status: "published", isActive: true }, false)).toBe(false);
  });

  it("keeps private collages private while allowing explicitly public Shelf collages", () => {
    const privateCollage = { userId: 7, isPublic: false };
    const publicCollage = { userId: 7, isPublic: true };
    expect(isCollageVisible(privateCollage, 7, false)).toBe(true);
    expect(isCollageVisible(privateCollage, 8, true)).toBe(false);
    expect(isCollageVisible(publicCollage, 8, true)).toBe(true);
  });

  it("requires a real relationship context before a conversation can start", () => {
    expect(canStartContextualConversation({ hasContext: false, actorAllowed: true, participantsAllowed: true, participantCount: 2 })).toBe(false);
    expect(canStartContextualConversation({ hasContext: true, actorAllowed: false, participantsAllowed: true, participantCount: 2 })).toBe(false);
    expect(canStartContextualConversation({ hasContext: true, actorAllowed: true, participantsAllowed: false, participantCount: 2 })).toBe(false);
    expect(canStartContextualConversation({ hasContext: true, actorAllowed: true, participantsAllowed: true, participantCount: 1 })).toBe(false);
    expect(canStartContextualConversation({ hasContext: true, actorAllowed: true, participantsAllowed: true, participantCount: 2 })).toBe(true);
  });

  it("prevents inquiry status regression and terminal reopening", () => {
    expect(canUpdateInquiry("new", "reviewed")).toBe(true);
    expect(canUpdateInquiry("reviewed", "quoted")).toBe(true);
    expect(canUpdateInquiry("quoted", "accepted")).toBe(true);
    expect(canUpdateInquiry("accepted", "reviewed")).toBe(false);
    expect(canUpdateInquiry("declined", "accepted")).toBe(false);
    expect(canUpdateInquiry("closed", "quoted")).toBe(false);
  });

  it("keeps product publication company-controlled until admin review", () => {
    expect(canUpdateCompanyProduct("draft", "pending")).toBe(true);
    expect(canUpdateCompanyProduct("rejected", "pending")).toBe(true);
    expect(canUpdateCompanyProduct("pending", "draft")).toBe(true);
    expect(canUpdateCompanyProduct("published", "pending")).toBe(false);
  });

  it("enforces project chronology and actor role boundaries", () => {
    expect(canAdvanceProject("draft", "submitted", "owner")).toBe(true);
    expect(canAdvanceProject("submitted", "in_review", "owner")).toBe(false);
    expect(canAdvanceProject("submitted", "in_review", "manager")).toBe(true);
    expect(canAdvanceProject("in_review", "quoted", "editor")).toBe(true);
    expect(canAdvanceProject("in_progress", "completed", "editor")).toBe(false);
    expect(canAdvanceProject("in_progress", "completed", "manager")).toBe(true);
    expect(canAdvanceProject("completed", "in_progress", "manager")).toBe(false);
  });

  it("allows customers to raise issues or cancel but only companies to advance fulfillment", () => {
    expect(canAdvanceHandoff("pending", "cancelled", "customer")).toBe(true);
    expect(canAdvanceHandoff("pending", "in_production", "customer")).toBe(false);
    expect(canAdvanceHandoff("pending", "accepted", "company")).toBe(true);
    expect(canAdvanceHandoff("accepted", "in_production", "company")).toBe(true);
    expect(canAdvanceHandoff("in_transit", "delivered", "customer")).toBe(false);
    expect(canAdvanceHandoff("delivered", "issue", "company")).toBe(false);
  });

  it("only accepts one transition from a pending payment intent", () => {
    expect(canReconcilePayment("pending", "paid")).toBe(true);
    expect(canReconcilePayment("pending", "failed")).toBe(true);
    expect(canReconcilePayment("pending", "cancelled")).toBe(true);
    expect(canReconcilePayment("paid", "failed")).toBe(false);
    expect(canReconcilePayment("failed", "paid")).toBe(false);
  });

  it("never sends workflow notifications to the actor who caused the event", () => {
    expect(isNotificationRecipient(8, 7)).toBe(true);
    expect(isNotificationRecipient(7, 7)).toBe(false);
    expect(isNotificationRecipient(7)).toBe(true);
  });
});
