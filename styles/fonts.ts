import { Inter, Momo_Trust_Display } from "next/font/google";

// Momo Trust Display ships a single weight, so display text must stay at 400 (decision 73).
export const displayFont = Momo_Trust_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
