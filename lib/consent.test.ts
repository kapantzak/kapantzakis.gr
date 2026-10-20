import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  openConsentSettings,
  readConsent,
  resetConsentStore,
  useConsent,
  withdrawConsent,
  writeConsent,
} from "./consent";

afterEach(() => {
  localStorage.clear();
  resetConsentStore();
  vi.restoreAllMocks();
  for (const name of ["_ga", "_ga_3L6VP0EV5V"]) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
});

describe("consent", () => {
  it("has no choice when nothing is stored", () => {
    expect(readConsent()).toBeNull();
  });

  it("remembers a choice for 6 months (decision 223)", () => {
    writeConsent("granted", Date.UTC(2026, 0, 15));
    resetConsentStore();
    expect(readConsent(Date.UTC(2026, 6, 14))).toBe("granted");
    expect(readConsent(Date.UTC(2026, 6, 15))).toBeNull();
  });

  it("ignores a malformed entry", () => {
    localStorage.setItem("consent", "{");
    expect(readConsent()).toBeNull();
    localStorage.setItem("consent", '{"choice":"maybe","at":0}');
    expect(readConsent()).toBeNull();
  });

  it("keeps a choice for the page's life when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readConsent()).toBeNull();
    writeConsent("granted");
    expect(readConsent()).toBe("granted");
  });

  it("follows the choice and Cookie settings", () => {
    writeConsent("denied");
    const { result } = renderHook(() => useConsent());
    expect(result.current).toEqual({ choice: "denied", asking: false });
    act(openConsentSettings);
    expect(result.current).toEqual({ choice: "denied", asking: true });
    act(() => writeConsent("granted"));
    expect(result.current).toEqual({ choice: "granted", asking: false });
  });

  it("withdrawing clears the GA cookies and reloads (decision 225)", () => {
    document.cookie = "_ga=x; path=/";
    document.cookie = "_ga_3L6VP0EV5V=y; path=/";
    const reload = vi.fn();
    writeConsent("granted");
    withdrawConsent("G-3L6VP0EV5V", reload);
    expect(document.cookie).not.toContain("_ga=");
    expect(document.cookie).not.toContain("_ga_3L6VP0EV5V=");
    expect(readConsent()).toBe("denied");
    expect(reload).toHaveBeenCalledOnce();
  });
});
