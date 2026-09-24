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
  if (!window.siteConsent?.isAllowed("externalMedia")) {
    renderConsentPrompt(embedContainer);
    return;
  }

  const iframe = document.createElement("iframe");

  iframe.src = embedSrc;
  iframe.title = body?.dataset.videoTitle || "";
  iframe.allow = "autoplay; fullscreen; picture-in-picture";
  iframe.allowFullscreen = true;
  embedContainer.replaceChildren(iframe);
}

function renderConsentPrompt(container: HTMLElement): void {
  const message = document.createElement("p");
  const button = document.createElement("button");
  const prompt = document.createElement("div");

  prompt.className = "video-modal-consent";
  message.textContent = "Allow external media across this site to play this video.";
  button.type = "button";
  button.textContent = "Allow all external media";
  button.setAttribute("data-external-media-enable", "");
  prompt.append(message, button);
  container.replaceChildren(prompt);
}

function closeVideo(popover: HTMLElement): void {
  const localVideo = popover.querySelector<HTMLVideoElement>(".video-modal-player");

  if (localVideo) {
    localVideo.pause();
    localVideo.currentTime = 0;
    return;
  }

  // A hidden popover keeps its subtree alive, so an embed left in place keeps playing.
  const container = popover.querySelector<HTMLElement>(".video-modal-embed");

  if (container) renderConsentPrompt(container);
}

// Flag the popover, not the `.video-modal` root: the root survives an editor re-render.
export function setupVideoModal(popover: HTMLElement): void {
  if (popover.hasAttribute("data-video-modal-initialized")) return;
  popover.setAttribute("data-video-modal-initialized", "");

  popover.addEventListener("toggle", (e) => {
    // Read the source at open time: an editor edit replaces `.video-modal-body`.
    if ((e as ToggleEvent).newState === "open") {
      openVideo(popover);
    } else {
      closeVideo(popover);
    }
  });

  // The overlay fills the viewport, so the popover's light dismiss never fires.
  popover.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (target.closest(".modal-body") || target.closest(".modal-close")) return;

    popover.hidePopover();
  });
}

let consentListenerBound = false;

export function setupAllVideoModals(root: ParentNode = document): void {
  if (!consentListenerBound) {
    consentListenerBound = true;
    window.addEventListener("site-consent-change", () => {
      document
        .querySelectorAll<HTMLElement>(".video-modal [data-modal]:popover-open")
        .forEach((popover) => openVideo(popover));
    });
  }

  root
    .querySelectorAll<HTMLElement>(".video-modal [data-modal]")
    .forEach((el) => setupVideoModal(el));
}
