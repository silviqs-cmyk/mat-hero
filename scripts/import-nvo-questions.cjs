#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const DEFAULT_INPUT_FILE = "maturohero_nvo_master_classification.json";
const DEFAULT_COURSE_SLUG = "nvo-matematika-7-klas";
const DEFAULT_POINTS = 10;
const DEFAULT_DIFFICULTY = "medium";

function parseArgs(argv) {
  const result = {
    apply: false,
    dryRun: true,
    input: DEFAULT_INPUT_FILE,
    courseSlug: DEFAULT_COURSE_SLUG,
    limit: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--apply") {
      result.apply = true;
      result.dryRun = false;
      continue;
    }

    if (arg === "--dry-run") {
      result.dryRun = true;
      result.apply = false;
      continue;
    }

    if (arg === "--input") {
      result.input = argv[index + 1] ?? result.input;
      index += 1;
      continue;
    }

    if (arg === "--course-slug") {
      result.courseSlug = argv[index + 1] ?? result.courseSlug;
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      const rawLimit = argv[index + 1];
      const parsedLimit = Number(rawLimit);
      if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
        throw new Error(`Invalid value for --limit: ${String(rawLimit)}. Expected a positive integer.`);
      }

      result.limit = parsedLimit;
      index += 1;
      continue;
    }
  }

  return result;
}

function resolveRepoPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function loadLocalEnv() {
  loadEnvFile(resolveRepoPath(".env"));
  loadEnvFile(resolveRepoPath(".env.local"));
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readInputFile(inputArg) {
  const resolvedPath = path.isAbsolute(inputArg) ? inputArg : resolveRepoPath(inputArg);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `Input file not found: ${resolvedPath}\nPass a file path with --input <path>.`,
    );
  }

  const parsed = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  const records = extractRecords(parsed);

  if (!Array.isArray(records)) {
    throw new Error("Could not find an array of records in the input JSON.");
  }

  return { resolvedPath, records };
}

function extractRecords(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const candidateKeys = ["records", "items", "questions", "data"];
  for (const key of candidateKeys) {
    if (Array.isArray(value[key])) {
      return value[key];
    }
  }

  return null;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePrompt(value) {
  return normalizeText(value).replace(/\s+/g, " ");
}

function normalizeOptionalNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase();
    if (lowered === "true") {
      return true;
    }
    if (lowered === "false") {
      return false;
    }
  }

  return null;
}

function getRecordField(record, names) {
  for (const name of names) {
    if (record[name] !== undefined) {
      return record[name];
    }
  }

  return undefined;
}

function notesRequireVisualCheck(notes) {
  const normalized = normalizeText(notes).toLowerCase();
  if (!normalized) {
    return false;
  }

  const keywords = [
    "visual",
    "image",
    "diagram",
    "figure",
    "graph",
    "table",
    "screenshot",
    "photo",
    "scan",
    "check image",
    "requires visual",
    "needs visual",
    "needs image",
    "провери изображ",
    "изисква изображ",
    "диаграм",
    "график",
    "таблица",
    "снимка",
    "фигура",
  ];

  return keywords.some((keyword) => normalized.includes(keyword));
}

