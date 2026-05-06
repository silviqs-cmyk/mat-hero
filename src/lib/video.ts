const DIRECT_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

export type ResolvedLessonVideo =
  | { kind: "embed"; src: string; provider: "youtube" | "vimeo" }
  | { kind: "file"; src: string; provider: "file" }
  | { kind: "external"; src: string; provider: "external" };

export function isValidVideoUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isDirectVideoFileUrl(videoUrl: string | null) {
  if (!videoUrl) {
    return false;
  }

  try {
    const url = new URL(videoUrl);
    return DIRECT_VIDEO_EXTENSIONS.some((extension) => url.pathname.toLowerCase().endsWith(extension));
  } catch {
    return false;
  }
}

export function resolveLessonVideo(videoUrl: string | null): ResolvedLessonVideo | null {
  if (!videoUrl) {
    return null;
  }

  try {
    const url = new URL(videoUrl);

    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      return videoId ? { kind: "embed", provider: "youtube", src: `https://www.youtube.com/embed/${videoId}` } : null;
    }

    if (url.hostname.includes("youtu.be")) {
      const videoId = url.pathname.replace("/", "");
      return videoId ? { kind: "embed", provider: "youtube", src: `https://www.youtube.com/embed/${videoId}` } : null;
    }

    if (url.hostname.includes("vimeo.com")) {
      const videoId = url.pathname.split("/").filter(Boolean).pop();
      return videoId ? { kind: "embed", provider: "vimeo", src: `https://player.vimeo.com/video/${videoId}` } : null;
    }

    if (DIRECT_VIDEO_EXTENSIONS.some((extension) => url.pathname.toLowerCase().endsWith(extension))) {
      return { kind: "file", provider: "file", src: videoUrl };
    }

    return { kind: "external", provider: "external", src: videoUrl };
  } catch {
    return null;
  }
}
