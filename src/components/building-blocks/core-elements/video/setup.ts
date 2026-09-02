/**
 * YouTube/Vimeo custom elements and autoplay repair for Video.
 *
 * Used by:
 * - `Video.astro`'s inline `<script>` on the live site
 * - `editor-live-sync.js` in the CloudCannon editor, where inline scripts
 *   don't run
 * - `VideoElements.astro` on isolated preview shells that may inject those
 *   tags without going through Video.astro
 *
 * Facade libraries are loaded only when a matching custom element is on the
 * page (`lite-vimeo` / `lite-youtube`). Vite splits those into their own
 * chunks; this file stays one module.
 */

function containsSelector(root: ParentNode, selector: string): boolean {
  return (
    (root instanceof Element && root.matches(selector)) || Boolean(root.querySelector?.(selector))
  );
}

const facadeLoaded = { vimeo: false, youtube: false };

function defineUsedVideoElements(root: ParentNode = document): void {
  if (!facadeLoaded.vimeo && containsSelector(root, "lite-vimeo")) {
    facadeLoaded.vimeo = true;
    void import("@choctawnationofoklahoma/lite-vimeo");
  }

  if (!facadeLoaded.youtube && containsSelector(root, "lite-youtube")) {
    facadeLoaded.youtube = true;
    void import("@justinribeiro/lite-youtube");
  }
}

/**
 * Strips autoplay from hosted embeds for a reduced-motion visitor. Runs before
 * `defineUsedVideoElements` on purpose: until the facade library is imported
 * the custom elements are inert, so their attributes are still free to change.
 */
function disarmHostedAutoplay(root: ParentNode = document): void {
  const scope = (selector: string) => [
    ...(root instanceof Element && root.matches(selector) ? [root] : []),
    ...Array.from(root.querySelectorAll(selector)),
  ];

  scope("lite-vimeo[autoload], lite-youtube[autoplay]").forEach((embed) => {
    embed.removeAttribute("autoload");
    embed.removeAttribute("autoplay");
  });

  scope('iframe.video-embed[src*="autoplay=1"]').forEach((embed) => {
    const iframe = embed as HTMLIFrameElement;

    iframe.src = iframe.src.replace("autoplay=1", "autoplay=0");
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
  // load() alone isn't enough in Firefox: the <source> nodes themselves
  // can carry over a failed-selection state from the view-transition
  // swap, so replace them with fresh nodes (no prior loading history)
  // before retrying.
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

  // A <video> adopted via a view-transition swap can end up genuinely
  // stuck (Firefox: "All candidate resources failed to load", without
  // ever setting video.error). By the time this runs the browser has
  // usually already tried and failed, so the synchronous check catches
  // it with no added delay; the one deferred recheck covers a failure
  // that lands moments later. Repair only on confirmed failure — a
  // video whose load is merely still in flight would be aborted by an
  // unconditional load() (seen in Chrome).
  if (isBroken(video)) {
    repairAndPlay(video);
    return;
  }

  setTimeout(() => {
    if (isBroken(video)) repairAndPlay(video);
  }, 2000);
}

function playAutoplayVideos(root: ParentNode = document) {
  // This repair calls play() directly, which the global reduced-motion CSS
  // reset cannot reach — a visitor who asked for no motion gets no autoplay.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Not scoped under a ".video" ancestor: the "video" class sits directly
  // on the <video> tag itself except for the background-media variant, so
  // a ".video video[autoplay]" descendant selector silently misses every
  // other case (vimeo, youtube, and the plain native <video>).
  const videos = [
    ...(root instanceof Element && root.matches("video[autoplay]")
      ? [root as HTMLVideoElement]
      : []),
    ...Array.from(root.querySelectorAll<HTMLVideoElement>("video[autoplay]")),
  ].filter((video) => !video.hasAttribute("data-video-autoplay-initialized"));

  if (!videos.length) return;

  // Waiting until the video is actually scrolled into view gives the
  // browser plenty of time to settle before we touch it, and naturally
  // matches when the user would expect to see it play.
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

  defineUsedVideoElements(root);
  playAutoplayVideos(root);
}
