/** Hosted-video consent hydration and autoplay repair for Video. */

function hydrateHostedVideos(root: ParentNode = document): void {
  if (window.inEditorMode) return;

  if (!window.siteConsent?.isAllowed("externalMedia")) {
    resetHostedVideos(root);
    return;
  }

  const hosted = [
    ...(root instanceof HTMLElement && root.matches("[data-hosted-video]") ? [root] : []),
    ...Array.from(root.querySelectorAll<HTMLElement>("[data-hosted-video]")),
  ];

  hosted.forEach((container) => {
    if (container.hasAttribute("data-hosted-video-mounted")) return;
    const type = container.dataset.videoType;
    const id = container.dataset.videoId;

    if (!id || (type !== "youtube" && type !== "vimeo")) return;

    const autoplay = container.dataset.videoAutoplay === "true";
    const loop = container.dataset.videoLoop === "true";
    const params = new URLSearchParams();

    if (autoplay) {
      params.set("autoplay", "1");
      params.set("mute", "1");
      params.set("playsinline", "1");
    }
    if (loop && type === "youtube") {
      params.set("loop", "1");
      params.set("playlist", id);
    }
    if (loop && type === "vimeo") params.set("loop", "1");

    const iframe = document.createElement("iframe");

    iframe.src =
      type === "youtube"
        ? `https://www.youtube-nocookie.com/embed/${id}?${params}`
        : `https://player.vimeo.com/video/${id}?${params}`;
    iframe.title = container.dataset.videoTitle || "Video";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    container.replaceChildren(iframe);
    container.setAttribute("data-hosted-video-mounted", "");
  });
}

function resetHostedVideos(root: ParentNode = document): void {
  const hosted = [
    ...(root instanceof HTMLElement && root.matches("[data-hosted-video]") ? [root] : []),
    ...Array.from(root.querySelectorAll<HTMLElement>("[data-hosted-video]")),
  ];

  hosted.forEach((container) => {
    if (!container.hasAttribute("data-hosted-video-mounted")) return;
    const message = document.createElement("p");
    const button = document.createElement("button");
    const link = document.createElement("a");
    const type = container.dataset.videoType;
    const id = container.dataset.videoId;

    message.textContent = "Enable external media to play this video.";
    button.type = "button";
    button.textContent = "Enable video";
    button.setAttribute("data-external-media-enable", "");
    link.href =
      type === "youtube" ? `https://www.youtube.com/watch?v=${id}` : `https://vimeo.com/${id}`;
    link.textContent = `Watch on ${type === "youtube" ? "YouTube" : "Vimeo"}`;
    container.replaceChildren(message, button, link);
    container.removeAttribute("data-hosted-video-mounted");
  });
}

function disarmHostedAutoplay(root: ParentNode = document): void {
  const scope = (selector: string) => [
    ...(root instanceof Element && root.matches(selector) ? [root] : []),
    ...Array.from(root.querySelectorAll(selector)),
  ];

  scope('[data-hosted-video][data-video-autoplay="true"]').forEach((embed) => {
    embed.setAttribute("data-video-autoplay", "false");
  });
}

function isBroken(video: HTMLVideoElement) {
  return (
    Boolean(video.error) ||
    video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE ||
    (video.paused && video.readyState === HTMLMediaElement.HAVE_NOTHING)
  );
}

function repairAndPlay(video: HTMLVideoElement) {
  video.querySelectorAll("source").forEach((source) => {
    const fresh = document.createElement("source");

    fresh.src = source.src;
    fresh.type = source.type;
    source.replaceWith(fresh);
  });

  video.load();
  video.play().catch(() => {});
}

function tryPlay(video: HTMLVideoElement) {
  video.play().catch(() => {});
  if (isBroken(video)) {
    repairAndPlay(video);
    return;
  }
  setTimeout(() => {
    if (isBroken(video)) repairAndPlay(video);
  }, 2000);
}

function playAutoplayVideos(root: ParentNode = document) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const videos = [
    ...(root instanceof Element && root.matches("video[autoplay]")
      ? [root as HTMLVideoElement]
      : []),
    ...Array.from(root.querySelectorAll<HTMLVideoElement>("video[autoplay]")),
  ].filter((video) => !video.hasAttribute("data-video-autoplay-initialized"));

  if (!videos.length) return;
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const video = entry.target as HTMLVideoElement;

        if (video.paused) tryPlay(video);
        obs.unobserve(video);
      });
    },
    { threshold: 0.1 }
  );

  videos.forEach((video) => {
    video.setAttribute("data-video-autoplay-initialized", "");
    observer.observe(video);
  });
}

export function setupAllVideos(root: ParentNode = document): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    disarmHostedAutoplay(root);
  }
  hydrateHostedVideos(root);
  playAutoplayVideos(root);
}

window.addEventListener("site-consent-change", () => hydrateHostedVideos());
document.addEventListener("astro:page-load", () => hydrateHostedVideos());
