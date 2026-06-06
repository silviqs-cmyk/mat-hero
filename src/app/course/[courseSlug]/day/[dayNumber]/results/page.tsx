import { DayResultsSummary } from "@/components/student/DayResultsSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NeonButton } from "@/components/ui/NeonButton";
import { requireStudent } from "@/lib/auth/server";
import { parseDayNumberParam } from "@/lib/studentFlow";
import {
  getCourseDayServer,
  getPublishedCourseBySlugServer,
  getQuestionsWithOptionsForDayServer,
  getUserDayResultServer,
  listUserAnswersForDayServer,
} from "@/services/studentContent.server";

export default async function CourseDayResultsPage({
  params,
}: {
  params: Promise<{ courseSlug: string; dayNumber: string }>;
}) {
  const { profile } = await requireStudent();
  const { courseSlug, dayNumber: rawDayNumber } = await params;
  const dayNumber = parseDayNumberParam(rawDayNumber);

  if (!profile) {
    return (
      <EmptyState
        title="РќСѓР¶РµРЅ Рµ РІС…РѕРґ"
        description="Р’Р»РµР· РІ MaturoHero, Р·Р° РґР° РІРёР¶РґР°С€ СЂРµР·СѓР»С‚Р°С‚РёС‚Рµ СЃРё."
        action={<NeonButton href="/login">РљСЉРј РІС…РѕРґР°</NeonButton>}
      />
    );
  }

  if (dayNumber === null) {
    return (
      <EmptyState
        title="РќРµРІР°Р»РёРґРµРЅ РґРµРЅ"
        description="Р›РёРЅРєСЉС‚ РєСЉРј РґРµРЅСЏ РЅРµ Рµ РІР°Р»РёРґРµРЅ."
        action={<NeonButton href="/dashboard">РљСЉРј С‚Р°Р±Р»РѕС‚Рѕ</NeonButton>}
      />
    );
  }

  const loadResult = await (async () => {
    const course = await getPublishedCourseBySlugServer(courseSlug);
    const bundle = await getCourseDayServer(courseSlug, dayNumber);
    if (!course || !bundle) {
      return {
        course,
        bundle,
        result: null,
        answers: [],
        questions: [] as Awaited<ReturnType<typeof getQuestionsWithOptionsForDayServer>>,
      };
    }

    const [result, answers, questions] = await Promise.all([
      getUserDayResultServer(profile.id, bundle.day.id),
      listUserAnswersForDayServer(profile.id, bundle.day.id),
      getQuestionsWithOptionsForDayServer(bundle.day.id, true),
    ]);

    return { course, bundle, result, answers, questions };
  })()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({
      data: null,
      error: error instanceof Error ? error.message : "Р’СЉР·РЅРёРєРЅР° РіСЂРµС€РєР°.",
    }));

  if (loadResult.error) {
    return (
      <ErrorState
        title="Не успяхме да заредим резултата."
        description={loadResult.error}
        action={<NeonButton href={`/course/${courseSlug}/day/${dayNumber}/results`}>Опитай отново</NeonButton>}
      />
    );
  }

  if (!loadResult.data?.course || !loadResult.data.bundle) {
    return (
      <EmptyState
        title="РќСЏРјР° РЅР°Р»РёС‡РЅРѕ СЃСЉРґСЉСЂР¶Р°РЅРёРµ"
        description="РўРѕР·Рё РґРµРЅ РѕС‰Рµ РЅСЏРјР° РїСѓР±Р»РёРєСѓРІР°РЅ СѓСЂРѕРє РёР»Рё Р·Р°РґР°С‡Рё."
        action={<NeonButton href="/dashboard">РљСЉРј С‚Р°Р±Р»РѕС‚Рѕ</NeonButton>}
      />
    );
  }

  if (!loadResult.data.result) {
    return (
      <EmptyState
        title="РћС‰Рµ РЅСЏРјР° Р·Р°РїРёСЃР°РЅ СЂРµР·СѓР»С‚Р°С‚"
        description="Р—Р°РІСЉСЂС€Рё С‚РµСЃС‚Р° Р·Р° РґРµРЅСЏ Рё СЂРµР·СѓР»С‚Р°С‚СЉС‚ С‚Рё С‰Рµ СЃРµ РїРѕСЏРІРё С‚СѓРє."
      />
    );
  }

  return (
    <DayResultsSummary
      course={loadResult.data.course}
      bundle={loadResult.data.bundle}
      result={loadResult.data.result}
      answers={loadResult.data.answers}
      questions={loadResult.data.questions}
    />
  );
}
