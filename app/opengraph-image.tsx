import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${siteConfig.name} — ${siteConfig.role}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0e0c09",
          backgroundImage: "radial-gradient(circle at 70% 30%, rgba(217,161,84,0.18), transparent 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "6px",
            marginBottom: "48px",
          }}
        >
          {[34, 58, 90, 64, 110, 78, 48, 92, 60, 38].map((h, i) => (
            <div
              key={i}
              style={{
                width: "14px",
                height: `${h}px`,
                borderRadius: "7px",
                backgroundColor: "#d9a154",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 600, color: "#f4ede3" }}>
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", fontSize: 38, color: "#d9a154", marginTop: 12 }}>
          {siteConfig.role}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#a89d8d", marginTop: 28 }}>
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
