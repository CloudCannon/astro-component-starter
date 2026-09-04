/**
 * Video behaviour for `VideoModal.astro`: inject the embed iframe on open,
 * tear it down on close, and close on a click outside the player.
 *
 * Registered in `editor-live-sync.js` — without it the iframe is never
 * injected in the CloudCannon editor and the modal opens empty.
 *
 * Keyed on `.modal-popover`, not the `.video-modal` root: the root survives an
 * editor re-render while its contents are replaced, so a guard flag on the
 * root would leave the new popover uninitialised.
 *
 * Focus trapping, scroll lock and focus return come from `modal/setup.ts` on
 * the same element.
 */
function openVideo(popover: HTMLElement): void {
  const localVideo = popover.querySelector<HTMLVideoElement>(".video-modal-player");

  if (localVideo) {
    localVideo.play().catch(() => {});
    return;
  }

  const body = popover.querySelector<HTMLElement>(".video-modal-body");
  const embedContainer = popover.querySelector<HTMLElement>(".video-modal-embed");
  const embedSrc = body?.dataset.videoEmbedSrc;

  if (!embedContainer || !embedSrc) return;

  const iframe = document.createElement("iframe");

  iframe.src = embedSrc;
  iframe.title = body?.dataset.videoTitle || "";
  iframe.allow = "autoplay; fullscreen; picture-in-picture";
  iframe.allowFullscreen = true;
  embedContainer.replaceChildren(iframe);
}

function closeVideo(popover: HTMLElement): void {
  const localVideo = popover.querySelector<HTMLVideoElement>(".video-modal-player");

  if (localVideo) {
    localVideo.pause();
    localVideo.currentTime = 0;
    return;
  }

  // Removing the iframe is what stops playback — a hidden popover keeps its
  // subtree alive, so a YouTube embed left in place goes on playing audio.
  popover.querySelector<HTMLElement>(".video-modal-embed")?.replaceChildren();
}

export function setupVideoModal(popover: HTMLElement): void {
  if (popover.hasAttribute("data-video-modal-initialized")) return;
  popover.setAttribute("data-video-modal-initialized", "");

  popover.addEventListener("toggle", (e) => {
    // Read the source at open time rather than at setup: an editor changing
    // the video id replaces `.video-modal-body`, and a value captured here
    // would go stale.
    if ((e as ToggleEvent).newState === "open") {
      openVideo(popover);
    } else {
      closeVideo(popover);
    }
  });

  // The overlay fills the viewport, so the popover API's light dismiss never
  // fires — a click on the dark surround closes instead. Clicks on the player
  // or the close control stay inside the chrome.
  popover.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (target.closest(".modal-body") || target.closest(".modal-close")) return;

    popover.hidePopover();
  });
}

export function setupAllVideoModals(root: ParentNode = document): void {
  root
    .querySelectorAll<HTMLElement>(".video-modal .modal-popover")
    .forEach((el) => setupVideoModal(el));
}