function parseOptions(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function inferQuestionType(record, options) {
  const explicit = normalizeText(
    getRecordField(record, ["question_type", "type", "answer_type"]),
  ).toLowerCase();

  if (explicit === "multiple_choice" || explicit === "open_answer" || explicit === "true_false") {
    return explicit;
  }

  const optionTexts = options
    .map((option) => normalizeText(option.option_text ?? option.text ?? option.label ?? option.value))
    .filter(Boolean);

  if (
    optionTexts.length === 2 &&
    optionTexts.every((text) => {
      const lowered = text.toLowerCase();
      return lowered === "вярно" || lowered === "невярно" || lowered === "true" || lowered === "false";
    })
  ) {
    return "true_false";
  }

  if (optionTexts.length > 0) {
    return "multiple_choice";
  }

  return "open_answer";
}

function normalizeOptions(record, questionType) {
  const rawOptions = parseOptions(getRecordField(record, ["options_json", "options"]));
  const normalized = rawOptions
    .map((option, index) => {
      const optionText = normalizeText(
        option.option_text ?? option.text ?? option.label ?? option.value,
      );
      const isCorrect = normalizeBoolean(option.is_correct ?? option.correct);
      const sortOrder = normalizeOptionalNumber(option.sort_order ?? option.order) ?? index + 1;

      if (!optionText) {
        return null;
      }

      return {
        option_text: optionText,
        is_correct: isCorrect === true,
        sort_order: sortOrder,
      };
    })
    .filter(Boolean);

  if (questionType === "multiple_choice" || questionType === "true_false") {
    return normalized;
  }

  return [];
}

function getExpectedAnswer(record, normalizedOptions) {
  const explicit = normalizeText(getRecordField(record, ["expected_answer", "correct_answer", "answer"]));
  if (explicit) {
    return explicit;
  }

  const correctOption = normalizedOptions.find((option) => option.is_correct);
  return correctOption ? correctOption.option_text : null;
}

function buildBatchDuplicateKey(normalizedRecord) {
  return [
    normalizedRecord.sourceYear ?? "",
    normalizedRecord.sourceQuestionNumber ?? "",
    normalizePrompt(normalizedRecord.prompt),
  ].join("::");
}

function buildDbDuplicateKey(questionRow) {
  return [
    questionRow.source_year ?? "",
    normalizePrompt(questionRow.prompt),
  ].join("::");
}

function normalizeRecord(record, index) {
  const prompt = normalizeText(getRecordField(record, ["prompt", "task_statement", "statement", "question_text"]));
  const explanation = normalizeText(getRecordField(record, ["explanation", "solution_explanation", "solution"]));
  const topic = normalizeText(getRecordField(record, ["topic", "topic_name", "classification_topic"]));
  const questionGroup = normalizeText(getRecordField(record, ["question_group"]));
  const isPublished = normalizeBoolean(getRecordField(record, ["is_published"]));
  const needsImage = normalizeBoolean(getRecordField(record, ["needs_image"]));
  const notes = normalizeText(getRecordField(record, ["notes"]));
  const courseDayNumber = normalizeOptionalNumber(
    getRecordField(record, ["course_day_number", "day_number"]),
  );
  const sourceYear = normalizeOptionalNumber(getRecordField(record, ["source_year", "year"]));
  const sourceQuestionNumber = normalizeText(
    getRecordField(record, ["source_question_number", "question_number", "nvo_question_number"]),
  );
  const difficulty = normalizeText(getRecordField(record, ["difficulty"])) || DEFAULT_DIFFICULTY;
  const points = normalizeOptionalNumber(getRecordField(record, ["points"])) ?? DEFAULT_POINTS;
  const externalId = normalizeText(getRecordField(record, ["external_id", "id", "source_id"]));
  const initialOptions = parseOptions(getRecordField(record, ["options_json", "options"]));
  const questionType = inferQuestionType(record, initialOptions);
  const options = normalizeOptions(record, questionType);
  const expectedAnswer = getExpectedAnswer(record, options);

  return {
    raw: record,
    index,
    externalId,
    prompt,
    explanation,
    topic,
    questionGroup,
    isPublished,
    needsImage,
    notes,
    courseDayNumber,
    sourceYear,
    sourceQuestionNumber,
    difficulty,
    points,
    questionType,
    expectedAnswer,
    options,
  };
}

function getSkipReasons(normalizedRecord) {
  const reasons = [];

  if (normalizedRecord.questionGroup !== "bonus") {
    reasons.push(`question_group is "${normalizedRecord.questionGroup || "missing"}"`);
  }

  if (normalizedRecord.isPublished !== false) {
    reasons.push(`is_published is ${String(normalizedRecord.isPublished)}`);
  }

  if (normalizedRecord.needsImage !== false) {
    reasons.push(`needs_image is ${String(normalizedRecord.needsImage)}`);
  }

  if (notesRequireVisualCheck(normalizedRecord.notes)) {
    reasons.push("notes require visual check");
  }

  if (!normalizedRecord.prompt) {
    reasons.push("prompt is empty");
  }

  if (!normalizedRecord.topic) {
    reasons.push("topic is empty");
  }

  if (!Number.isInteger(normalizedRecord.courseDayNumber) || normalizedRecord.courseDayNumber < 1) {
    reasons.push("course_day_number is missing or invalid");
  }

  if (normalizedRecord.questionType !== "open_answer" && normalizedRecord.options.length === 0) {
    reasons.push("options are missing for a non-open question");
  }

  return reasons;
}

async function createSupabaseClient() {
  loadLocalEnv();
  const url = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function loadCourseAndDays(supabase, courseSlug) {
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, slug, title")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (courseError) {
    throw new Error(courseError.message);
  }

  if (!course) {
    throw new Error(`Course not found for slug "${courseSlug}".`);
  }

  const { data: days, error: daysError } = await supabase
    .from("course_days")
    .select("id, day_number")
    .eq("course_id", course.id)
    .order("day_number", { ascending: true });

  if (daysError) {
    throw new Error(daysError.message);
  }

  return {
    course,
    dayIdByNumber: new Map((days ?? []).map((day) => [day.day_number, day.id])),
  };
}

async function loadExistingQuestions(supabase, courseDayIds) {
  if (courseDayIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("questions")
    .select("id, course_day_id, source_year, prompt, sort_order, question_group")
    .in("course_day_id", courseDayIds);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

function planImport(records, dayIdByNumber, existingQuestions) {
  const skipped = [];
  const ready = [];
  const matchedDayNumbers = new Set();
  const batchDuplicateKeys = new Set();
  const existingDuplicateKeys = new Set(
    existingQuestions
      .filter((question) => question.question_group === "bonus")
      .map((question) => buildDbDuplicateKey(question)),
  );
  const nextSortOrderByDayId = new Map();

  for (const question of existingQuestions) {
    const current = nextSortOrderByDayId.get(question.course_day_id) ?? 0;
    nextSortOrderByDayId.set(question.course_day_id, Math.max(current, question.sort_order ?? 0));
  }

  records.forEach((record, index) => {
    const normalizedRecord = normalizeRecord(record, index);
    const skipReasons = getSkipReasons(normalizedRecord);
    const courseDayId = dayIdByNumber.get(normalizedRecord.courseDayNumber);

    if (!courseDayId) {
      skipReasons.push(`course_day_number ${String(normalizedRecord.courseDayNumber)} not found in database`);
    }

    const batchDuplicateKey = buildBatchDuplicateKey(normalizedRecord);
    const dbDuplicateKey = [
      normalizedRecord.sourceYear ?? "",
      normalizePrompt(normalizedRecord.prompt),
    ].join("::");

    if (batchDuplicateKeys.has(batchDuplicateKey)) {
      skipReasons.push("duplicate inside this import batch");
    }

    if (existingDuplicateKeys.has(dbDuplicateKey)) {
      skipReasons.push("duplicate against existing questions by source_year + prompt");
    }

    if (skipReasons.length > 0) {
      skipped.push({
        index,
        externalId: normalizedRecord.externalId || null,
        promptPreview: normalizedRecord.prompt.slice(0, 120),
        reasons: skipReasons,
      });
      return;
    }

    batchDuplicateKeys.add(batchDuplicateKey);
    matchedDayNumbers.add(normalizedRecord.courseDayNumber);

    const nextSortOrder = (nextSortOrderByDayId.get(courseDayId) ?? 0) + 1;
    nextSortOrderByDayId.set(courseDayId, nextSortOrder);

    ready.push({
      index,
      externalId: normalizedRecord.externalId || null,
      courseDayNumber: normalizedRecord.courseDayNumber,
      courseDayId,
      promptPreview: normalizedRecord.prompt.slice(0, 120),
      sourceYear: normalizedRecord.sourceYear,
      sourceQuestionNumber: normalizedRecord.sourceQuestionNumber || null,
      questionPayload: {
        course_day_id: courseDayId,
        lesson_id: null,
        question_type: normalizedRecord.questionType,
        prompt: normalizedRecord.prompt,
        explanation: normalizedRecord.explanation,
        expected_answer: normalizedRecord.expectedAnswer,
        difficulty: normalizedRecord.difficulty,
        points: normalizedRecord.points,
        topic: normalizedRecord.topic,
        source_year: normalizedRecord.sourceYear,
        is_bonus: true,
        question_group: "bonus",
        sort_order: nextSortOrder,
        is_published: false,
      },
      options: normalizedRecord.options,
    });
  });

  return {
    ready,
    skipped,
    matchedDayNumbers: Array.from(matchedDayNumbers).sort((left, right) => left - right),
  };
}

function printSummary({ mode, inputPath, courseSlug, plan }) {
  const optionCount = plan.readyToImport.reduce((sum, item) => sum + item.options.length, 0);

  console.log("");
  console.log(`NVO import ${mode}`);
  console.log(`Input file: ${inputPath}`);
  console.log(`Course slug: ${courseSlug}`);
  console.log(`Total ready records before limit: ${plan.ready.length}`);
  console.log(`Limit applied: ${plan.limitApplied === null ? "(none)" : plan.limitApplied}`);
  console.log(`Questions to import after limit: ${plan.readyToImport.length}`);
  console.log(`Options to import after limit: ${optionCount}`);
  console.log(
    `Matched course_day_number values: ${
      plan.matchedDayNumbers.length > 0 ? plan.matchedDayNumbers.join(", ") : "(none)"
    }`,
  );
  console.log(`Skipped records: ${plan.skipped.length}`);

  if (plan.skipped.length > 0) {
    console.log("");
    console.log("Skipped details:");
    for (const skipped of plan.skipped) {
      const label = skipped.externalId ?? skipped.promptPreview ?? "(no prompt)";
      console.log(
        `- [${skipped.index}] ${label} -> ${skipped.reasons.join("; ")}`,
      );
    }
  }
}

async function applyImport(supabase, plan) {
  let insertedQuestions = 0;
  let insertedOptions = 0;

  for (const item of plan.readyToImport) {
    const { data: questionRow, error: questionError } = await supabase
      .from("questions")
      .insert(item.questionPayload)
      .select("id")
      .single();

    if (questionError) {
      throw new Error(
        `Failed to insert question at input index ${item.index}: ${questionError.message}`,
      );
    }

    insertedQuestions += 1;

    if (item.options.length > 0) {
      const optionPayload = item.options.map((option) => ({
        question_id: questionRow.id,
        option_text: option.option_text,
        is_correct: option.is_correct,
        sort_order: option.sort_order,
      }));

      const { error: optionsError } = await supabase
        .from("question_options")
        .insert(optionPayload);

      if (optionsError) {
        throw new Error(
          `Failed to insert options for question at input index ${item.index}: ${optionsError.message}`,
        );
      }

      insertedOptions += item.options.length;
    }
  }

  return { insertedQuestions, insertedOptions };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { resolvedPath, records } = readInputFile(args.input);
  const supabase = await createSupabaseClient();
  const { dayIdByNumber } = await loadCourseAndDays(supabase, args.courseSlug);
  const existingQuestions = await loadExistingQuestions(
    supabase,
    Array.from(dayIdByNumber.values()),
  );
  const plan = planImport(records, dayIdByNumber, existingQuestions);
  plan.limitApplied = args.limit;
  plan.readyToImport = args.limit === null ? plan.ready : plan.ready.slice(0, args.limit);

  printSummary({
    mode: args.apply ? "(apply)" : "(dry-run)",
    inputPath: resolvedPath,
    courseSlug: args.courseSlug,
    plan,
  });

  if (!args.apply) {
    console.log("");
    console.log("Dry-run only. No database rows were inserted.");
    return;
  }

  if (plan.readyToImport.length === 0) {
    console.log("");
    console.log("Nothing to import. Exiting without changes.");
    return;
  }

  const result = await applyImport(supabase, plan);
  console.log("");
  console.log(`Inserted questions: ${result.insertedQuestions}`);
  console.log(`Inserted options: ${result.insertedOptions}`);
}

main().catch((error) => {
  console.error("");
  console.error("Import failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
