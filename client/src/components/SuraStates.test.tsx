// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SuraEmptyState, SuraErrorState, SuraPageSkeleton, SuraProcessing } from "./SuraStates";

describe("SURA editorial state components", () => {
  it("renders a labelled processing state without hiding its purpose", () => {
    render(<SuraProcessing title="Building your concept" copy="Private work is in progress." />);
    expect(screen.getByRole("status").textContent).toContain("Building your concept");
    expect(screen.getByText("Private work is in progress.")).toBeTruthy();
  });

  it("renders a recoverable error action and a non-generic empty state", () => {
    const retry = vi.fn();
    render(<><SuraErrorState title="Try the shop again" onRetry={retry} /><SuraEmptyState title="No items yet" copy="A verified company can add the first product." /></>);
    screen.getByText("Try again").click();
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByText("No items yet")).toBeTruthy();
  });

  it("uses semantic hidden shimmer blocks for the page skeleton", () => {
    const { container } = render(<SuraPageSkeleton cards={2} />);
    expect(container.querySelectorAll(".sura-shimmer").length).toBeGreaterThan(4);
  });

  it("keeps a supplied primary action visible in an empty state", () => {
    const action = vi.fn();
    render(<SuraEmptyState title="No company spaces yet" copy="You can create a studio when ready." action={<button onClick={action}>Create company</button>} />);
    screen.getByRole("button", { name: "Create company" }).click();
    expect(action).toHaveBeenCalledOnce();
  });
});
