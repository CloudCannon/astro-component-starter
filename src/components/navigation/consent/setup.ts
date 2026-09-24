import { setupAllModals } from "@wrappers/modal/setup";
import { setupAnalytics } from "../../../integrations/consent/analytics";
import {
  analyticsConfigSchema,
  privacyConfigSchema,
  type AnalyticsConfig,
  type PrivacyConfig,
} from "../../../integrations/consent/config";
import { isAllowedExternalMediaUrl } from "../../../integrations/consent/externalMedia";
import { getConsentManager, type ConsentCategory } from "../../../integrations/consent/runtime";

let initialized = false;
let controlsBound = false;

// The docs example must not touch the live consent singleton, storage, or analytics loader.
function setupPreview(root: HTMLElement): void {
  if (root.hasAttribute("data-consent-preview-initialized")) return;

  root.setAttribute("data-consent-preview-initialized", "");
  root.hidden = false;
  setupAllModals();

  const finishChoice = (): void => {
    root.setAttribute("data-consent-decided", "");
    const banner = root.querySelector<HTMLElement>("[data-consent-banner]");

    if (banner) banner.hidden = true;
  };

  root.querySelectorAll<HTMLElement>("[data-consent-action]").forEach((control) => {
    control.addEventListener("click", () => {
      const action = control.dataset.consentAction;

      if (action === "accept-all" || action === "reject-all") {
        finishChoice();
        control.closest<HTMLElement>(".consent-popover")?.hidePopover();
      }
      if (action === "save") {
        finishChoice();
        root.querySelector<HTMLElement>(".consent-popover")?.hidePopover();
      }
    });
  });
}

function parseConfig(
  root: HTMLElement
): { privacy: PrivacyConfig; analytics: AnalyticsConfig } | null {
  try {
    const config = root.querySelector<HTMLElement>("[data-consent-config]");

    return {
      privacy: privacyConfigSchema.parse(JSON.parse(config?.dataset.consentConfig || "{}")),
      analytics: analyticsConfigSchema.parse(JSON.parse(config?.dataset.analyticsConfig || "{}")),
    };
  } catch {
    return null;
  }
}

function refresh(root: HTMLElement, privacy: PrivacyConfig): void {
  const manager = getConsentManager(privacy);
  const hasAnalytics =
    root.querySelector<HTMLElement>("[data-has-analytics]")?.dataset.hasAnalytics === "true";
  const banner = root.querySelector<HTMLElement>("[data-consent-banner]");

  root.toggleAttribute("data-consent-decided", manager.hasDecision);
  if (banner) {
    banner.hidden =
      manager.record.decisions.analytics !== "unset" || !hasAnalytics || !privacy.enabled;
  }

  root.querySelectorAll<HTMLInputElement>("[data-consent-category]").forEach((input) => {
    const category = input.dataset.consentCategory as ConsentCategory;

    input.checked = manager.isAllowed(category);
  });

  hydrateExternalMedia();

  if (!privacy.enabled) lockExternalMedia();
}

// With the workflow off, the enable button would write a decision that changes nothing.
function lockExternalMedia(): void {
  document.querySelectorAll<HTMLElement>("[data-external-media-enable]").forEach((button) => {
    const message = button.previousElementSibling;

    if (message instanceof HTMLElement) {
      message.textContent = "External content is unavailable on this site.";
    }

    button.remove();
  });
}

function hydrateExternalMedia(): void {
  const manager = window.siteConsent;

  if (!manager?.isAllowed("externalMedia")) {
    document
      .querySelectorAll<HTMLElement>("[data-external-media-src][data-external-media-mounted]")
      .forEach((placeholder) => {
        placeholder.replaceChildren(
          externalMediaFallback("Allow external media across this site to view this content.")
        );
        placeholder.removeAttribute("data-external-media-mounted");
      });
    document
      .querySelectorAll<HTMLTemplateElement>("template[data-unsafe-external-media]")
      .forEach((template) => {
        const host = template.nextElementSibling;

        if (!(host instanceof HTMLElement) || !host.hasAttribute("data-external-media-mounted"))
          return;
        host.replaceChildren(
          externalMediaFallback("Allow external media across this site to view this content.")
        );
        host.removeAttribute("data-external-media-mounted");
      });
    return;
  }

  document.querySelectorAll<HTMLElement>("[data-external-media-src]").forEach((placeholder) => {
    if (placeholder.hasAttribute("data-external-media-mounted")) return;
    const src = placeholder.dataset.externalMediaSrc;

    if (!src || !isAllowedExternalMediaUrl(src)) return;

    const iframe = document.createElement("iframe");

    iframe.src = src;
    iframe.title = placeholder.dataset.externalMediaTitle || "External content";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    placeholder.replaceChildren(iframe);
    placeholder.setAttribute("data-external-media-mounted", "");
  });

  document
    .querySelectorAll<HTMLTemplateElement>("template[data-unsafe-external-media]")
    .forEach((template) => {
      const host = template.nextElementSibling;

      if (!(host instanceof HTMLElement) || host.hasAttribute("data-external-media-mounted"))
        return;
      host.replaceChildren(sanitizedEmbedContent(template));
      host.setAttribute("data-external-media-mounted", "");
    });
}

