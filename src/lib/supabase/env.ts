const PUBLIC_SUPABASE_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const PUBLIC_SUPABASE_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
const SERVICE_ROLE_KEY = "SUPABASE_SERVICE_ROLE_KEY";

function formatEnvSetupMessage(lines: string[]) {
  const debug = getSupabaseEnvDebugFlags();

  return [
    ...lines,
    "",
    `Debug env flags: hasPublicUrl=${String(debug.hasPublicUrl)}, hasPublicAnonKey=${String(debug.hasPublicAnonKey)}, hasServiceRoleKey=${String(debug.hasServiceRoleKey)}, publicUrlLooksValid=${String(debug.publicUrlLooksValid)}, publicKeyLooksValid=${String(debug.publicKeyLooksValid)}`,
    "",
    "Ако току-що си редактирал .env.local, рестартирай dev сървъра.",
    "",
    "Очакван .env.local формат:",
    "NEXT_PUBLIC_SUPABASE_URL=",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=",
    "SUPABASE_SERVICE_ROLE_KEY=   # optional, само за server-side admin операции",
  ].join("\n");
}

function getPublicSupabaseUrlValue() {
  return typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string"
    ? process.env.NEXT_PUBLIC_SUPABASE_URL.trim()
    : "";
}

function getPublicSupabaseAnonKeyValue() {
  return typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string"
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
    : "";
}

function getServiceRoleKeyValue() {
  return typeof process.env.SUPABASE_SERVICE_ROLE_KEY === "string"
    ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
    : "";
}

function isPlaceholderValue(value: string) {
  return (
    value.length === 0 ||
    value === "your-anon-key" ||
    value === "your-service-role-key" ||
    value === "https://your-project.supabase.co"
  );
}

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function isValidPublicSupabaseKey(value: string) {
  if (isPlaceholderValue(value)) {
    return false;
  }

  return value.startsWith("sb_publishable_") || value.startsWith("eyJ");
}

export function getPublicSupabaseEnv() {
  const url = getPublicSupabaseUrlValue();
  const anonKey = getPublicSupabaseAnonKeyValue();

  if (isPlaceholderValue(url)) {
    throw new Error(
      formatEnvSetupMessage([
        `Липсва или е невалидна променливата ${PUBLIC_SUPABASE_URL_KEY}.`,
      ]),
    );
  }

  if (!isValidSupabaseUrl(url)) {
    throw new Error(
      formatEnvSetupMessage([
        `${PUBLIC_SUPABASE_URL_KEY} трябва да е валиден https Supabase URL, например https://your-project.supabase.co.`,
      ]),
    );
  }

  if (isPlaceholderValue(anonKey)) {
    throw new Error(
      formatEnvSetupMessage([
        `Липсва или е невалидна променливата ${PUBLIC_SUPABASE_ANON_KEY}.`,
      ]),
    );
  }

  if (!isValidPublicSupabaseKey(anonKey)) {
    throw new Error(
      formatEnvSetupMessage([
        `${PUBLIC_SUPABASE_ANON_KEY} трябва да е валиден Supabase public key.`,
        "Позволени формати: стар anon JWT key (започва с eyJ) или нов publishable key (започва с sb_publishable_).",
      ]),
    );
  }

  return {
    url,
    anonKey,
  };
}

export function getSupabaseEnvDebugFlags() {
  const url = getPublicSupabaseUrlValue();
  const anonKey = getPublicSupabaseAnonKeyValue();
  const serviceRoleKey = getServiceRoleKeyValue();

  return {
    hasPublicUrl: !isPlaceholderValue(url),
    hasPublicAnonKey: !isPlaceholderValue(anonKey),
    hasServiceRoleKey: !isPlaceholderValue(serviceRoleKey),
    publicUrlLooksValid: isValidSupabaseUrl(url),
    publicKeyLooksValid: isValidPublicSupabaseKey(anonKey),
  };
}

export function getOptionalServiceRoleKey() {
  const serviceRoleKey = getServiceRoleKeyValue();
  return isPlaceholderValue(serviceRoleKey) ? null : serviceRoleKey;
}

export function getRequiredServiceRoleKey() {
  const serviceRoleKey = getOptionalServiceRoleKey();

  if (!serviceRoleKey) {
    throw new Error(
      formatEnvSetupMessage([
        `${SERVICE_ROLE_KEY} липсва. Той е нужен само за server-side admin операции, migration helper-и или jobs.`,
      ]),
    );
  }

  return serviceRoleKey;
}
