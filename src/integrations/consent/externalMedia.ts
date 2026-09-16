const allowedEmbedPaths: Record<string, RegExp> = {
  "www.youtube-nocookie.com": /^\/embed\/[^/]+\/?$/,
  "player.vimeo.com": /^\/video\/[^/]+\/?$/,
  "maps.google.com": /^\/maps\/embed\/?$/,
  "www.google.com": /^\/maps\/embed\/?$/,
  "www.openstreetmap.org": /^\/export\/embed\.html$/,
};

export function isAllowedExternalMediaUrl(value: string): boolean {
  try {
    const url = new URL(value);

    const allowedPath = allowedEmbedPaths[url.hostname];

    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === "443") &&
      Boolean(allowedPath?.test(url.pathname))
    );
  } catch {
    return false;
  }
}
