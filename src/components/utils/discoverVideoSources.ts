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

function getExtension(filePath: string): string {
  const lastDot = filePath.lastIndexOf(".");
  const lastSlash = filePath.lastIndexOf("/");

  if (lastDot === -1 || lastDot < lastSlash) return "";
  return filePath.slice(lastDot);
}

function stripExtension(filePath: string): string {
  const ext = getExtension(filePath);

  return ext ? filePath.slice(0, -ext.length) : filePath;
}

function getDirectory(filePath: string): string {
  const lastSlash = filePath.lastIndexOf("/");

  return lastSlash === -1 ? "." : filePath.slice(0, lastSlash);
}

function getBasename(filePath: string): string {
  return filePath.slice(filePath.lastIndexOf("/") + 1);
}

/**
 * Given a video source path (relative to public/), finds all sibling files
 * with the same base name and a recognised video extension.
 * The selected source is always listed first so browsers prefer it.
 */
function fallback(source: string): VideoSource[] {
  const ext = getExtension(source).toLowerCase();

  return [{ src: source, type: VIDEO_MIME_TYPES[ext] || "video/mp4" }];
}

/**
 * Given a video source path (relative to public/), finds all sibling files
 * with the same base name and a recognised video extension.
 * The selected source is always listed first so browsers prefer it.
 *
 * Falls back to a single source entry when running client-side
 * (e.g. CloudCannon visual editor) where node:fs is unavailable.
 */
export async function discoverVideoSources(source: string): Promise<VideoSource[]> {
  let existsSync: typeof import("node:fs").existsSync;

  try {
    ({ existsSync } = await import("node:fs"));
  } catch {
    return fallback(source);
  }

  const ext = getExtension(source).toLowerCase();
  const dir = getDirectory(source);
  const base = getBasename(stripExtension(source));
  const publicDir = `${process.cwd()}/public/${dir}`;

  try {
    const candidates = Object.keys(VIDEO_MIME_TYPES)
      .filter((candidateExt) => {
        if (candidateExt === ext) return true;
        return existsSync(`${publicDir}/${base}${candidateExt}`);
      })
      .map((candidateExt) => ({
        src: `${dir}/${base}${candidateExt}`,
        type: VIDEO_MIME_TYPES[candidateExt],
      }));

    if (candidates.length > 0) return candidates;
  } catch {
    // fall through
  }

  return fallback(source);
}
