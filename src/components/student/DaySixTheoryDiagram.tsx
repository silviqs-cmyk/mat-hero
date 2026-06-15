"use client";

import Image from "next/image";

interface DaySixTheoryDiagramProps {
  sectionIndex: number;
  sectionTitle: string;
}

const DAY_SIX_THEORY_IMAGES = [
  "1.png",
  "2.png",
  "5e582838-d47a-4c53-aaf1-80ed26243b7b.png",
  "42dd0871-d830-4949-9521-850150f73171.png",
  "970a73a5-38ea-43f1-86c8-44c4ce9266d8.png",
  "584c1adf-d8c3-4013-92f3-74efee314f08.png",
  "c621f20d-0f3f-494c-ae9d-3af9510ae304.png",
  "5ba0f1b7-5578-4982-b105-2616d590496e.png",
  "51aa0009-828a-42de-abc0-fe99c7f119a1.png",
  "1a93977f-2315-41a4-a198-c1833ed1c91b.png",
] as const;

export function DaySixTheoryDiagram({ sectionIndex, sectionTitle }: DaySixTheoryDiagramProps) {
  const imageName = DAY_SIX_THEORY_IMAGES[sectionIndex];

  if (!imageName) {
    return null;
  }

  return (
    <Image
      src={`/images/Day - 6 -theory/${imageName}`}
      alt={`Чертеж към ${sectionTitle}`}
      width={1200}
      height={900}
      className="block h-auto max-h-[320px] w-auto max-w-full object-contain"
      priority={sectionIndex === 0}
      unoptimized
    />
  );
}
