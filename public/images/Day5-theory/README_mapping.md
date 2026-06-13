# Ден 5 — изображения за теорията

Качване: Supabase Storage bucket `question-images` или нов bucket `lesson-images` само ако вече съществува/е позволен. Не променяй schema/UI без потвърждение.

ВАЖНО: Ако `lesson_sections.content` вече поддържа Markdown/HTML изображения, постави съответното изображение в началото или след първия абзац на секцията. Ако renderer-ът НЕ поддържа изображения в теорията, не прави кодови промени — само качи файловете и върни доклад.

## Карта по секции

1. `section_01_vidove_agli.png` → lesson_sections sort_order = 1 → „Видове ъгли“
2. `section_02_sasedni_i_vrahni_agli.png` → sort_order = 2 → „Съседни и връхни ъгли“
3. `section_03_presichashti_se_pravi.png` → sort_order = 3 → „Ъгли при пресичащи се прави“
4. `section_04_usporedni_pravi.png` → sort_order = 4 → „Ъгли при успоредни прави“
5. `section_05_elementi_na_triagalnik.png` → sort_order = 5 → „Триъгълник — основни елементи“
6. `section_06_sbor_agli_triagalnik.png` → sort_order = 6 → „Сбор на ъглите в триъгълник“
7. `section_07_vidove_triagalnici.png` → sort_order = 7 → „Видове триъгълници“
8. `section_08_ravnobedren_ravnostranen.png` → sort_order = 8 → „Равнобедрен и равностранен триъгълник“
9. `section_09_specialni_otsechki.png` → sort_order = 9 → „Външен ъгъл, височина, ъглополовяща и симетрала“
10. `section_10_nvo_kapani.png` → sort_order = 10 → „НВО капани при ъгли и триъгълници“

Препоръчителни storage paths:
`day-5/theory/section_01_vidove_agli.png` ... `day-5/theory/section_10_nvo_kapani.png`
