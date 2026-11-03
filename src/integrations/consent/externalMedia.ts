const allowedEmbedPaths: Record<string, RegExp> = {
  "www.youtube-nocookie.com": /^\/embed\/[^/]+\/?$/,
  "player.vimeo.com": /^\/video\/[^/]+\/?$/,
  "maps.google.com": /^\/maps\/embed\/?$/,
  "www.google.com": /^\/maps\/embed\/?$/,
  "www.openstreetmap.org": /^\/export\/embed\.html$/,
};

const providerNames: Record<string, string> = {
  "www.youtube-nocookie.com": "YouTube",
  "player.vimeo.com": "Vimeo",
  "maps.google.com": "Google Maps",
  "www.google.com": "Google Maps",
  "www.openstreetmap.org": "OpenStreetMap",
};

const youtubeHosts = new Set(["www.youtube.com", "youtube.com"]);

function httpsUrl(value: string): URL | null {
  try {
    const url = new URL(value);

    if (
      youtubeHosts.has(url.hostname) &&
      allowedEmbedPaths["www.youtube-nocookie.com"].test(url.pathname)
    ) {
      url.hostname = "www.youtube-nocookie.com";
      url.searchParams.delete("si");
    }

    const safe =
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === "443");

    return safe ? url : null;
  } catch {
    return null;
  }
}

/** A map or player URL on a known provider's embed path, or null. YouTube's share code is moved to Privacy Enhanced Mode. */
export function allowedExternalMediaUrl(value: string): string | null {
  const url = httpsUrl(value);

  return url && allowedEmbedPaths[url.hostname]?.test(url.pathname) ? url.href : null;
}

/** The URL an Embed's iframe may load: any HTTPS page, with YouTube's share code moved to Privacy Enhanced Mode. */
export function embedIframeUrl(value: string): string | null {
  return httpsUrl(value)?.href ?? null;
}

export function isAllowedExternalMediaUrl(value: string): boolean {
  return allowedExternalMediaUrl(value) !== null;
}

export function externalMediaProvider(value: string): string {
  try {
    const { hostname } = new URL(value);

    return providerNames[hostname] ?? (hostname || "an external site");
  } catch {
    return "an external site";
  }
}

/** Embed HTML with scripts, handlers and non-HTTPS iframes removed; `rejected` lists the iframe sources dropped. */
export function sanitizeEmbed(template: HTMLTemplateElement): {
  content: DocumentFragment;
  rejected: string[];
} {
  const content = template.content.cloneNode(true) as DocumentFragment;
  const rejected: string[] = [];

  content
    .querySelectorAll("script, style, link, object, embed")
    .forEach((element) => element.remove());

  content.querySelectorAll<HTMLElement>("*").forEach((element) => {
    [...element.attributes]
      .filter((attribute) => attribute.name.toLowerCase().startsWith("on"))
      .forEach((attribute) => element.removeAttribute(attribute.name));
  });

  content.querySelectorAll<HTMLIFrameElement>("iframe").forEach((iframe) => {
    const src = iframe.getAttribute("src") ?? "";
    const allowed = embedIframeUrl(src);

    if (!allowed) {
      rejected.push(externalMediaProvider(src));
      iframe.remove();
      return;
    }

    iframe.src = allowed;
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-popups allow-presentation allow-same-origin"
    );
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
  });

  return { content, rejected };
}
