import { afterEach, describe, expect, it, vi } from "vitest";
import { regionEntryScript } from "./region-entry";

/** Runs the script as the browser would, for a navigation of `type`. */
function run(type: string | undefined) {
  vi.stubGlobal("performance", {
    getEntriesByType: () => (type ? [{ type }] : []),
  });
  const region = document.createElement("section");
  region.id = "writing";
  region.scrollIntoView = vi.fn();
  document.body.append(region);
  new Function(regionEntryScript("writing"))();
  return region.scrollIntoView;
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  delete window.__regionPlaced;
});

describe("regionEntryScript", () => {
  it("jumps to its region on a fresh navigation and marks the document placed (decision 176)", () => {
    expect(run("navigate")).toHaveBeenCalledWith({ behavior: "instant" });
    expect(window.__regionPlaced).toBe(true);
  });

  it.each(["reload", "back_forward", undefined])(
    "leaves the position to the browser on %s",
    (type) => {
      expect(run(type)).not.toHaveBeenCalled();
      expect(window.__regionPlaced).toBe(true);
    },
  );
});
