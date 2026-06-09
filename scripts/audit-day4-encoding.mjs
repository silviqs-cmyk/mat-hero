import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

async function loadEnvFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

await loadEnvFile(path.join(process.cwd(), ".env.local"));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const dayId = "7f9b0f4b-b75d-4a25-a5dc-0a337f92aa14";
const lessonId = "9505bd80-4fa5-4cc7-9036-6cd438378646";
const questionIds = [
  "391de776-de55-4113-ab73-50a5ed78c2e1",
  "472a7627-ce18-4a86-b0db-ff6409d11c95",
  "73191ae0-77ed-4d8d-b8e7-e4d54de1ef32",
];

const [{ data: day }, { data: lesson }, { data: sections }, { data: questions }] = await Promise.all([
  supabase.from("course_days").select("id, title, subtitle, description").eq("id", dayId).single(),
  supabase.from("lessons").select("id, title, content").eq("id", lessonId).single(),
  supabase
    .from("lesson_sections")
    .select("id, title, sort_order, content")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true }),
  supabase
    .from("questions")
    .select("id, sort_order, question_group, prompt, explanation, topic")
    .in("id", questionIds)
    .order("sort_order", { ascending: true }),
]);

const report = {
  day,
  lesson,
  sections_preview: sections.map((section) => ({
    id: section.id,
    sort_order: section.sort_order,
    title: section.title,
    preview: section.content.slice(0, 120),
  })),
  questions,
};

await fs.mkdir(path.join(process.cwd(), "exports"), { recursive: true });
await fs.writeFile(
  path.join(process.cwd(), "exports", "day4-encoding-audit-2026-06-09.json"),
  JSON.stringify(report, null, 2),
  "utf8",
);

console.log(JSON.stringify(report, null, 2));
