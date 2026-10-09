import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Brand } from "@/content/profile";
import { ExpandableItem } from "./ExpandableItem";

const BRAND: Brand = {
  logo: { src: "/netdata-logo.svg", width: 879, height: 151 },
  background: "#020503",
  accent: "#00ab44",
  link: "#00ab44",
  tone: "dark",
};

const BRAND_WITH_VISUAL: Brand = {
  ...BRAND,
  visual: { src: "/netdata-dashboard.png", width: 1919, height: 1079 },
};

function renderItem(brand?: Brand) {
  return render(
    <main>
      <ol>
        <ExpandableItem
          period="Feb 2023 – Present"
          title="Netdata"
          subtitle="Senior software engineer"
          brand={brand}
          facts={<a href="https://example.com/site">Website link</a>}
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

  it("titles a plain sheet with text and keeps its facts in the header", () => {
    renderItem();
    const { sheet } = openSheet();
    expect(
      within(sheet).getByRole("heading", { level: 2, name: "Netdata" }),
    ).toHaveTextContent("Netdata");
    expect(within(sheet).queryByRole("img")).toBeNull();
    expect(sheet.querySelector("[data-brand]")).toBeNull();
    expect(
      within(sheet)
        .getByRole("link", { name: "Website link" })
        .closest("header"),
    ).not.toBeNull();
  });

  it("titles a branded sheet with its logo and facts on a band in its colours", () => {
    renderItem(BRAND);
    const { row, sheet } = openSheet();
    const title = within(sheet).getByRole("heading", { level: 2 });
    expect(within(title).getByRole("img", { name: "Netdata" })).toBeVisible();
    expect(title.closest("[data-brand]")).not.toBeNull();
    expect(
      within(sheet)
        .getByRole("link", { name: "Website link" })
        .closest("[data-brand]"),
    ).not.toBeNull();
    expect(sheet.style.getPropertyValue("--accent")).toBe(BRAND.accent);
    expect(sheet.style.getPropertyValue("--brand-bg")).toBe(BRAND.background);
    expect(sheet.style.getPropertyValue("--brand-link")).toBe(BRAND.link);
    expect(row.closest("li")!.style.getPropertyValue("--accent")).toBe(
      BRAND.accent,
    );
  });

  it("keeps a text title on the band when the brand has no logo", () => {
    renderItem({ ...BRAND_WITH_VISUAL, logo: undefined });
    const { sheet } = openSheet();
    const title = within(sheet).getByRole("heading", {
      level: 2,
      name: "Netdata",
    });
    expect(title).toHaveTextContent("Netdata");
    expect(within(title).queryByRole("img")).toBeNull();
    expect(title.closest("[data-brand]")).not.toBeNull();
    expect(
      sheet.querySelector('[data-brand] [aria-hidden="true"] img'),
    ).not.toBeNull();
  });

  it("sets a brand's lockup beside its logo, so the text alone names the dialog", () => {
    renderItem({ ...BRAND, lockup: ["Netdata", "Cloud"] });
    fireEvent.click(screen.getByRole("button", { name: /Netdata/ }));
    const sheet = screen.getByRole("dialog", { name: "Netdata Cloud" });
    const title = within(sheet).getByRole("heading", {
      level: 2,
      name: "Netdata Cloud",
    });
    expect(title.querySelector("img")).toHaveAttribute("alt", "");
    expect(within(title).queryByRole("img")).toBeNull();
    expect(within(title).getByText("Cloud")).toBeVisible();
  });

  it("shows a brand's visual on its band as decoration only", () => {
    renderItem(BRAND_WITH_VISUAL);
    const { sheet } = openSheet();
    const band = sheet.querySelector<HTMLElement>("[data-brand]")!;
    const visual = band.querySelector('[aria-hidden="true"] img');
    expect(visual).not.toBeNull();
    expect(visual).toHaveAttribute("alt", "");
    expect(within(band).getAllByRole("img")).toHaveLength(1);
  });

  it("leaves the band without a visual when the brand has none", () => {
    renderItem(BRAND);
    const { sheet } = openSheet();
    expect(sheet.querySelectorAll("[data-brand] img")).toHaveLength(1);
  });

  it("marks the band's tone, so a light band takes the light-page colours", () => {
    renderItem({ ...BRAND, background: "#ffffff", tone: "light" });
    const { sheet } = openSheet();
    expect(sheet.querySelector("[data-brand]")).toHaveAttribute(
      "data-tone",
      "light",
    );
  });
});
