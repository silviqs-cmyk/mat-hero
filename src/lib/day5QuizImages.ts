const DAY5_QUIZ_IMAGE_NAMES = [
  null,
  "q2_vanshni_agli_trigalnik_alpha.png",
  "q3_usporedni_pravi_75_alpha.png",
  null,
  "q5_trigalnik_strani_a_b_c_50_55.png",
  null,
  null,
  "q8_ravnobedren_trigalnik_130_alpha.png",
  "q9_usporedni_pravi_2x_140.png",
  "q10_trigalnik_40_3x_4x.png",
] as const;

export function getDay5QuizImageUrl(questionIndex: number) {
  const imageName = DAY5_QUIZ_IMAGE_NAMES[questionIndex];

  if (!imageName) {
    return null;
  }

  return `/images/den5_test_drawings/den5_test_drawings/${imageName}`;
}
