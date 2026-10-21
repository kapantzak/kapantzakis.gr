import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { resetConsentStore, writeConsent } from "@/lib/consent";
import { ConsentBanner } from "./ConsentBanner";
import { CookieSettings } from "./CookieSettings";

afterEach(() => {
  localStorage.clear();
  resetConsentStore();
});

describe("CookieSettings", () => {
  it("reopens the banner after a choice (decision 220)", () => {
    writeConsent("denied");
    render(
      <>
        <CookieSettings />
        <ConsentBanner gaId="G-TEST" />
      </>,
    );
    expect(screen.queryByRole("region", { name: "Cookie consent" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cookie settings" }));
    expect(
      screen.getByRole("region", { name: "Cookie consent" }),
    ).toBeInTheDocument();
  });
});
