import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const monogram = profile.name
  .split(/\s+/)
  .map((word) => word[0] ?? "")
  .join("")
  .slice(0, 2)
  .toUpperCase();

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0d12",
        color: "#c6ff3d",
        fontSize: 34,
        fontWeight: 800,
      }}
    >
      {monogram}
    </div>,
    size,
  );
}
