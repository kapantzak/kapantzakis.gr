import { Bricolage_Grotesque, Inter } from "next/font/google";

export const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const bodyFont = Inter({
  subsets: ["latin", "greek"],
  variable: "--font-body",
  display: "swap",
});
