const allowedEmbedHosts = new Set([
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "maps.google.com",
  "www.google.com",
  "www.openstreetmap.org",
]);

export function isAllowedExternalMediaUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "https:" && allowedEmbedHosts.has(url.hostname);
  } catch {
    return false;
  }
}
