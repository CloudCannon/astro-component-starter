import { externalMediaProvider, sanitizeEmbed } from "./externalMedia";

function note(text: string): HTMLParagraphElement {
  const paragraph = document.createElement("p");

  paragraph.textContent = text;
  return paragraph;
}

/** Embed HTML as the editor shows it: sanitized, with each iframe replaced by a label. Browser only. */
export function embedPreviewHtml(html: string): string {
  const template = document.createElement("template");
  const box = document.createElement("div");

  template.innerHTML = html;

  const { content, rejected } = sanitizeEmbed(template);

  content.querySelectorAll("iframe").forEach((iframe) => {
    iframe.replaceWith(
      note(`${externalMediaProvider(iframe.src)} content shows on the published page.`)
    );
  });
  rejected.forEach((provider) => {
    content.append(
      note(`An iframe from ${provider} was removed. Embeds load iframes from HTTPS addresses only.`)
    );
  });
  if (!content.textContent?.trim() && !content.querySelector("img, svg, video")) {
    content.append(note("Add HTML to this Embed in its settings."));
  }
  box.append(content);
  return box.innerHTML;
}

export function mapPreviewText(src: string): string {
  return `${externalMediaProvider(src)} map shows on the published page.`;
}

/** Labels the embeds and maps on the page the editor first loads, which the consent runtime never mounts. */
export function previewExternalMedia(root: ParentNode = document): void {
  root
    .querySelectorAll<HTMLTemplateElement>("template[data-unsafe-external-media]")
    .forEach((template) => {
      const host = template.nextElementSibling;

      if (!(host instanceof HTMLElement) || host.hasAttribute("data-external-media-preview"))
        return;
      host.innerHTML = embedPreviewHtml(template.innerHTML);
      host.setAttribute("data-external-media-preview", "");
    });

  root
    .querySelectorAll<HTMLElement>("[data-external-media-src]:not([data-external-media-preview])")
    .forEach((host) => {
      host.replaceChildren(note(mapPreviewText(host.dataset.externalMediaSrc ?? "")));
      host.setAttribute("data-external-media-preview", "");
    });
}
