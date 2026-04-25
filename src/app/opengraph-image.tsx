import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "MatHero";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function getBackgroundDataUrl() {
  const imagePath = join(process.cwd(), "public", "images", "01801b87-59d6-4344-8fb2-baea9f25adda.png");
  const imageBuffer = await readFile(imagePath);
  return `data:image/png;base64,${imageBuffer.toString("base64")}`;
}

export default async function Image() {
  const backgroundSrc = await getBackgroundDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#03040a",
          color: "white",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 38%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(3,4,10,0.18) 0%, rgba(3,4,10,0.38) 52%, rgba(3,4,10,0.84) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 44,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              textShadow: "0 0 28px rgba(72, 195, 255, 0.5)",
            }}
          >
            MatHero
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "rgba(255,255,255,0.88)",
            }}
          >
            Math exam prep
          </div>
        </div>
      </div>
    ),
    size,
  );
}
