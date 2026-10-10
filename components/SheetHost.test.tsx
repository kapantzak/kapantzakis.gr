import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { Brand } from "@/content/profile";
import { ExpandableItem } from "./ExpandableItem";
import { type SheetEntry, SheetHost } from "./SheetHost";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

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

const PATH = "/experience/netdata";
const HOME_TITLE = "Home — Site";
const SHEET_TITLE = "Netdata — Site";

function renderHost(brand?: Brand) {
  const sheet: SheetEntry = {
    path: PATH,
    period: "Feb 2023 – Present",
    title: "Netdata",
    subtitle: "Senior software engineer",
    brand,
    facts: <a href="https://example.com/site">Website link</a>,
    content: <a href="https://example.com/">Details link</a>,
    documentTitle: SHEET_TITLE,
  };
  return render(
    <SheetHost sheets={[sheet]} homeTitle={HOME_TITLE}>
      <main>
        <ol>
          <ExpandableItem
            path={sheet.path}
            period={sheet.period}
            title={sheet.title}
            subtitle={sheet.subtitle}
            brand={brand}
          />
        </ol>
      </main>
    </SheetHost>,
  );
}

/** As if the browser had loaded the page on `path`. */
function loadAt(path: string) {
  pathname.current = path;
  window.history.replaceState(null, "", path);
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
  expect(window.location.pathname).toBe("/");
  expect(document.title).toBe(HOME_TITLE);
}

beforeAll(() => {
  // jsdom has no layout, so it lacks scrollIntoView.
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  loadAt("/");
  document.title = HOME_TITLE;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(Element.prototype.scrollIntoView).mockClear();
});

describe("SheetHost and its rows", () => {
  it("renders a row as a button inside a heading that announces a dialog", () => {
    renderHost();
    const row = screen.getByRole("button", { name: /Netdata/ });
    expect(row.closest("h4")).not.toBeNull();
    expect(row).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a modal sheet outside the row, at the sheet's own path (decision 161)", () => {
    renderHost();
    const before = window.history.length;
    const { row, sheet } = openSheet();
    expect(window.location.pathname).toBe(PATH);
    expect(window.history.length).toBe(before + 1);
    expect(sheet).toHaveAttribute("aria-modal", "true");
    expect(row.closest("li")!.contains(sheet)).toBe(false);
    expect(row.closest("li")).toHaveAttribute("data-open");
    expect(sheet).not.toHaveAttribute("data-entry");
    expect(sheet).toHaveTextContent("Senior software engineer");
    expect(sheet).toHaveTextContent("Feb 2023 – Present");
    expect(
      screen.getByRole("link", { name: "Details link" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    expect(row.closest("[inert]")).not.toBeNull();
    expect(document.documentElement).toHaveAttribute("data-sheet-open");
  });

  it("closes from the close button, back to the page it opened from", async () => {
    renderHost();
    const { row } = openSheet();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await expectClosed(row);
  });

  it("closes on Escape", async () => {
    renderHost();
    const { row, sheet } = openSheet();
    fireEvent.keyDown(sheet, { key: "Escape" });
    await expectClosed(row);
  });

  it("goes back only once when asked to close twice", async () => {
    renderHost();
    const back = vi.spyOn(window.history, "back");
    const { row, sheet } = openSheet();
    fireEvent.keyDown(sheet, { key: "Escape" });
    fireEvent.keyDown(sheet, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await expectClosed(row);
    expect(back).toHaveBeenCalledOnce();
  });

  it("closes when the browser goes back, and opens again on Forward", async () => {
    renderHost();
    const { row } = openSheet();
    window.history.back();
    await expectClosed(row);
    window.history.forward();
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: "Netdata" })).toBeVisible(),
    );
    expect(window.location.pathname).toBe(PATH);
  });

  it("titles the tab after the open sheet (decision 169)", async () => {
    renderHost();
    const { row } = openSheet();
    expect(document.title).toBe(SHEET_TITLE);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await expectClosed(row);
  });

  it("opens a sheet the page load names, already full screen, with the page scrolled to its row (decision 165)", () => {
    loadAt(PATH);
    renderHost();
    const sheet = screen.getByRole("dialog", { name: "Netdata" });
    const row = screen.getByRole("button", { name: /Netdata/ });
    expect(sheet).toHaveAttribute("data-entry", "url");
    expect(row.closest("li")).toHaveAttribute("data-open");
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      block: "center",
      behavior: "instant",
    });
    expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts).toEqual([
      row,
    ]);
  });

  it("closes a sheet the page load opened by replacing its URL with / (decision 167)", async () => {
    loadAt(PATH);
    renderHost();
    const back = vi.spyOn(window.history, "back");
    const before = window.history.length;
    const row = screen.getByRole("button", { name: /Netdata/ });
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Netdata" }), {
      key: "Escape",
    });
    await expectClosed(row);
    expect(window.history.length).toBe(before);
    expect(back).not.toHaveBeenCalled();
  });

  it("titles a plain sheet with text and keeps its facts in the header", () => {
    renderHost();
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
    renderHost(BRAND);
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
    renderHost({ ...BRAND_WITH_VISUAL, logo: undefined });
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
    renderHost({ ...BRAND, lockup: ["Netdata", "Cloud"] });
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
    renderHost(BRAND_WITH_VISUAL);
    const { sheet } = openSheet();
    const band = sheet.querySelector<HTMLElement>("[data-brand]")!;
    const visual = band.querySelector('[aria-hidden="true"] img');
    expect(visual).not.toBeNull();
    expect(visual).toHaveAttribute("alt", "");
    expect(within(band).getAllByRole("img")).toHaveLength(1);
  });

  it("leaves the band without a visual when the brand has none", () => {
    renderHost(BRAND);
    const { sheet } = openSheet();
    expect(sheet.querySelectorAll("[data-brand] img")).toHaveLength(1);
  });

  it("marks the band's tone, so a light band takes the light-page colours", () => {
    renderHost({ ...BRAND, background: "#ffffff", tone: "light" });
    const { sheet } = openSheet();
    expect(sheet.querySelector("[data-brand]")).toHaveAttribute(
      "data-tone",
      "light",
    );
  });
});
