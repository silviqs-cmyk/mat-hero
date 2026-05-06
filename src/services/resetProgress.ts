export async function resetStudentProgress() {
  const response = await fetch("/api/student/reset-progress", {
    method: "POST",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Не успях да зануля прогреса.");
  }
}
