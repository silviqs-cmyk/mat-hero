import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export const LESSON_VIDEO_BUCKET = "lesson-videos";
export const LESSON_VIDEO_ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const LESSON_VIDEO_MAX_MB = Number(process.env.NEXT_PUBLIC_LESSON_VIDEO_MAX_MB ?? "100");

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getLessonVideoMaxBytes() {
  return LESSON_VIDEO_MAX_MB * 1024 * 1024;
}

export function isAllowedLessonVideoFile(file: File) {
  return LESSON_VIDEO_ALLOWED_TYPES.includes(file.type);
}

export async function uploadLessonVideo(input: {
  file: File;
  courseDayId: string;
}): Promise<{ publicUrl: string; path: string }> {
  const supabase = getSupabaseBrowserClient();
  const extension = input.file.name.split(".").pop()?.toLowerCase() ?? "mp4";
  const safeName = sanitizeFileName(input.file.name) || "lesson-video";
  const path = `${input.courseDayId || "draft"}/${Date.now()}-${safeName}.${extension}`;

  const { error } = await supabase.storage.from(LESSON_VIDEO_BUCKET).upload(path, input.file, {
    cacheControl: "3600",
    contentType: input.file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(LESSON_VIDEO_BUCKET).getPublicUrl(path);

  return {
    publicUrl: data.publicUrl,
    path,
  };
}

export function getLessonVideoStoragePathFromUrl(videoUrl: string | null) {
  if (!videoUrl) {
    return null;
  }

  try {
    const url = new URL(videoUrl);
    const marker = `/storage/v1/object/public/${LESSON_VIDEO_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function deleteLessonVideoByUrl(videoUrl: string | null) {
  const path = getLessonVideoStoragePathFromUrl(videoUrl);
  if (!path) {
    return;
  }

  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage.from(LESSON_VIDEO_BUCKET).remove([path]);
  if (error) {
    throw new Error(error.message);
  }
}