function sanitizedEmbedContent(template: HTMLTemplateElement): DocumentFragment {
  const content = template.content.cloneNode(true) as DocumentFragment;

  content
    .querySelectorAll("script, style, link, object, embed")
    .forEach((element) => element.remove());

  content.querySelectorAll<HTMLElement>("*").forEach((element) => {
    [...element.attributes]
      .filter((attribute) => attribute.name.toLowerCase().startsWith("on"))
      .forEach((attribute) => element.removeAttribute(attribute.name));
  });

  content.querySelectorAll<HTMLIFrameElement>("iframe").forEach((iframe) => {
    if (!iframe.src || !isAllowedExternalMediaUrl(iframe.src)) {
      iframe.remove();
      return;
    }

    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-popups allow-presentation allow-same-origin"
    );
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
  });

  return content;
}

function externalMediaFallback(message: string): DocumentFragment {
  const content = document.createDocumentFragment();
  const paragraph = document.createElement("p");
  const button = document.createElement("button");

  paragraph.textContent = message;
  button.type = "button";
  button.textContent = "Allow all external media";
  button.setAttribute("data-external-media-enable", "");
  content.append(paragraph, button);

  return content;
}

function bind(root: HTMLElement, privacy: PrivacyConfig): void {
  const manager = getConsentManager(privacy);

  if (!controlsBound) {
    controlsBound = true;
    document.addEventListener("click", (event) => {
      const target = event.target as Element;

      if (target.closest("[data-external-media-enable]")) {
        manager.setDecision("externalMedia", "granted");
      }
    });
  }

  document.querySelectorAll<HTMLButtonElement>("[data-consent-open]").forEach((control) => {
    if (control.hasAttribute("data-consent-bound")) return;
    control.setAttribute("data-consent-bound", "");
    control.addEventListener("click", () => {
      root.querySelector<HTMLElement>(".consent-popover")?.showPopover();
    });
  });

  if (root.hasAttribute("data-consent-initialized")) return;
  root.setAttribute("data-consent-initialized", "");

  // Not a click handler: Customize opens via `popovertarget`. Resets boxes left ticked by an unsaved close.
  root.querySelector<HTMLElement>(".consent-popover")?.addEventListener("beforetoggle", (event) => {
    if ((event as ToggleEvent).newState === "open") refresh(root, privacy);
  });

  root.querySelectorAll<HTMLElement>("[data-consent-action]").forEach((control) => {
    control.addEventListener("click", () => {
      const action = control.dataset.consentAction;

      if (action === "accept-all" || action === "reject-all") {
        if (action === "accept-all") manager.acceptAll();
        if (action === "reject-all") manager.rejectAll();
        control.closest<HTMLElement>(".consent-popover")?.hidePopover();
      }
      if (action === "save") {
        root.querySelectorAll<HTMLInputElement>("[data-consent-category]").forEach((input) => {
          manager.setDecision(
            input.dataset.consentCategory as ConsentCategory,
            input.checked ? "granted" : "denied"
          );
        });
        root.querySelector<HTMLElement>(".consent-popover")?.hidePopover();
      }
    });
  });
}

export function setupAllConsent(): void {
  const roots = document.querySelectorAll<HTMLElement>(".consent");

  if (!roots.length || window.inEditorMode) return;

  roots.forEach((root) => {
    const config = parseConfig(root);

    if (!config) return;

    if (root.closest(".component-viewer")) {
      setupPreview(root);
      return;
    }

    root.hidden = !config.privacy.enabled;
    bind(root, config.privacy);
    setupAllModals();

    if (!initialized) {
      initialized = true;
      const manager = getConsentManager(config.privacy);

      manager.subscribe(() => {
        document.querySelectorAll<HTMLElement>(".consent").forEach((activeRoot) => {
          if (activeRoot.closest(".component-viewer")) return;
          refresh(activeRoot, config.privacy);
        });
      });
      setupAnalytics(config.analytics, config.privacy);
    }

    refresh(root, config.privacy);
  });
}
