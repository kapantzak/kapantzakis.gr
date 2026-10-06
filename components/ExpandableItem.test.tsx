import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExpandableItem } from "./ExpandableItem";

function renderItem() {
  return render(
    <main>
      <ol>
        <ExpandableItem
          period="Feb 2023 – Present"
          title="Netdata"
          subtitle="Senior software engineer"
        >
          <a href="https://example.com/">Details link</a>
        </ExpandableItem>
      </ol>
    </main>,
  );
}

function openSheet() {
  const row = screen.getByRole("button", { name: /Netdata/ });
  fireEvent.click(row);
  return { row, sheet: screen.getByRole("dialog", { name: "Netdata" }) };
}

async function expectClosed(row: HTMLElement) {
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(row).toHaveFocus();
  expect(row.closest("[inert]")).toBeNull();
  expect(document.documentElement).not.toHaveAttribute("data-sheet-open");
}

describe("ExpandableItem", () => {
  it("is a button inside a heading that announces a dialog", () => {
    renderItem();
    const row = screen.getByRole("button", { name: /Netdata/ });
    expect(row.closest("h4")).not.toBeNull();
    expect(row).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a modal sheet outside the row, with the details and focus on close", () => {
    renderItem();
    const { row, sheet } = openSheet();
    expect(sheet).toHaveAttribute("aria-modal", "true");
    expect(sheet.parentElement).toBe(document.body);
    expect(sheet).toHaveTextContent("Senior software engineer");
    expect(sheet).toHaveTextContent("Feb 2023 – Present");
    expect(
      screen.getByRole("link", { name: "Details link" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    expect(row.closest("[inert]")).not.toBeNull();
    expect(document.documentElement).toHaveAttribute("data-sheet-open");
  });

  it("adds a history entry when it opens", () => {
    renderItem();
    const before = window.history.length;
    openSheet();
    expect(window.history.length).toBe(before + 1);
    expect(window.history.state).toHaveProperty("detailSheet");
  });

  it("closes from the close button and returns focus to the row", async () => {
    renderItem();
    const { row } = openSheet();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await expectClosed(row);
  });

  it("closes on Escape", async () => {
    renderItem();
    const { row, sheet } = openSheet();
    fireEvent.keyDown(sheet, { key: "Escape" });
    await expectClosed(row);
  });

  it("closes when the browser goes back", async () => {
    renderItem();
    const { row } = openSheet();
    window.history.back();
    await expectClosed(row);
  });
});
