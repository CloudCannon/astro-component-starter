const VIDEO_MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogv": "video/ogg",
  ".ogg": "video/ogg",
};

export interface VideoSource {
  src: string;
  type: string;
}

/**
 * Given a video source path (relative to public/), finds all sibling files
 * with the same base name and a recognised video extension.
 * The selected source is always listed first so browsers prefer it.
 */
export async function discoverVideoSources(
  source: string,
): Promise<VideoSource[]> {
  const { existsSync } = await import("node:fs");
  const { basename, dirname, extname, join } = await import("node:path");

  const ext = extname(source).toLowerCase();
  const dir = dirname(source);
  const base = basename(source, extname(source));
  const publicDir = join(process.cwd(), "public", dir);

  try {
    const candidates = Object.keys(VIDEO_MIME_TYPES)
      .filter((candidateExt) => {
        if (candidateExt === ext) return true;

        return existsSync(join(publicDir, `${base}${candidateExt}`));
      })
      .map((candidateExt) => ({
        src: `${dir}/${base}${candidateExt}`,
        type: VIDEO_MIME_TYPES[candidateExt],
      }));

    if (candidates.length > 0) return candidates;
  } catch {
    // Directory not found at build time
  }

  return [{ src: source, type: VIDEO_MIME_TYPES[ext] || "video/mp4" }];
}
