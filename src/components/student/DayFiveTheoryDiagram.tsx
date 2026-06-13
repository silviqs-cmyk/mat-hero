"use client";

import Image from "next/image";

interface DayFiveTheoryDiagramProps {
  sectionIndex: number;
  sectionTitle: string;
}

const DAY_FIVE_THEORY_IMAGES = [
  "section_01_vidove_agli.png",
  "section_02_sasedni_i_vrahni_agli.png",
  "section_03_presichashti_se_pravi.png",
  "section_04_usporedni_pravi.png",
  "section_05_elementi_na_triagalnik.png",
  "section_06_sbor_agli_triagalnik.png",
  "section_07_vidove_triagalnici.png",
  "section_08_ravnobedren_ravnostranen.png",
  "section_09_specialni_otsechki.png",
  "section_10_nvo_kapani.png",
] as const;

export function DayFiveTheoryDiagram({ sectionIndex, sectionTitle }: DayFiveTheoryDiagramProps) {
  const imageName = DAY_FIVE_THEORY_IMAGES[sectionIndex];

  if (!imageName) {
    return null;
  }

  return (
    <Image
      src={`/images/Day5-theory/${imageName}`}
      alt={`Чертеж към ${sectionTitle}`}
      width={1200}
      height={900}
      className="h-auto w-full object-contain"
      priority={sectionIndex === 0}
      unoptimized
    />
  );
}
