import { BBH_Hegarty, Inter } from "next/font/google";

// BBH Hegarty ships a single weight, so display text must stay at 400 (decision 37).
export const displayFont = BBH_Hegarty({
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
