import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RegionScroll } from "./RegionScroll";

function region(id: string): HTMLElement {
  const el = document.createElement("section");
  el.id = id;
  el.scrollIntoView = vi.fn();
  document.body.append(el);
  return el;
}

afterEach(() => {
  document.body.replaceChildren();
  delete window.__regionPlaced;
  history.replaceState(null, "", "/");
});

describe("RegionScroll", () => {
  it("jumps to the region a client navigation arrived on (decision 182)", () => {
    history.replaceState(null, "", "/writing");
    const writing = region("writing");
    render(<RegionScroll />);
    expect(writing.scrollIntoView).toHaveBeenCalledWith({
      behavior: "instant",
    });
  });

  it("leaves a document its inline script placed to the browser (decision 176)", () => {
    history.replaceState(null, "", "/writing");
    window.__regionPlaced = true;
    const writing = region("writing");
    render(<RegionScroll />);
    expect(writing.scrollIntoView).not.toHaveBeenCalled();
  });

  it("does nothing on /", () => {
    const writing = region("writing");
    render(<RegionScroll />);
    expect(writing.scrollIntoView).not.toHaveBeenCalled();
  });
});
