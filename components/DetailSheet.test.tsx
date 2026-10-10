import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DetailSheet, type Origin } from "./DetailSheet";

function renderSheet(origin: Origin | null) {
  return render(
    <>
      <div data-testid="outside">Page</div>
      <DetailSheet
        period="Feb 2023 – Present"
        title="Netdata"
        subtitle="Senior software engineer"
        origin={origin}
        closing={false}
        onClose={() => {}}
        onClosed={() => {}}
      >
        <p>Details</p>
      </DetailSheet>
    </>,
  );
}

describe("DetailSheet", () => {
  it("grows from the row: it carries the row's insets and no entry mark", () => {
    renderSheet({ top: 1, right: 2, bottom: 3, left: 4 });
    const sheet = screen.getByRole("dialog", { name: "Netdata" });
    expect(sheet.style.getPropertyValue("--from-top")).toBe("1px");
    expect(sheet.style.getPropertyValue("--from-left")).toBe("4px");
    expect(sheet).not.toHaveAttribute("data-entry");
  });

  it("opened by URL: it is marked as such and carries no insets (decision 165)", () => {
    renderSheet(null);
    const sheet = screen.getByRole("dialog", { name: "Netdata" });
    expect(sheet).toHaveAttribute("data-entry", "url");
    expect(sheet.style.getPropertyValue("--from-top")).toBe("");
  });

  it("makes everything outside it inert, and lifts that when it unmounts", () => {
    const { unmount } = renderSheet(null);
    const outside = screen.getByTestId("outside");
    const sheet = screen.getByRole("dialog", { name: "Netdata" });
    expect(outside.closest("[inert]")).not.toBeNull();
    expect(sheet.closest("[inert]")).toBeNull();
    unmount();
    expect(outside.closest("[inert]")).toBeNull();
  });
});
