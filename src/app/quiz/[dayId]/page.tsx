import { redirect } from "next/navigation";

export default async function LegacyQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ dayId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { dayId } = await params;
  const resolvedSearchParams = await searchParams;

  redirect(resolvedSearchParams.mode === "extra" ? `/day/${dayId}/bonus` : `/day/${dayId}/quiz`);
}
