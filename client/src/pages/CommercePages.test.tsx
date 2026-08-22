// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrderCard } from "./CommercePages";

const baseOrder = { id: 12, status: "delivered", deliveryKes: 450, sellerSettlementKes: 7000, commissionKes: 3000, commissionRatePct: 30, customerTotalKes: 10450 };
const mutation = { mutate: vi.fn(), isPending: false, isError: false } as never;

afterEach(() => cleanup());

describe("SURA verified review order cards", () => {
  it("replaces the review form once a persisted verified review exists", () => {
    render(<OrderCard order={{ ...baseOrder, review: { id: 4, status: "pending", rating: 5, comment: "The product arrived in good order." } }} review={{ orderId: 0, rating: 5, comment: "" }} onReviewChange={vi.fn()} submitReview={mutation} />);
    expect(screen.getByText(/Verified review pending/i)).toBeTruthy();
    expect(screen.getByText(/cannot be submitted again/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Submit for moderation/i })).toBeNull();
  });

  it("keeps a non-delivered order ineligible for a review form", () => {
    render(<OrderCard order={{ ...baseOrder, status: "awaiting_payment", review: null }} review={{ orderId: 0, rating: 5, comment: "" }} onReviewChange={vi.fn()} submitReview={mutation} />);
    expect(screen.getByText(/Review unlocks after delivery/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Submit for moderation/i })).toBeNull();
  });

  it("submits only a delivered-order selection and replaces the form after a persisted status arrives", () => {
    const submit = { mutate: vi.fn(), isPending: false, isError: false } as never;
    const change = vi.fn();
    const { rerender } = render(<OrderCard order={{ ...baseOrder, review: null }} review={{ orderId: 12, rating: 4, comment: "Clear delivery updates and a good product." }} onReviewChange={change} submitReview={submit} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit for moderation" }));
    expect((submit as { mutate: ReturnType<typeof vi.fn> }).mutate).toHaveBeenCalledWith({ orderId: 12, rating: 4, comment: "Clear delivery updates and a good product." });
    rerender(<OrderCard order={{ ...baseOrder, review: { id: 5, status: "pending", rating: 4, comment: "Clear delivery updates and a good product." } }} review={{ orderId: 12, rating: 4, comment: "" }} onReviewChange={change} submitReview={submit} />);
    expect(screen.getByText(/Verified review pending/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Submit for moderation/i })).toBeNull();
  });
});
